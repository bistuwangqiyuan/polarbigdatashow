'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ALARM_HISTORY_RECORDS,
  ALARM_LEVELS,
  ALARM_STATUS,
} from 'lib/alarmHistoryMock'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'open', label: '未处理' },
  { id: 'critical', label: '严重' },
  { id: 'warning', label: '警告' },
  { id: 'resolved', label: '已恢复' },
]

export default function AlertsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return ALARM_HISTORY_RECORDS.filter((row) => {
      if (filter === 'open' && row.status !== 'open') return false
      if (filter === 'resolved' && row.status !== 'resolved') return false
      if (filter === 'critical' && row.level !== 'critical') return false
      if (filter === 'warning' && row.level !== 'warning') return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const blob = `${row.id} ${row.source} ${row.message} ${row.category}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [filter, search])

  const stats = useMemo(() => {
    const list = ALARM_HISTORY_RECORDS
    return {
      total: list.length,
      open: list.filter((r) => r.status === 'open').length,
      critical: list.filter((r) => r.level === 'critical').length,
      resolved: list.filter((r) => r.status === 'resolved').length,
    }
  }, [])

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回主页
              </Link>
              <Image src="/image/logo.png" alt="公司Logo" width={50} height={50} className="object-contain" />
              <div>
                <h1 className="text-2xl font-display text-primary glow-text">报警信息</h1>
                <p className="text-xs text-neutral-500 mt-1">
                  天津滨海泰达 0.8kWp 示范站 · 历史故障与告警记录（演示数据）
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/about" className="text-neutral-400 hover:text-primary transition-colors">
                关于我们
              </Link>
              <Link href="/devices" className="text-neutral-400 hover:text-primary transition-colors">
                设备管理
              </Link>
              <Link href="/gallery" className="text-neutral-400 hover:text-primary transition-colors">
                故障图库
              </Link>
              <Link href="/pv-vision" className="text-neutral-400 hover:text-primary transition-colors">
                图像识别
              </Link>
              <Link href="/analytics" className="text-neutral-400 hover:text-primary transition-colors">
                数据分析
              </Link>
              <Link href="/history" className="text-neutral-400 hover:text-primary transition-colors">
                历史趋势
              </Link>
              <Link href="/settings" className="text-neutral-400 hover:text-primary transition-colors">
                系统设置
              </Link>
              <span className="text-primary border border-primary/40 px-3 py-1 rounded-lg bg-primary/10">
                报警信息
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '累计告警', value: stats.total, color: 'text-primary' },
            { label: '未处理', value: stats.open, color: 'text-warning' },
            { label: '严重级别', value: stats.critical, color: 'text-danger' },
            { label: '已恢复', value: stats.resolved, color: 'text-success' },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-card"
            >
              <p className="text-neutral-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-display mt-1 ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="stat-card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f.id
                      ? 'bg-primary/20 text-primary border border-primary/35'
                      : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-primary/25'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <input
                type="search"
                placeholder="搜索编号、设备、描述…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-neutral-900/50 border border-primary/25 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary/45"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="stat-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/40">
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium whitespace-nowrap">告警编号</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium whitespace-nowrap">发生时间</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium whitespace-nowrap">级别</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium whitespace-nowrap">来源</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium whitespace-nowrap">类别</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium min-w-[240px]">描述</th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium whitespace-nowrap">状态</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-neutral-800/60 hover:bg-neutral-900/35 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-primary/90 whitespace-nowrap">{row.id}</td>
                      <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">{row.occurredAt}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${ALARM_LEVELS[row.level].className}`}
                        >
                          {ALARM_LEVELS[row.level].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-200">{row.source}</td>
                      <td className="py-3 px-4 text-neutral-400">{row.category}</td>
                      <td className="py-3 px-4 text-neutral-300">{row.message}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${ALARM_STATUS[row.status].className}`}>
                          {ALARM_STATUS[row.status].label}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-neutral-500">没有符合条件的记录</div>
          )}
        </div>

        <p className="text-xs text-neutral-600 mt-6 text-center">
          实际部署时可对接告警数据库或消息总线；当前为前端静态演示列表。
        </p>
      </main>
    </div>
  )
}
