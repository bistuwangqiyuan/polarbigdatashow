'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

// ──────────────────────────────────────────────
//  Auth helpers
// ──────────────────────────────────────────────

/** Parse txTime hex from a URL string and return expiry Date (or null) */
function parseTxTime(urlStr) {
  try {
    const m = urlStr.match(/[?&]txTime=([0-9a-fA-F]+)/)
    if (!m) return null
    return new Date(parseInt(m[1], 16) * 1000)
  } catch {
    return null
  }
}

function isAuthExpired(urlStr) {
  const exp = parseTxTime(urlStr)
  return exp ? exp < new Date() : false
}

function formatExpiry(urlStr) {
  const exp = parseTxTime(urlStr)
  if (!exp) return null
  return exp.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
}

// ──────────────────────────────────────────────
//  Default cameras (shared stream: aczv.asia)
//  Update txSecret + txTime when auth expires.
// ──────────────────────────────────────────────
const DEFAULT_CAMS = [
  { id: 'cam1', label: '摄像头 1', url: 'http://aczv.asia/live/stream.m3u8' },
  { id: 'cam2', label: '摄像头 2', url: 'http://abusiness.icu/live/stream.m3u8' },
  { id: 'cam3', label: '摄像头 3', url: 'http://awallstreet.icu/live/stream.m3u8' },
  { id: 'cam4', label: '摄像头 4', url: 'http://bistu.online/live/stream.m3u8' },
]

const CAPTURE_INTERVAL_MS = 10_000
const MAX_CONCURRENT_ANALYSIS = 2

// All HTTP streaming hosts routed through the server-side proxy
// to avoid mixed-content errors on HTTPS pages.
const PROXY_HOSTS = new Set(['aczv.asia', 'abusiness.icu', 'awallstreet.icu', 'bistu.online'])

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
      if (PROXY_HOSTS.has(parsed.hostname) && parsed.pathname.startsWith('/live/')) {
        // Route through server proxy: /api/stream-proxy/{hostname}/{file}
        const filePath = parsed.pathname.slice('/live/'.length)
        const proxyPath = `/api/stream-proxy/${parsed.hostname}/${filePath}${parsed.search}`
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
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  pc.addTransceiver('audio', { direction: 'recvonly' })
  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.ontrack = (event) => { if (event.streams?.[0]) videoEl.srcObject = event.streams[0] }

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

// ──────────────────────────────────────────────
//  AuthUpdatePanel – lets user paste new txSecret + txTime
// ──────────────────────────────────────────────
function AuthUpdatePanel({ cameras, onApply }) {
  const [secret, setSecret] = useState('')
  const [txtime, setTxtime] = useState('')
  const expDate = useMemo(() => {
    if (!txtime.trim()) return null
    try { return new Date(parseInt(txtime.trim(), 16) * 1000) } catch { return null }
  }, [txtime])

  const apply = () => {
    if (!secret.trim() || !txtime.trim()) return
    onApply(secret.trim(), txtime.trim().toUpperCase())
  }

  return (
    <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-warning text-sm font-semibold">🔑 更新流鉴权</span>
        <span className="text-xs text-neutral-500">从直播控制台获取新的 txSecret 和 txTime</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-neutral-400 block mb-1">txSecret（32位MD5）</label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="d22f41b43c22c209bd2bf361aec00ebe"
            className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] text-neutral-400 block mb-1">
            txTime（16进制时间戳）
            {expDate && (
              <span className={`ml-2 ${expDate > new Date() ? 'text-success' : 'text-danger'}`}>
                → {expDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}
                {expDate < new Date() ? ' ❌ 已过期' : ' ✓ 有效'}
              </span>
            )}
          </label>
          <input
            type="text"
            value={txtime}
            onChange={(e) => setTxtime(e.target.value)}
            placeholder="72BBBA80  (2030-12-31)"
            className="w-full px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono"
          />
        </div>
      </div>
      <button
        onClick={apply}
        disabled={!secret.trim() || !txtime.trim()}
        className="px-4 py-2 rounded-lg bg-warning/20 text-warning border border-warning/40 text-xs font-medium hover:bg-warning/30 transition-colors disabled:opacity-40"
      >
        应用到所有摄像头
      </button>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Sample images for offline recognition test
// ──────────────────────────────────────────────
const SAMPLE_IMAGES = [
  // Real field images — labelled occlusion scenarios
  { label: '板1被遮挡',           src: '/image/fault-gallery/pv1-blocked.png' },
  { label: '板1被遮挡②',         src: '/image/fault-gallery/pv1-blocked2.png' },
  { label: '板2被遮挡',           src: '/image/fault-gallery/pv2-blocked.png' },
  { label: '板3被遮挡',           src: '/image/fault-gallery/pv3-blocked.png' },
  { label: '板4被遮挡',           src: '/image/fault-gallery/pv4-blocked.png' },
  { label: '板4被遮挡②',         src: '/image/fault-gallery/pv4-blocked2.png' },
  // Legacy samples
  { label: 'normal-1（正常）',    src: '/image/fault-gallery/normal-1.png' },
  { label: 'normal-2（正常）',    src: '/image/fault-gallery/normal-2.png' },
  { label: 'sample4（遮挡）',     src: '/image/fault-gallery/sample4.png' },
  { label: 'sample7（热斑）',     src: '/image/fault-gallery/sample7.png' },
]

/** Load an image URL and return a compressed base64 data URL (max 480px wide). */
async function loadImageAsBase64(src, maxWidth = 480) {
  const res = await fetch(src)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

// ──────────────────────────────────────────────
//  Main component
// ──────────────────────────────────────────────
export default function StreamMonitor() {
  const [cameras, setCameras] = useState(() => DEFAULT_CAMS.map((c) => ({ ...c })))
  const [monitoring, setMonitoring] = useState(false)
  const [capturingActive, setCapturingActive] = useState(true)   // auto-capture on/off
  const [showConfig, setShowConfig] = useState(false)             // hide by default – URL pre-configured
  const [showAuth, setShowAuth] = useState(false)
  const [intervalSec, setIntervalSec] = useState(CAPTURE_INTERVAL_MS / 1000)
  const [sampleIdx, setSampleIdx] = useState(0)                   // for sample-based test
  const [recognitionToast, setRecognitionToast] = useState(null)  // null | 'show' | 'hidden'
  const recognitionFirstTime = useRef(true)                       // show toast only once

  const camStates = useRef(new Map())
  const [, forceRender] = useState(0)
  const rerender = useCallback(() => forceRender((n) => n + 1), [])

  // Detect if any cam URL auth is expired
  const authExpired = useMemo(() => cameras.some((c) => isAuthExpired(c.url)), [cameras])
  const firstExpiry = useMemo(() => {
    for (const c of cameras) {
      const t = formatExpiry(c.url)
      if (t) return t
    }
    return null
  }, [cameras])

  const getCamState = useCallback((id) => {
    if (!camStates.current.has(id)) {
      camStates.current.set(id, {
        status: 'idle', player: null, captureTimer: null,
        lastFrame: null, report: null, error: null, analyzeCount: 0, protoBadge: '',
      })
    }
    return camStates.current.get(id)
  }, [])

  const analysisQueue = useRef(0)

  const captureFrame = useCallback((videoEl) => {
    if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0) return null
    const canvas = document.createElement('canvas')
    const w = Math.min(videoEl.videoWidth, 480)
    const h = Math.round((w / videoEl.videoWidth) * videoEl.videoHeight)
    canvas.width = w; canvas.height = h
    canvas.getContext('2d').drawImage(videoEl, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg', 0.82)
  }, [])

  const analyzeFrame = useCallback(async (camId, dataUrl) => {
    if (analysisQueue.current >= MAX_CONCURRENT_ANALYSIS) return
    analysisQueue.current++
    const cs = getCamState(camId)
    cs.status = 'analyzing'; cs.lastFrame = dataUrl; rerender()
    try {
      const res = await fetch('/api/pv-fault-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType: 'image/jpeg', mode: 'panel_occlusion' }),
      })
      const j = await res.json()
      if (j?.ok && j?.report) {
        cs.report = j.report; cs.error = null
        // Publish panel occlusion result to localStorage for devices page
        if (camId === 'cam1' && j.report.mode === 'panel_occlusion') {
          try {
            localStorage.setItem('pvOcclusionReport', JSON.stringify({
              panels: j.report.panels,
              anyOccluded: j.report.anyOccluded,
              timestamp: Date.now(),
            }))
          } catch {}
        }
        if (camId === 'cam1' && recognitionFirstTime.current) {
          recognitionFirstTime.current = false
          setRecognitionToast('show')
          setTimeout(() => setRecognitionToast('hidden'), 5000)
        }
      } else { cs.report = null; cs.error = j?.message || j?.code || 'unknown' }
      cs.analyzeCount++
    } catch (e) {
      cs.error = e?.message || 'fetch error'; cs.report = null
    } finally {
      cs.status = 'playing'; analysisQueue.current--; rerender()
    }
  }, [getCamState, rerender])

  const startCamera = useCallback(async (cam) => {
    const cs = getCamState(cam.id)
    if (cs.player) return

    const { playUrl, type, badge } = resolveStreamUrl(cam.url)
    cs.status = 'connecting'; cs.error = null; cs.protoBadge = badge; rerender()

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
          videoEl.addEventListener('error', (e) => {
            const code = e.target?.error?.code
            cs.status = 'error'
            cs.error = code === 4 ? '流未推送或鉴权失败，请检查 txSecret/txTime' : `HLS 播放错误 (code ${code})`
            rerender()
          })
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
            xhrSetup(xhr) {
              xhr.withCredentials = false
            },
          })
          hls.loadSource(playUrl)
          hls.attachMedia(videoEl)
          hls.on(Hls.Events.MANIFEST_PARSED, () => { videoEl.play().catch(() => {}) })
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                // Check if it's a 403 (auth expired)
                if (data.response?.code === 403) {
                  cs.status = 'error'
                  cs.error = '🔑 流鉴权已过期 (403)，请在"更新流鉴权"面板中填写新的 txSecret 和 txTime'
                  rerender()
                } else {
                  hls.startLoad()
                }
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError()
              } else {
                cs.status = 'error'
                cs.error = `${data.type}: ${data.details}`
                rerender()
              }
            }
          })
          videoEl.addEventListener('playing', () => { cs.status = 'playing'; cs.error = null; rerender() })
          cs.player = { type: 'hls', instance: hls }
        }

      } else {
        // FLV via mpegts.js
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
            deferLoadAfterSourceOpen: false,
          }
        )
        player.attachMediaElement(videoEl)
        player.load()
        player.play().catch(() => {})
        player.on(mpegts.Events.ERROR, (errType, errDetail, errInfo) => {
          if (errType === 'NetworkError' && errInfo?.code === 403) {
            cs.status = 'error'
            cs.error = '🔑 流鉴权已过期 (403)，请在"更新流鉴权"面板中填写新的 txSecret 和 txTime'
            rerender()
          } else if (errType === 'NetworkError') {
            setTimeout(() => {
              try { player.unload(); player.load(); player.play().catch(() => {}) } catch {}
            }, 3000)
          } else {
            cs.error = `${errType}: ${errDetail}`; cs.status = 'error'; rerender()
          }
        })
        player.on(mpegts.Events.LOADING_COMPLETE, () => { cs.status = 'ended'; rerender() })
        videoEl.addEventListener('playing', () => { cs.status = 'playing'; cs.error = null; rerender() })
        cs.player = { type: 'mpegts', instance: player }
      }

      // Only cam1 performs automatic frame capture & recognition
      if (cam.id === 'cam1') {
        const intervalMs = (intervalSec || 10) * 1000
        cs.captureTimer = window.setInterval(() => {
          const frame = captureFrame(videoEl)
          if (frame) analyzeFrame(cam.id, frame)
        }, intervalMs)
      }

      rerender()
    } catch (e) {
      cs.status = 'error'
      cs.error = e?.message || 'init error'
      rerender()
    }
  }, [getCamState, rerender, captureFrame, analyzeFrame, intervalSec])

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
          if (v) v.srcObject = null
        } else if (cs.player.type === 'native') {
          const v = document.getElementById(`stream-video-${camId}`)
          if (v) { v.pause(); v.removeAttribute('src'); v.load() }
        }
      } catch {}
      cs.player = null
    }
    cs.status = 'idle'; rerender()
  }, [getCamState, rerender])

  // ── Stop / restart only the capture timers (keep video playing) ──
  const stopCapture = useCallback(() => {
    setCapturingActive(false)
    cameras.forEach((cam) => {
      const cs = getCamState(cam.id)
      if (cs.captureTimer) { clearInterval(cs.captureTimer); cs.captureTimer = null }
    })
    rerender()
  }, [cameras, getCamState, rerender])

  const startCapture = useCallback(() => {
    setCapturingActive(true)
    cameras.forEach((cam) => {
      const cs = getCamState(cam.id)
      if (!cs.captureTimer && cs.status === 'playing') {
        const videoEl = document.getElementById(`stream-video-${cam.id}`)
        const intervalMs = (intervalSec || 10) * 1000
        cs.captureTimer = window.setInterval(() => {
          const frame = captureFrame(videoEl)
          if (frame) analyzeFrame(cam.id, frame)
        }, intervalMs)
      }
    })
    rerender()
  }, [cameras, getCamState, rerender, captureFrame, analyzeFrame, intervalSec])

  // ── Manual one-shot capture for a single camera ──
  const captureNow = useCallback((camId) => {
    const videoEl = document.getElementById(`stream-video-${camId}`)
    const frame = captureFrame(videoEl)
    if (frame) {
      analyzeFrame(camId, frame)
    }
  }, [captureFrame, analyzeFrame])

  // ── Test recognition with a sample fault image (offline testing) ──
  const testWithSample = useCallback(async (camId, imgSrc) => {
    const cs = getCamState(camId)
    cs.status = 'analyzing'
    cs.error = null
    rerender()
    try {
      const dataUrl = await loadImageAsBase64(imgSrc)
      cs.lastFrame = dataUrl
      rerender()
      await analyzeFrame(camId, dataUrl)
    } catch (e) {
      cs.status = cs.player ? 'playing' : 'idle'
      cs.error = `样本加载失败: ${e.message}`
      rerender()
    }
  }, [getCamState, rerender, analyzeFrame])

  const startAll = useCallback(() => {
    setMonitoring(true); setShowConfig(false); setCapturingActive(true)
    cameras.forEach((cam) => startCamera(cam))
  }, [cameras, startCamera])

  const stopAll = useCallback(() => {
    setMonitoring(false); setCapturingActive(false)
    cameras.forEach((cam) => stopCamera(cam.id))
  }, [cameras, stopCamera])

  // Auto-start camera monitoring on mount (once only)
  const startAllRef = useRef(null)
  useEffect(() => { startAllRef.current = startAll }, [startAll])
  useEffect(() => {
    const t = setTimeout(() => startAllRef.current?.(), 800)
    return () => clearTimeout(t)
  }, [])

  // Cleanup on unmount
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

  const applyNewAuth = useCallback((newSecret, newTxTime) => {
    setCameras((prev) =>
      prev.map((cam) => ({
        ...cam,
        url: cam.url
          .replace(/txSecret=[^&]*/g, `txSecret=${newSecret}`)
          .replace(/txTime=[^&]*/g, `txTime=${newTxTime}`),
      }))
    )
    setShowAuth(false)
  }, [])

  return (
    <div className="space-y-4">
      {/* ── Auth Expiry Banner ── */}
      <AnimatePresence>
        {authExpired && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-danger/40 bg-danger/10"
          >
            <div className="flex items-center gap-2 text-sm text-danger">
              <span>🔑</span>
              <span className="font-semibold">流鉴权已过期</span>
              {firstExpiry && <span className="text-xs text-danger/70">（到期时间：{firstExpiry}）</span>}
            </div>
            <button
              onClick={() => { setShowAuth((v) => !v); setShowConfig(true) }}
              className="px-3 py-1 rounded-lg text-xs bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 transition-colors"
            >
              {showAuth ? '收起' : '更新鉴权'}
            </button>
          </motion.div>
        )}
        {/* ── Recognition Ready Toast ── */}
        {recognitionToast === 'show' && (
          <motion.div
            key="recognition-toast"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10"
          >
            <span className="text-lg">✅</span>
            <div>
              <p className="text-sm text-emerald-400 font-semibold">图像识别运行正常</p>
              <p className="text-xs text-emerald-400/70">摄像头 1 截帧已成功发送至 AI 进行故障分析，识别结果已同步至设备管理页面</p>
            </div>
            <Link
              href="/devices"
              className="shrink-0 px-3 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors font-medium"
            >
              查看设备管理 →
            </Link>
            <button
              onClick={() => setRecognitionToast('hidden')}
              className="text-emerald-400/60 hover:text-emerald-400 text-lg leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {!monitoring ? (
          <button type="button" onClick={startAll}
            className="px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-medium text-sm">
            ▶ 开始监控
          </button>
        ) : (
          <button type="button" onClick={stopAll}
            className="px-5 py-2.5 rounded-xl bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30 font-medium text-sm">
            ■ 停止监控
          </button>
        )}

        {/* ── Capture toggle (independent of video playback) ── */}
        {monitoring && (
          capturingActive ? (
            <button type="button" onClick={stopCapture}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 text-sm font-medium">
              ⏸ 停止截帧识别
            </button>
          ) : (
            <button type="button" onClick={startCapture}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 text-sm font-medium">
              ▶ 恢复截帧识别
            </button>
          )
        )}

        <Link
          href="/devices"
          className="px-4 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors"
        >
          设备管理 →
        </Link>
        <button type="button" onClick={() => setShowConfig((v) => !v)}
          className="px-4 py-2.5 rounded-xl border border-neutral-600 text-neutral-400 hover:text-neutral-200 text-sm">
          {showConfig ? '收起配置' : '流地址配置'}
        </button>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          截帧间隔
          <input type="number" min={5} max={120} value={intervalSec}
            onChange={(e) => setIntervalSec(Number(e.target.value) || 10)}
            disabled={monitoring}
            className="w-16 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs text-center" />
          秒
        </label>
        {monitoring && (
          <span className={`text-xs ${capturingActive ? 'text-success animate-pulse' : 'text-neutral-500'}`}>
            {capturingActive ? '● 监控中' : '○ 已暂停截帧'}
          </span>
        )}
      </div>

      {/* ── Config Panel ── */}
      {showConfig && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
          <p className="text-xs text-neutral-500">
            支持 FLV / HLS / RTMP / WebRTC。RTMP 自动转 FLV；HLS 片段通过服务端代理转发，解决跨域问题。
          </p>

          {/* Auth update panel shown when expired or manually shown */}
          {(authExpired || showAuth) && (
            <AuthUpdatePanel cameras={cameras} onApply={applyNewAuth} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cameras.map((cam, i) => {
              const { badge } = resolveStreamUrl(cam.url)
              const expired = isAuthExpired(cam.url)
              return (
                <div key={cam.id} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-16 shrink-0">{cam.label}</span>
                  <input type="text" value={cam.url}
                    onChange={(e) => updateCamUrl(i, e.target.value)}
                    disabled={monitoring}
                    className={`flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border text-neutral-200 text-xs font-mono disabled:opacity-50 ${
                      expired ? 'border-danger/50' : 'border-neutral-700'
                    }`}
                    placeholder="http://aczv.asia/live/stream.flv" />
                  {badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">{badge}</span>
                  )}
                  {expired && <span className="text-[9px] text-danger shrink-0">过期</span>}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Sample-based offline test (cam1 only) ── */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="text-xs text-neutral-500">摄像头1离线识别测试:</span>
        <select
          value={sampleIdx}
          onChange={(e) => setSampleIdx(Number(e.target.value))}
          className="px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs"
        >
          {SAMPLE_IMAGES.map((s, i) => (
            <option key={i} value={i}>{s.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => testWithSample('cam1', SAMPLE_IMAGES[sampleIdx].src)}
          className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30 text-xs transition-colors"
        >
          摄像头 1 识别
        </button>
      </div>

      {/* ── Camera Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => (
          <CameraPanel
            key={cam.id}
            cam={cam}
            state={getCamState(cam.id)}
            showRecognition={cam.id === 'cam1'}
            onCaptureNow={cam.id === 'cam1' ? () => captureNow(cam.id) : undefined}
            onTestSample={cam.id === 'cam1' ? () => testWithSample(cam.id, SAMPLE_IMAGES[sampleIdx].src) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
//  CameraPanel
// ──────────────────────────────────────────────
function CameraPanel({ cam, state, showRecognition, onCaptureNow, onTestSample }) {
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
        <div className="flex items-center gap-1.5">
          {showRecognition && state.report && (
            state.report.mode === 'panel_occlusion' ? (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                state.report.anyOccluded
                  ? 'text-danger border-danger/50 bg-danger/10'
                  : 'text-success border-success/50 bg-success/10'
              }`}>
                {state.report.anyOccluded ? '有遮挡' : '正常'}
              </span>
            ) : (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${severityBadgeClass(state.report.severity)}`}>
                {state.report.severity}
              </span>
            )
          )}
          {showRecognition && (
            <>
              {/* Manual capture button – only works when video is playing */}
              <button
                type="button"
                onClick={onCaptureNow}
                disabled={state.status === 'analyzing'}
                title="立即截取当前视频帧并识别"
                className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary/80 border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40"
              >
                📷 截帧
              </button>
              {/* Sample-image test button */}
              <button
                type="button"
                onClick={onTestSample}
                disabled={state.status === 'analyzing'}
                title="用样本故障图测试识别 API（无需视频流）"
                className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors disabled:opacity-40"
              >
                🧪 样本
              </button>
            </>
          )}
        </div>
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
        {state.status === 'idle' && !state.lastFrame && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-neutral-600 text-xs">等待连接</span>
          </div>
        )}
        {/* Show last captured frame whenever video element has no active src */}
        {state.lastFrame && state.status !== 'playing' && (
          <img
            src={state.lastFrame}
            alt="最近截帧"
            className="absolute inset-0 w-full h-full object-contain opacity-70"
          />
        )}
        {/* After sample-test: video is idle but we still want to see the frame */}
        {state.lastFrame && state.status === 'playing' && !state.player && (
          <img
            src={state.lastFrame}
            alt="最近截帧"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        {(state.status === 'error' || state.status === 'ended') && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span className="text-danger/80 text-[11px] text-center break-words leading-relaxed">
              {state.error || '流已断开'}
            </span>
          </div>
        )}
      </div>

      {showRecognition && state.report && (
        <div className="px-3 py-2 border-t border-white/5 space-y-2">
          {/* ── Per-panel occlusion grid ── */}
          {state.report.mode === 'panel_occlusion' && Array.isArray(state.report.panels) ? (
            <>
              <div className="grid grid-cols-4 gap-1.5">
                {state.report.panels.map((p) => (
                  <div key={p.id}
                    className={`rounded-lg px-2 py-1.5 text-center border ${
                      p.occluded
                        ? 'bg-danger/15 border-danger/40'
                        : 'bg-success/10 border-success/30'
                    }`}
                  >
                    <div className="text-[10px] font-semibold text-neutral-300 mb-0.5">板{p.id}</div>
                    {p.occluded ? (
                      <>
                        <div className="text-[10px] text-danger font-medium">
                          ⚠ {p.type || '遮挡'}
                        </div>
                        <div className="text-[9px] text-danger/70">
                          {(p.ratio * 100).toFixed(0)}%
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-success">✓ 正常</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2 flex-1 mr-2">
                  {state.report.summaryZh}
                </p>
                <span className="text-[10px] text-neutral-600 shrink-0">#{state.analyzeCount}</span>
              </div>
            </>
          ) : (
            /* fallback for old-style reports */
            <div className="flex flex-wrap items-center gap-2">
              {state.report.faultTypes?.map((f, i) => (
                <span key={i} className="text-[10px] text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                  {f.nameZh}{typeof f.confidence === 'number' ? ` ${(f.confidence * 100).toFixed(0)}%` : ''}
                </span>
              ))}
              <span className="text-[10px] text-neutral-500 ml-auto">#{state.analyzeCount}</span>
              {state.report.summaryZh && (
                <p className="w-full text-[10px] text-neutral-400 leading-relaxed line-clamp-2">{state.report.summaryZh}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
