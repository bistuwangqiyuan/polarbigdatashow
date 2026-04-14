'use client'

import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { fetchImageAsDataUrl, compressDataUrl } from 'lib/pvFaultImageClient'
import { runClientSidePvHeuristic, getDemoScriptedDustReport } from 'lib/pvFaultClientAnalysis'

const StreamMonitor = lazy(() => import('components/stream/StreamMonitor'))

const DEMO_SAMPLE_PATH = '/image/fault-gallery/pv1-blocked.png'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const PROVIDER_META = {
  groq: { label: 'Groq Llama 4 Scout', short: 'Groq' },
  mistral: { label: 'Mistral Pixtral', short: 'Mistral' },
  zhipu: { label: '智谱 GLM-4V', short: '智谱' },
  dashscope: { label: '阿里通义 Qwen-VL', short: 'DashScope' },
  gemini: { label: 'Google Gemini', short: 'Gemini' },
  openai: { label: 'OpenAI GPT-4o', short: 'GPT-4o' },
}
const PROVIDER_ORDER = ['groq', 'mistral', 'zhipu', 'dashscope', 'gemini', 'openai']

function usedProviderLabel(used) {
  return PROVIDER_META[used]?.label || used || '云端'
}

function severityRingClass(sev) {
  if (sev === 'high') return 'text-danger border-danger/50 bg-danger/10'
  if (sev === 'medium') return 'text-warning border-warning/50 bg-warning/10'
  if (sev === 'low') return 'text-primary border-primary/50 bg-primary/10'
  return 'text-success border-success/50 bg-success/10'
}

function boxStrokeColor(sev) {
  if (sev === 'high') return '#f87171'
  if (sev === 'medium') return '#fbbf24'
  if (sev === 'low') return '#22d3ee'
  return '#94a3b8'
}

const TABS = [
  { id: 'image', label: '图片识别' },
  { id: 'stream', label: '实时监控' },
]

export default function PvVisionPage() {
  const [activeTab, setActiveTab] = useState('image')
  const [providers, setProviders] = useState(
    Object.fromEntries(PROVIDER_ORDER.map((k) => [k, false]))
  )
  const [previewUrl, setPreviewUrl] = useState(null)
  const [report, setReport] = useState(null)
  const [logLines, setLogLines] = useState([])
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [lastSource, setLastSource] = useState(null)

  useEffect(() => {
    fetch('/api/pv-fault-vision')
      .then((r) => r.json())
      .then((j) => {
        if (j?.providers) {
          setProviders((prev) => {
            const next = { ...prev }
            for (const k of PROVIDER_ORDER) next[k] = !!j.providers[k]
            return next
          })
        }
      })
      .catch(() => {})
  }, [])

  const pushLog = useCallback((line) => {
    setLogLines((prev) => [...prev, `${new Date().toLocaleTimeString('zh-CN', { hour12: false })}  ${line}`])
  }, [])

  const callVisionApi = useCallback(async (dataUrl) => {
    const res = await fetch('/api/pv-fault-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: dataUrl,
        mimeType: dataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
      }),
    })
    let j = {}
    try {
      j = await res.json()
    } catch {
      j = { ok: false, code: 'INVALID_RESPONSE' }
    }
    return { res, j }
  }, [])

  const runFullDemo = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setPhase('running')
    setReport(null)
    setLogLines([])
    setLastSource('demo')
    try {
      pushLog('① 加载演示图像（光伏板1被遮挡样本）')
      await sleep(450)
      const raw = await fetchImageAsDataUrl(DEMO_SAMPLE_PATH)
      setPreviewUrl(raw)
      await sleep(550)
      pushLog('② 浏览器端压缩长边（减轻 Vision 请求体积）')
      const compressed = await compressDataUrl(raw, 1280, 'image/jpeg', 0.88)
      setPreviewUrl(compressed)
      await sleep(500)
      pushLog('③ 调用服务端 Vision API（自动切换可用模型）')
      const { res, j } = await callVisionApi(compressed)
      if (j?.ok && j?.report) {
        pushLog(`④ 云端识别完成（${usedProviderLabel(j.usedProvider)}）`)
        setReport(j.report)
        setPhase('done')
      } else if (j?.code === 'NO_PROVIDER' || j?.code === 'GEMINI_FAILED') {
        pushLog(`④ 云端未就绪（${j?.code || res.status}），展示「板1遮挡」全流程演示数据（含框标注）`)
        await sleep(400)
        setReport(getDemoScriptedDustReport())
        setPhase('done')
      } else {
        const detail = j?.detail ? ` ${String(j.detail).slice(0, 120)}` : ''
        pushLog(`④ 云端返回异常（${j?.code || res.status}${detail}），展示「板1遮挡」演示数据以保证流程完整`)
        await sleep(350)
        setReport(getDemoScriptedDustReport())
        setPhase('done')
      }
    } catch (e) {
      pushLog(`④ 过程异常：${e?.message || e}，已切换板1遮挡演示数据`)
      setReport(getDemoScriptedDustReport())
      setPhase('done')
    } finally {
      setBusy(false)
    }
  }, [busy, callVisionApi, pushLog])

  const onPickFile = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file || !file.type.startsWith('image/')) return
      if (busy) return
      setBusy(true)
      setPhase('running')
      setReport(null)
      setLogLines([])
      setLastSource('upload')
      let dataUrl = ''
      let compressed = ''
      try {
        pushLog(`① 已选择本地图片：${file.name}`)
        dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result)
          r.onerror = reject
          r.readAsDataURL(file)
        })
        setPreviewUrl(dataUrl)
        await sleep(400)
        pushLog('② 压缩图像')
        compressed = await compressDataUrl(dataUrl, 1280, 'image/jpeg', 0.88)
        setPreviewUrl(compressed)
        await sleep(400)
        pushLog('③ 调用 Vision API')
        const { res, j } = await callVisionApi(compressed)
        if (j?.ok && j?.report) {
          pushLog(`④ 完成（${usedProviderLabel(j.usedProvider)}）`)
          setReport(j.report)
        } else {
          pushLog(`④ 云端不可用（${j?.code || res.status}），启用浏览器端启发式分析`)
          const h = await runClientSidePvHeuristic(compressed)
          setReport(h)
        }
        setPhase('done')
      } catch (err) {
        pushLog(`错误：${err?.message || err}`)
        const fallback = compressed || dataUrl
        try {
          if (fallback) setReport(await runClientSidePvHeuristic(fallback))
          else setReport(getDemoScriptedDustReport())
        } catch {
          setReport(getDemoScriptedDustReport())
        }
        setPhase('done')
      } finally {
        setBusy(false)
      }
    },
    [busy, callVisionApi, pushLog]
  )

  return (
    <div className="min-h-screen dashboard-bg">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" aria-hidden />

      <header className="relative z-20 border-b border-primary/30 backdrop-blur-sm">
        <div className="px-6 sm:px-8 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors text-sm">
                ← 返回主页
              </Link>
              <Image src="/image/logo.png" alt="公司Logo" width={50} height={50} className="object-contain" />
              <div>
                <h1 className="text-2xl font-display text-primary glow-text">光伏故障图像识别</h1>
                <p className="text-xs text-neutral-500 mt-1">
                  图片分析 · 推流监控截帧 · 自动故障检测
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
              <Link href="/gallery" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                故障图库
              </Link>
              <Link href="/devices" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                设备管理
              </Link>
              <Link href="/alerts" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                报警信息
              </Link>
              <span className="text-primary border border-primary/40 px-3 py-1 rounded-lg bg-primary/10">图像识别</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 sm:px-8 py-8 max-w-[1400px] mx-auto space-y-8">
        {/* Tab bar */}
        <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Image analysis tab */}
        {activeTab === 'image' && (
          <>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                data-testid="pv-demo-full"
                disabled={busy}
                onClick={runFullDemo}
                className="px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 disabled:opacity-50 font-medium text-sm"
              >
                {busy && lastSource === 'demo' ? '演示进行中…' : '全自动演示（板1遮挡样本）'}
              </button>
              <label className="px-5 py-2.5 rounded-xl bg-neutral-800/80 text-neutral-200 border border-neutral-600 hover:border-primary/40 cursor-pointer text-sm font-medium">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={onPickFile} />
                上传图片分析
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setPreviewUrl(null)
                  setReport(null)
                  setLogLines([])
                  setPhase('idle')
                  setLastSource(null)
                }}
                className="px-4 py-2.5 rounded-xl border border-neutral-600 text-neutral-400 hover:text-neutral-200 text-sm"
              >
                清空
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-lg font-display text-primary">图像与框标注</h2>
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-[4/3]">
                  {previewUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="分析预览" className="w-full h-full object-contain" />
                      {report?.annotations?.length > 0 && (
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          aria-hidden
                        >
                          {report.annotations.map((a, i) => (
                            <g key={i}>
                              <rect
                                x={a.box.x * 100}
                                y={a.box.y * 100}
                                width={a.box.w * 100}
                                height={a.box.h * 100}
                                fill="rgba(0,212,255,0.06)"
                                stroke={boxStrokeColor(a.severity)}
                                strokeWidth={0.55}
                                vectorEffect="non-scaling-stroke"
                              />
                              <title>{a.labelZh}</title>
                            </g>
                          ))}
                        </svg>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm p-6 text-center">
                      点击「全自动演示」或上传图片以开始
                    </div>
                  )}
                  <AnimatePresence>
                    {phase === 'running' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/55 flex items-center justify-center"
                      >
                        <div className="text-primary font-display animate-pulse">分析流水线运行中…</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {report?.annotations?.length > 0 && (
                  <ul className="text-xs text-neutral-400 space-y-1">
                    {report.annotations.map((a, i) => (
                      <li key={i}>
                        <span className="text-primary">框 {i + 1}</span>：{a.labelZh}
                        {a.severity ? ` · ${a.severity}` : ''}（归一化 x,y,w,h = {a.box.x.toFixed(2)},{a.box.y.toFixed(2)},{a.box.w.toFixed(2)},
                        {a.box.h.toFixed(2)}）
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-display text-primary">结构化结果</h2>
                {report ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-lg border capitalize ${severityRingClass(report.severity)}`}
                      >
                        严重度 {report.severity}
                      </span>
                      <span className="text-xs text-neutral-500">评分 {(report.severityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="stat-card">
                      <h3 className="text-sm text-primary mb-2">摘要</h3>
                      <p className="text-sm text-neutral-300 leading-relaxed">{report.summaryZh || '—'}</p>
                    </div>
                    <div className="stat-card">
                      <h3 className="text-sm text-primary mb-2">故障类型</h3>
                      {report.faultTypes?.length ? (
                        <ul className="space-y-2">
                          {report.faultTypes.map((f, i) => (
                            <li key={i} className="text-sm text-neutral-300 flex justify-between gap-2">
                              <span>{f.nameZh}</span>
                              <span className="text-neutral-500 font-mono text-xs">
                                {f.code}
                                {typeof f.confidence === 'number' ? ` · ${(f.confidence * 100).toFixed(0)}%` : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-neutral-500">未列出明确类型（可能为正常或需更清晰图像）</p>
                      )}
                    </div>
                    <div className="stat-card">
                      <h3 className="text-sm text-primary mb-2">维护建议</h3>
                      <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1.5">
                        {(report.maintenanceSuggestions || []).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-sm text-neutral-500">暂无结果</p>
                )}

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 max-h-56 overflow-y-auto">
                  <h3 className="text-xs text-neutral-500 mb-2 font-medium">流水线日志</h3>
                  <pre className="text-[11px] text-neutral-400 whitespace-pre-wrap font-mono leading-relaxed">
                    {logLines.length ? logLines.join('\n') : '等待任务…'}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Stream monitoring tab */}
        {activeTab === 'stream' && (
          <Suspense
            fallback={
              <div className="text-neutral-500 text-sm py-12 text-center">加载实时监控组件…</div>
            }
          >
            <StreamMonitor />
          </Suspense>
        )}
      </main>
    </div>
  )
}
