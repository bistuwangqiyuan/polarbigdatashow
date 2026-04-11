'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const DEFAULT_CAMS = [
  { id: 'cam1', label: '摄像头 1', url: '/api/stream-proxy/stream.m3u8?txSecret=d22f41b43c22c209bd2bf361aec00ebe&txTime=69DB86F4' },
  { id: 'cam2', label: '摄像头 2', url: '/api/stream-proxy/stream.m3u8?txSecret=d22f41b43c22c209bd2bf361aec00ebe&txTime=69DB86F4' },
  { id: 'cam3', label: '摄像头 3', url: '/api/stream-proxy/stream.m3u8?txSecret=d22f41b43c22c209bd2bf361aec00ebe&txTime=69DB86F4' },
  { id: 'cam4', label: '摄像头 4', url: '/api/stream-proxy/stream.m3u8?txSecret=d22f41b43c22c209bd2bf361aec00ebe&txTime=69DB86F4' },
]

const CAPTURE_INTERVAL_MS = 10_000
const MAX_CONCURRENT_ANALYSIS = 2

const PROXY_HOST = 'aczv.asia'

function severityColor(sev) {
  if (sev === 'high') return '#f87171'
  if (sev === 'medium') return '#fbbf24'
  if (sev === 'low') return '#22d3ee'
  return '#4ade80'
}

function severityBadgeClass(sev) {
  if (sev === 'high') return 'text-danger border-danger/50 bg-danger/10'
  if (sev === 'medium') return 'text-warning border-warning/50 bg-warning/10'
  if (sev === 'low') return 'text-primary border-primary/50 bg-primary/10'
  return 'text-success border-success/50 bg-success/10'
}

function resolveStreamUrl(rawUrl) {
  if (!rawUrl) return { playUrl: rawUrl, type: 'unknown', badge: '' }

  if (/^webrtc:\/\//i.test(rawUrl)) {
    return { playUrl: rawUrl, type: 'webrtc', badge: 'WebRTC' }
  }

  if (/^rtmp:\/\//i.test(rawUrl)) {
    try {
      const parsed = new URL(rawUrl.replace(/^rtmp:/i, 'http:'))
      const flvUrl = `${parsed.origin}${parsed.pathname}.flv`
      const resolved = resolveStreamUrl(flvUrl)
      return { ...resolved, badge: 'RTMP→FLV' }
    } catch {
      return { playUrl: rawUrl, type: 'unknown', badge: 'RTMP' }
    }
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      const parsed = new URL(rawUrl)
      if (parsed.hostname === PROXY_HOST && parsed.pathname.startsWith('/live/')) {
        const suffix = parsed.pathname.slice('/live'.length) + parsed.search
        const proxyPath = '/api/stream-proxy' + suffix
        if (/\.m3u8(\?|$)/i.test(rawUrl)) return { playUrl: proxyPath, type: 'hls', badge: 'HLS' }
        return { playUrl: proxyPath, type: 'flv', badge: 'FLV' }
      }
    } catch {}
    if (/\.m3u8(\?|$)/i.test(rawUrl)) return { playUrl: rawUrl, type: 'hls', badge: 'HLS' }
    return { playUrl: rawUrl, type: 'flv', badge: 'FLV' }
  }

  if (/\.m3u8(\?|$)/i.test(rawUrl)) return { playUrl: rawUrl, type: 'hls', badge: 'HLS' }
  if (/\.flv(\?|$)/i.test(rawUrl)) return { playUrl: rawUrl, type: 'flv', badge: 'FLV' }
  if (rawUrl.startsWith('/api/stream-proxy/')) {
    if (/\.m3u8(\?|$)/i.test(rawUrl)) return { playUrl: rawUrl, type: 'hls', badge: 'HLS' }
    if (/\.flv(\?|$)/i.test(rawUrl)) return { playUrl: rawUrl, type: 'flv', badge: 'FLV' }
    return { playUrl: rawUrl, type: 'hls', badge: 'HLS' }
  }
  return { playUrl: rawUrl, type: 'flv', badge: '' }
}

async function startWebRTC(videoEl, rawUrl) {
  const parsed = new URL(rawUrl.replace(/^webrtc:/i, 'http:'))

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  })
  pc.addTransceiver('audio', { direction: 'recvonly' })
  pc.addTransceiver('video', { direction: 'recvonly' })

  pc.ontrack = (event) => {
    if (event.streams?.[0]) videoEl.srcObject = event.streams[0]
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  const apiUrl = `/rtc/v1/play/`
  const streamurl = `webrtc://${parsed.host}${parsed.pathname}`
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api: apiUrl, streamurl, clientip: null, sdp: offer.sdp }),
  })

  if (!res.ok) throw new Error(`WebRTC 信令失败: HTTP ${res.status}`)
  const data = await res.json()
  if (data.code !== 0) throw new Error(`SRS 错误: code=${data.code}`)

  await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }))
  return pc
}

export default function StreamMonitor() {
  const [cameras, setCameras] = useState(() =>
    DEFAULT_CAMS.map((c) => ({ ...c }))
  )
  const [monitoring, setMonitoring] = useState(false)
  const [showConfig, setShowConfig] = useState(true)
  const [interval, setInterval_] = useState(CAPTURE_INTERVAL_MS / 1000)

  const camStates = useRef(new Map())
  const [, forceRender] = useState(0)
  const rerender = useCallback(() => forceRender((n) => n + 1), [])

  const getCamState = useCallback((id) => {
    if (!camStates.current.has(id)) {
      camStates.current.set(id, {
        status: 'idle',
        player: null,
        captureTimer: null,
        lastFrame: null,
        report: null,
        error: null,
        analyzeCount: 0,
        protoBadge: '',
      })
    }
    return camStates.current.get(id)
  }, [])

  const analysisQueue = useRef(0)

  const captureFrame = useCallback((videoEl) => {
    if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0) return null
    const canvas = document.createElement('canvas')
    const w = Math.min(videoEl.videoWidth, 1280)
    const h = Math.round((w / videoEl.videoWidth) * videoEl.videoHeight)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoEl, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  const analyzeFrame = useCallback(
    async (camId, dataUrl) => {
      if (analysisQueue.current >= MAX_CONCURRENT_ANALYSIS) return
      analysisQueue.current++
      const cs = getCamState(camId)
      cs.status = 'analyzing'
      cs.lastFrame = dataUrl
      rerender()

      try {
        const res = await fetch('/api/pv-fault-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl, mimeType: 'image/jpeg' }),
        })
        const j = await res.json()
        if (j?.ok && j?.report) {
          cs.report = j.report
          cs.error = null
        } else {
          cs.report = null
          cs.error = j?.message || j?.code || 'unknown'
        }
        cs.analyzeCount++
      } catch (e) {
        cs.error = e?.message || 'fetch error'
        cs.report = null
      } finally {
        cs.status = 'playing'
        analysisQueue.current--
        rerender()
      }
    },
    [getCamState, rerender]
  )

  const startCamera = useCallback(
    async (cam) => {
      const cs = getCamState(cam.id)
      if (cs.player) return

      const { playUrl, type, badge } = resolveStreamUrl(cam.url)
      cs.status = 'connecting'
      cs.error = null
      cs.protoBadge = badge
      rerender()

      const videoEl = document.getElementById(`stream-video-${cam.id}`)
      if (!videoEl) return

      try {
        if (type === 'webrtc') {
          const pc = await startWebRTC(videoEl, playUrl)
          videoEl.addEventListener('playing', () => { cs.status = 'playing'; cs.error = null; rerender() })
          pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
              cs.status = 'error'; cs.error = `WebRTC ${pc.connectionState}`; rerender()
            }
          }
          cs.player = { type: 'webrtc', instance: pc }
          videoEl.play().catch(() => {})
        } else if (type === 'hls') {
          if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            videoEl.src = playUrl
            videoEl.play().catch(() => {})
            videoEl.addEventListener('playing', () => { cs.status = 'playing'; cs.error = null; rerender() })
            videoEl.addEventListener('error', () => { cs.status = 'error'; cs.error = 'HLS 播放错误'; rerender() })
            cs.player = { type: 'native' }
          } else {
            const Hls = (await import('hls.js')).default
            if (!Hls.isSupported()) {
              cs.status = 'error'; cs.error = '浏览器不支持 HLS'; rerender(); return
            }
            const hls = new Hls({
              liveSyncDurationCount: 3,
              liveMaxLatencyDurationCount: 6,
              maxBufferLength: 10,
              enableWorker: true,
            })
            hls.loadSource(playUrl)
            hls.attachMedia(videoEl)
            hls.on(Hls.Events.MANIFEST_PARSED, () => { videoEl.play().catch(() => {}) })
            hls.on(Hls.Events.ERROR, (_e, data) => {
              if (data.fatal) {
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
                else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
                else { cs.status = 'error'; cs.error = `${data.type}: ${data.details}`; rerender() }
              }
            })
            videoEl.addEventListener('playing', () => { cs.status = 'playing'; cs.error = null; rerender() })
            cs.player = { type: 'hls', instance: hls }
          }
        } else {
          const mpegts = (await import('mpegts.js')).default
          if (!mpegts.isSupported()) {
            cs.status = 'error'; cs.error = '浏览器不支持 MSE'; rerender(); return
          }
          const player = mpegts.createPlayer(
            { type: 'flv', isLive: true, url: playUrl },
            {
              enableWorker: true,
              liveBufferLatencyChasing: true,
              liveBufferLatencyMaxLatency: 5,
              liveBufferLatencyMinRemain: 0.5,
              autoCleanupSourceBuffer: true,
              lazyLoadMaxDuration: 30,
              deferLoadAfterSourceOpen: false,
            }
          )
          player.attachMediaElement(videoEl)
          player.load()
          player.play().catch(() => {})
          player.on(mpegts.Events.ERROR, (errType, errDetail) => {
            console.warn(`[${cam.id}] mpegts error:`, errType, errDetail)
            if (errType === 'NetworkError') {
              setTimeout(() => { try { player.unload(); player.load(); player.play().catch(() => {}) } catch {} }, 3000)
            } else {
              cs.error = `${errType}: ${errDetail}`; cs.status = 'error'; rerender()
            }
          })
          player.on(mpegts.Events.LOADING_COMPLETE, () => { cs.status = 'ended'; rerender() })
          videoEl.addEventListener('playing', () => { cs.status = 'playing'; cs.error = null; rerender() })
          cs.player = { type: 'mpegts', instance: player }
        }

        const intervalMs = (interval || 10) * 1000
        cs.captureTimer = window.setInterval(() => {
          const frame = captureFrame(videoEl)
          if (frame) analyzeFrame(cam.id, frame)
        }, intervalMs)

        rerender()
      } catch (e) {
        cs.status = 'error'
        cs.error = e?.message || 'init error'
        rerender()
      }
    },
    [getCamState, rerender, captureFrame, analyzeFrame, interval]
  )

  const stopCamera = useCallback((camId) => {
    const cs = getCamState(camId)
    if (cs.captureTimer) { clearInterval(cs.captureTimer); cs.captureTimer = null }
    if (cs.player) {
      try {
        if (cs.player.type === 'mpegts') {
          cs.player.instance.pause(); cs.player.instance.unload()
          cs.player.instance.detachMediaElement(); cs.player.instance.destroy()
        } else if (cs.player.type === 'hls') {
          cs.player.instance.stopLoad(); cs.player.instance.detachMedia(); cs.player.instance.destroy()
        } else if (cs.player.type === 'webrtc') {
          cs.player.instance.close()
          const v = document.getElementById(`stream-video-${camId}`)
          if (v) { v.srcObject = null }
        } else if (cs.player.type === 'native') {
          const v = document.getElementById(`stream-video-${camId}`)
          if (v) { v.pause(); v.removeAttribute('src'); v.load() }
        }
      } catch {}
      cs.player = null
    }
    cs.status = 'idle'
    rerender()
  }, [getCamState, rerender])

  const startAll = useCallback(() => {
    setMonitoring(true); setShowConfig(false)
    cameras.forEach((cam) => startCamera(cam))
  }, [cameras, startCamera])

  const stopAll = useCallback(() => {
    setMonitoring(false)
    cameras.forEach((cam) => stopCamera(cam.id))
  }, [cameras, stopCamera])

  useEffect(() => {
    return () => { cameras.forEach((cam) => stopCamera(cam.id)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateCamUrl = useCallback((idx, url) => {
    setCameras((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], url }
      return next
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {!monitoring ? (
          <button type="button" onClick={startAll}
            className="px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-medium text-sm">
            开始监控
          </button>
        ) : (
          <button type="button" onClick={stopAll}
            className="px-5 py-2.5 rounded-xl bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 font-medium text-sm">
            停止监控
          </button>
        )}
        <button type="button" onClick={() => setShowConfig((v) => !v)}
          className="px-4 py-2.5 rounded-xl border border-neutral-600 text-neutral-400 hover:text-neutral-200 text-sm">
          {showConfig ? '收起配置' : '流地址配置'}
        </button>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          截帧间隔
          <input type="number" min={5} max={120} value={interval}
            onChange={(e) => setInterval_(Number(e.target.value) || 10)}
            disabled={monitoring}
            className="w-16 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs text-center" />
          秒
        </label>
        {monitoring && <span className="text-xs text-success animate-pulse">● 监控中</span>}
      </div>

      {showConfig && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
          <p className="text-xs text-neutral-500">
            支持 FLV / HLS / RTMP / WebRTC 四种协议，自动识别并选择最佳播放方式。
            RTMP 地址自动转换为 FLV 播放；WebRTC 通过 SRS 信令 API 连接。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cameras.map((cam, i) => {
              const { badge } = resolveStreamUrl(cam.url)
              return (
                <div key={cam.id} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-16 shrink-0">{cam.label}</span>
                  <input type="text" value={cam.url}
                    onChange={(e) => updateCamUrl(i, e.target.value)}
                    disabled={monitoring}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono disabled:opacity-50"
                    placeholder="http://aczv.asia/live/stream.flv" />
                  {badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">{badge}</span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => (
          <CameraPanel key={cam.id} cam={cam} state={getCamState(cam.id)} />
        ))}
      </div>
    </div>
  )
}

function CameraPanel({ cam, state }) {
  const statusLabel = {
    idle: '未连接', connecting: '连接中…', playing: '播放中',
    analyzing: '识别中…', error: '连接失败', ended: '流已断开',
  }
  const statusColor = {
    idle: 'text-neutral-500', connecting: 'text-warning animate-pulse',
    playing: 'text-success', analyzing: 'text-primary animate-pulse',
    error: 'text-danger', ended: 'text-neutral-500',
  }

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-200 font-medium">{cam.label}</span>
          {state.protoBadge && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-primary/15 text-primary/80 font-mono">{state.protoBadge}</span>
          )}
          <span className={`text-[10px] ${statusColor[state.status] || 'text-neutral-500'}`}>
            {statusLabel[state.status] || state.status}
          </span>
        </div>
        {state.report && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${severityBadgeClass(state.report.severity)}`}>
            {state.report.severity}
          </span>
        )}
      </div>

      <div className="relative aspect-video bg-black">
        <video id={`stream-video-${cam.id}`} autoPlay muted playsInline
          className="w-full h-full object-contain" />

        {state.lastFrame && state.report?.annotations?.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {state.report.annotations.map((a, i) => (
              <g key={i}>
                <rect x={a.box.x * 100} y={a.box.y * 100}
                  width={a.box.w * 100} height={a.box.h * 100}
                  fill="rgba(0,212,255,0.06)" stroke={severityColor(a.severity)}
                  strokeWidth={0.55} vectorEffect="non-scaling-stroke" />
                <text x={a.box.x * 100 + 0.5} y={a.box.y * 100 - 0.5}
                  fill={severityColor(a.severity)} fontSize="2.5" fontFamily="sans-serif">
                  {a.labelZh}
                </text>
              </g>
            ))}
          </svg>
        )}

        {state.status === 'analyzing' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-primary text-xs animate-pulse">截帧识别中…</span>
          </div>
        )}
        {state.status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-neutral-600 text-xs">等待连接</span>
          </div>
        )}
        {state.status === 'error' && state.error && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span className="text-danger/80 text-[10px] text-center break-all">{state.error}</span>
          </div>
        )}
      </div>

      {state.report && (
        <div className="px-3 py-2 border-t border-white/5 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {state.report.faultTypes?.map((f, i) => (
              <span key={i} className="text-[10px] text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                {f.nameZh}{typeof f.confidence === 'number' ? ` ${(f.confidence * 100).toFixed(0)}%` : ''}
              </span>
            ))}
            <span className="text-[10px] text-neutral-500 ml-auto">#{state.analyzeCount}</span>
          </div>
          {state.report.summaryZh && (
            <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2">{state.report.summaryZh}</p>
          )}
        </div>
      )}
    </div>
  )
}
