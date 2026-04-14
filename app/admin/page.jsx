'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const ADMIN_USER = 'admin'
const ADMIN_PASS = '123456'
const STORAGE_KEY = 'pvAdminOverrides'

const PV_PANELS = [
  { id: 1, name: '光伏阵列-01' },
  { id: 2, name: '光伏阵列-02' },
  { id: 3, name: '光伏阵列-03' },
  { id: 4, name: '光伏阵列-04' },
]

function readOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function writeOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...overrides, _ts: Date.now() }))
  } catch {}
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
function PanelControlCard({ panel, override, onSet }) {
  const isFault = override === 'fault'
  const isNormal = override === 'normal' || override === undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 transition-all duration-300 ${
        isFault
          ? 'border-danger/50 bg-danger/5 shadow-lg shadow-danger/10'
          : 'border-white/10 bg-neutral-950/60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-display text-white">{panel.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">光伏阵列 #{panel.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          isFault
            ? 'text-danger border-danger/40 bg-danger/10'
            : 'text-success border-success/40 bg-success/10'
        }`}>
          {isFault ? '异常报警' : '正常运行'}
        </span>
      </div>

      {/* Status indicator */}
      <div className={`flex items-center gap-2 mb-5 px-3 py-2 rounded-lg ${
        isFault ? 'bg-danger/10 border border-danger/20' : 'bg-success/5 border border-success/10'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isFault ? 'bg-danger animate-pulse' : 'bg-success'}`} />
        <span className={`text-xs ${isFault ? 'text-danger/90' : 'text-success/80'}`}>
          {isFault ? '已触发异常报警，设备管理页面将显示告警' : '运行正常，无告警'}
        </span>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSet(panel.id, 'normal')}
          disabled={!isFault}
          className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
            !isFault
              ? 'border-success/50 bg-success/15 text-success cursor-default'
              : 'border-success/30 bg-transparent text-success/60 hover:bg-success/10 hover:border-success/50 hover:text-success'
          }`}
        >
          ✓ 正常
        </button>
        <button
          onClick={() => onSet(panel.id, 'fault')}
          disabled={isFault}
          className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
            isFault
              ? 'border-danger/50 bg-danger/15 text-danger cursor-default'
              : 'border-danger/30 bg-transparent text-danger/60 hover:bg-danger/10 hover:border-danger/50 hover:text-danger'
          }`}
        >
          ⚠ 异常
        </button>
      </div>
    </motion.div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [overrides, setOverrides] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setOverrides(readOverrides())
  }, [])

  const handleSet = useCallback((panelId, status) => {
    setOverrides((prev) => {
      const next = { ...prev, [panelId]: status }
      writeOverrides(next)
      return next
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const resetAll = useCallback(() => {
    const reset = {}
    PV_PANELS.forEach((p) => { reset[p.id] = 'normal' })
    writeOverrides(reset)
    setOverrides(reset)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const faultCount = PV_PANELS.filter((p) => overrides[p.id] === 'fault').length

  return (
    <div className="min-h-screen dashboard-bg">
      {/* Header */}
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
                  ✓ 已同步至设备管理页面
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
        {/* Summary bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-display text-white">光伏阵列控制台</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              点击「异常」触发对应阵列报警，点击「正常」恢复；状态实时同步至设备管理页面
            </p>
          </div>
          <div className="flex items-center gap-3">
            {faultCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium border border-danger/40 bg-danger/10 text-danger">
                {faultCount} 路告警中
              </span>
            )}
            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-xl text-xs text-neutral-400 border border-neutral-700 hover:border-primary/40 hover:text-primary transition-colors"
            >
              全部恢复正常
            </button>
          </div>
        </div>

        {/* Panel cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PV_PANELS.map((panel) => (
            <PanelControlCard
              key={panel.id}
              panel={panel}
              override={overrides[panel.id]}
              onSet={handleSet}
            />
          ))}
        </div>

        {/* Info box */}
        <div className="mt-6 px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950/50">
          <p className="text-xs text-neutral-500 leading-relaxed">
            <span className="text-neutral-400 font-medium">说明：</span>
            管理员手动触发「异常」后，对应光伏阵列将在设备管理页面显示"异常报警"状态。
            正常运行时，系统根据实时发电量自动判断：发电量低于在线平均值 80% 且偏差大于 10W 时自动告警。
          </p>
        </div>
      </main>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Restore session within same browser tab session
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
