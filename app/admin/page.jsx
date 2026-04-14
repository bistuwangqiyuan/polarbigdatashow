'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const ADMIN_USER = 'admin'
const ADMIN_PASS = '123456'

const PV_PANELS = [
  { id: 1, name: '光伏阵列-01' },
  { id: 2, name: '光伏阵列-02' },
  { id: 3, name: '光伏阵列-03' },
  { id: 4, name: '光伏阵列-04' },
]

// ── API helpers ───────────────────────────────────────────
async function fetchOverrides() {
  try {
    const res = await fetch('/api/pv-state', { cache: 'no-store' })
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    return data.overrides || {}
  } catch { return {} }
}

async function setOverride(panelId, status) {
  const res = await fetch('/api/pv-state/override', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ panelId, status }),
  })
  if (!res.ok) throw new Error('save failed')
  return res.json()
}

async function resetAllOverrides() {
  const res = await fetch('/api/pv-state/override', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetAll: true }),
  })
  if (!res.ok) throw new Error('reset failed')
  return res.json()
}

// ── Login Panel ──────────────────────────────────────────
function LoginPanel({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      onLogin()
    } else {
      setErr('账号或密码错误')
      setPass('')
    }
  }

  return (
    <div className="min-h-screen dashboard-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm rounded-2xl border border-primary/30 bg-neutral-950/80 backdrop-blur-md p-8 shadow-2xl shadow-primary/10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-primary/40 bg-primary/10 mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-display text-primary glow-text">后台管理系统</h1>
          <p className="text-xs text-neutral-500 mt-1">光伏能源管理平台</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">管理员账号</label>
            <input
              type="text"
              value={user}
              onChange={(e) => { setUser(e.target.value); setErr('') }}
              placeholder="admin"
              autoComplete="username"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm placeholder-neutral-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5">密码</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setErr('') }}
              placeholder="••••••"
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm placeholder-neutral-600 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>

          <AnimatePresence>
            {err && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-danger text-center"
              >
                {err}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-medium text-sm transition-colors"
          >
            登 录
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">
          <Link href="/" className="hover:text-neutral-400 transition-colors">← 返回主页</Link>
        </p>
      </motion.div>
    </div>
  )
}

// ── Control Card ─────────────────────────────────────────
function PanelControlCard({ panel, override, onSet, saving }) {
  const isFault   = override === 'fault'
  const isOffline = override === 'offline'
  const isNormal  = !isFault && !isOffline

  const borderCls = isFault
    ? 'border-danger/50 bg-danger/5 shadow-lg shadow-danger/10'
    : isOffline
      ? 'border-neutral-600/50 bg-neutral-900/60'
      : 'border-white/10 bg-neutral-950/60'

  const statusLabel = isFault ? '异常报警' : isOffline ? '已关断' : '正常运行'
  const statusCls   = isFault
    ? 'text-danger border-danger/40 bg-danger/10'
    : isOffline
      ? 'text-neutral-400 border-neutral-600/40 bg-neutral-800/30'
      : 'text-success border-success/40 bg-success/10'

  const dotCls = isFault ? 'bg-danger animate-pulse' : isOffline ? 'bg-neutral-500' : 'bg-success'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 transition-all duration-300 ${borderCls}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-display text-white">{panel.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">光伏阵列 #{panel.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusCls}`}>
          {statusLabel}
        </span>
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
        <span className="text-xs text-neutral-500">
          {isFault ? '异常报警中' : isOffline ? '已关断停运' : '正常运行中'}
        </span>
      </div>

      {/* ── 报警控制 ── */}
      <p className="text-xs text-neutral-600 mb-1.5 uppercase tracking-wide">报警控制</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => onSet(panel.id, 'normal')}
          disabled={(isNormal || isOffline) || saving}
          className={`py-2 rounded-xl text-sm font-medium border transition-all ${
            isNormal
              ? 'border-success/50 bg-success/15 text-success cursor-default'
              : 'border-success/30 bg-transparent text-success/50 hover:bg-success/10 hover:border-success/50 hover:text-success disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          ✓ 正常
        </button>
        <button
          onClick={() => onSet(panel.id, 'fault')}
          disabled={isFault || isOffline || saving}
          className={`py-2 rounded-xl text-sm font-medium border transition-all ${
            isFault
              ? 'border-danger/50 bg-danger/15 text-danger cursor-default'
              : 'border-danger/30 bg-transparent text-danger/50 hover:bg-danger/10 hover:border-danger/50 hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          ⚠ 异常
        </button>
      </div>

      {/* ── 通断控制 ── */}
      <p className="text-xs text-neutral-600 mb-1.5 uppercase tracking-wide">通断控制</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSet(panel.id, 'normal')}
          disabled={!isOffline || saving}
          className={`py-2 rounded-xl text-sm font-medium border transition-all ${
            !isOffline
              ? 'border-primary/40 bg-primary/10 text-primary cursor-default'
              : 'border-primary/30 bg-transparent text-primary/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary'
          }`}
        >
          ⚡ 开启
        </button>
        <button
          onClick={() => onSet(panel.id, 'offline')}
          disabled={isOffline || saving}
          className={`py-2 rounded-xl text-sm font-medium border transition-all ${
            isOffline
              ? 'border-neutral-500/50 bg-neutral-800/50 text-neutral-400 cursor-default'
              : 'border-neutral-600/40 bg-transparent text-neutral-500 hover:bg-neutral-800/40 hover:border-neutral-500 hover:text-neutral-300'
          }`}
        >
          ○ 关断
        </button>
      </div>
    </motion.div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [overrides, setOverrides] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initial load + poll every 5 s
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const data = await fetchOverrides()
      if (!cancelled) {
        setOverrides(data)
        setLoading(false)
      }
    }
    load()
    const t = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  const handleSet = useCallback(async (panelId, status) => {
    setSaving(true)
    try {
      await setOverride(panelId, status)
      setOverrides((prev) => ({ ...prev, [panelId]: status }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [])

  const resetAll = useCallback(async () => {
    setSaving(true)
    try {
      await resetAllOverrides()
      const reset = {}
      PV_PANELS.forEach((p) => { reset[p.id] = 'normal' })
      setOverrides(reset)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }, [])

  const faultCount   = PV_PANELS.filter((p) => overrides[p.id] === 'fault').length
  const offlineCount = PV_PANELS.filter((p) => overrides[p.id] === 'offline').length

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="border-b border-primary/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors text-sm">
              ← 返回主页
            </Link>
            <Link href="/devices" className="text-sm text-neutral-400 hover:text-primary transition-colors">
              设备管理
            </Link>
            <h1 className="text-xl font-display text-primary glow-text">后台管理系统</h1>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-success"
                >
                  ✓ 已同步至数据库
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs text-neutral-500">admin</span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 border border-neutral-700 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-display text-white">光伏阵列控制台</h2>
          </div>
          <div className="flex items-center gap-3">
            {faultCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border border-danger/40 bg-danger/10 text-danger">
                {faultCount} 路告警
              </span>
            )}
            {offlineCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border border-neutral-600/40 bg-neutral-800/30 text-neutral-400">
                {offlineCount} 路关断
              </span>
            )}
            <button
              onClick={resetAll}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs text-neutral-400 border border-neutral-700 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50"
            >
              全部恢复正常
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-sm">加载中…</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...PV_PANELS].reverse().map((panel) => (
              <PanelControlCard
                key={panel.id}
                panel={panel}
                override={overrides[panel.id]}
                onSet={handleSet}
                saving={saving}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!sessionStorage.getItem('pvAdminLoggedIn'))
  }, [])

  const handleLogin = () => {
    sessionStorage.setItem('pvAdminLoggedIn', '1')
    setLoggedIn(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('pvAdminLoggedIn')
    setLoggedIn(false)
  }

  if (!loggedIn) return <LoginPanel onLogin={handleLogin} />
  return <AdminDashboard onLogout={handleLogout} />
}
