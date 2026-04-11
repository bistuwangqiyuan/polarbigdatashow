'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  FAULT_GALLERY_INTRO,
  FAULT_GALLERY_ITEMS,
  faultGallerySrc,
} from 'lib/faultGallerySamples'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'normal', label: '正常对照' },
  { id: 'field', label: '阵列与特写' },
  { id: 'fault', label: '故障与异常' },
]

function badgeClass(kind, badge) {
  if (badge === '严重') return 'border-danger/50 bg-danger/15 text-danger'
  if (kind === 'normal') return 'border-success/40 bg-success/10 text-success'
  if (kind === 'fault') return 'border-warning/45 bg-warning/10 text-warning'
  return 'border-primary/35 bg-primary/10 text-primary'
}

export default function FaultGalleryPage() {
  const [filter, setFilter] = useState('all')
  const [activeId, setActiveId] = useState(null)

  const active = useMemo(
    () => FAULT_GALLERY_ITEMS.find((i) => i.id === activeId) ?? null,
    [activeId]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return FAULT_GALLERY_ITEMS
    return FAULT_GALLERY_ITEMS.filter((i) => i.kind === filter)
  }, [filter])

  const closeModal = useCallback(() => setActiveId(null), [])

  useEffect(() => {
    if (!activeId) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId, closeModal])

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
                <h1 className="text-2xl font-display text-primary glow-text">故障图像示例库</h1>
                <p className="text-xs text-neutral-500 mt-1">
                  天津滨海泰达 0.8kWp 示范站 · 组件状态样本（静态展示）
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
              <Link href="/about" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                关于我们
              </Link>
              <Link href="/devices" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                设备管理
              </Link>
              <Link href="/pv-vision" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                图像识别
              </Link>
              <Link href="/analytics" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                数据分析
              </Link>
              <Link href="/history" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                历史趋势
              </Link>
              <Link href="/settings" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                系统设置
              </Link>
              <Link href="/alerts" className="text-neutral-400 hover:text-primary transition-colors px-2 py-1">
                报警信息
              </Link>
              <span className="text-primary border border-primary/40 px-3 py-1 rounded-lg bg-primary/10">
                故障图库
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-2xl border border-primary/20 bg-neutral-950/40 backdrop-blur-sm p-6 sm:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-display text-primary mb-2">{FAULT_GALLERY_INTRO.title}</h2>
          <p className="text-neutral-300 text-sm sm:text-base mb-4">{FAULT_GALLERY_INTRO.subtitle}</p>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">{FAULT_GALLERY_INTRO.body}</p>
          <p className="text-xs text-neutral-500 mt-4">
            布局与分类思路参考公开演示站{' '}
            <a
              href="https://aczv.asia/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              光伏图像识别演示网站
            </a>
            ；本站为关断管理系统内置图库，不发起外部分析请求。
          </p>
          <div className="mt-6">
            <Link
              href="/pv-vision"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 text-sm font-medium transition-colors"
            >
              光伏故障图像识别（Vision API + 全自动演示）
            </Link>
          </div>
        </motion.section>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                filter === f.id
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:border-primary/30'
              }`}
            >
              {f.label}
              <span className="text-neutral-500 ml-1 text-xs">
                (
                {f.id === 'all'
                  ? FAULT_GALLERY_ITEMS.length
                  : FAULT_GALLERY_ITEMS.filter((i) => i.kind === f.id).length}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              className="group rounded-xl border border-white/10 bg-neutral-900/35 hover:border-primary/35 overflow-hidden flex flex-col shadow-lg shadow-black/20"
            >
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className="relative aspect-[4/3] w-full overflow-hidden bg-black/40 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Image
                  src={faultGallerySrc(item.file)}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-xs font-medium border backdrop-blur-sm ${badgeClass(item.kind, item.badge)}`}
                >
                  {item.badge}
                </span>
              </button>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-display text-white mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed flex-1 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-800/80 text-neutral-400 border border-neutral-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className="w-full py-2.5 text-sm font-medium text-center rounded-lg bg-primary/15 text-primary border border-primary/35 hover:bg-primary/25 transition-colors"
                >
                  查看大图
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-14 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/30 p-6 text-center"
        >
          <h3 className="text-lg font-display text-primary mb-2">上传自有图片（扩展）</h3>
          <p className="text-sm text-neutral-400 mb-4">
            若需对接 AI 识别流水线，可在业务系统中支持 JPG / PNG / WEBP，单张建议不超过 10MB（参考常见识别入口规格）。
          </p>
          <p className="text-xs text-neutral-500">
            当前演示站未开放上传；运维照片请走内网工单或专用识别平台。
          </p>
        </motion.section>
      </main>

      <AnimatePresence>
        {active && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl border border-primary/30 bg-neutral-950 shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-white/10 bg-neutral-900/80">
                <div>
                  <h2 id="gallery-modal-title" className="text-lg font-display text-primary">
                    {active.title}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">{active.description}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-neutral-600 text-neutral-300 hover:bg-neutral-800 text-sm"
                >
                  关闭
                </button>
              </div>
              <div className="relative w-full min-h-[240px] max-h-[calc(90vh-8rem)] h-[min(70vh,720px)] bg-black">
                <Image
                  src={faultGallerySrc(active.file)}
                  alt={active.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="px-4 py-3 border-t border-white/10 flex flex-wrap gap-2 bg-neutral-900/80">
                {active.tags.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
