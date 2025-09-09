'use client'

import { motion } from 'framer-motion'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen dashboard-bg grid-bg overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        {/* 顶部标题栏 */}
        <header className="relative z-10 border-b border-primary/20 bg-neutral-900/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <div className="w-6 h-6 rounded-full bg-primary"></div>
                </motion.div>
                <h1 className="text-2xl font-bold text-primary glow-text" style={{ fontFamily: 'var(--font-display)' }}>
                  光伏电站智能监控中心
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-sm text-neutral-400">
                  <span className="text-primary">{new Date().toLocaleDateString('zh-CN')}</span>
                  <span className="ml-4" id="clock">{new Date().toLocaleTimeString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm text-success">系统正常</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="relative p-6 h-[calc(100vh-73px)] overflow-auto">
          <div className="max-w-[1920px] mx-auto h-full">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  )
}