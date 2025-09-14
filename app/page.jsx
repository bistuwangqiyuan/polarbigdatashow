'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Central3DDisplay from 'components/dashboard/Central3DDisplay'
import EnhancedStatCard from 'components/dashboard/EnhancedStatCard'
import { useRealtimeData } from 'hooks/useRealtimeData'
import { isSupabaseConfigured } from 'lib/supabase'

// 图标组件
const PowerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const BatteryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-7 0h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zm16 0V9" />
  </svg>
)

const WindIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
)

const ChargingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function EnhancedDashboard() {
  const { realtime, summary, inverters, alerts, trend, loading, error } = useRealtimeData()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 加载状态处理
  if (loading && !realtime) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary text-2xl font-display animate-pulse mb-4">
            {!isSupabaseConfigured ? '正在启动大屏模式...' : '系统加载中...'}
          </div>
          {!isSupabaseConfigured && (
            <div className="text-sm text-warning bg-warning/10 px-4 py-2 rounded border border-warning/30">
              未配置 Supabase，正在使用模拟数据运行
            </div>
          )}
        </div>
      </div>
    )
  }

  // 错误状态处理
  if (error) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-danger text-xl font-display mb-4">加载失败</div>
          <div className="text-neutral-400 text-sm mb-4">
            {!isSupabaseConfigured 
              ? '配置错误：请检查 Supabase 配置' 
              : `错误信息：${error}`
            }
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-black rounded hover:bg-primary/80 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  // 模拟数据（基于10MW总容量：光伏5MW + 风力5MW）
  const mockData = {
    yesterdayPower: { solar: 12500, wind: 15000, charge: 5500, grid: 13750 },
    todayPower: { solar: 10200, wind: 12800, charge: 4600, grid: 11500 },
    batteryStatus: { percentage: 88, soc: 1760, charging: 4600 },
    windSolarStats: {
      currentSolar: 2000,
      currentWind: 2500,
      totalGenerated: 3150000,
      totalCharge: 630000,
      totalGrid: 1575000
    },
    revenue: 1575000
  }

  return (
    <div className="min-h-screen dashboard-bg relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 grid-bg opacity-10"></div>
      
      {/* 顶部标题栏 */}
      <header className="relative z-20 border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <h1 className="text-3xl font-display text-primary glow-text">
                光伏能源关断管理系统
              </h1>
            </div>
            <div className="flex items-center gap-8">
              {/* 导航菜单 */}
              <nav className="flex items-center gap-6">
                <Link href="/about" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  关于我们
                </Link>
                <Link href="/devices" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  设备管理
                </Link>
                <Link href="/analytics" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  数据分析
                </Link>
                <Link href="/history" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  历史趋势
                </Link>
                <Link href="/settings" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  系统设置
                </Link>
              </nav>
              <div className="flex items-center gap-6">
                {/* 配置状态指示器 */}
                {!isSupabaseConfigured && (
                  <div className="px-3 py-1 text-xs bg-warning/20 text-warning border border-warning/30 rounded-full">
                    大屏模式
                  </div>
                )}
                <div className="text-lg font-display text-primary">
                  {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
                </div>
                <div className="text-sm text-neutral-400">
                  {currentTime.toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                    weekday: 'long'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 h-[calc(100vh-80px)] p-6">
        <div className="h-full grid grid-cols-12 gap-6">
          {/* 左侧统计卡片 */}
          <div className="col-span-3 space-y-6">
            {/* 昨日电量统计 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="stat-card">
                <h3 className="text-lg font-display text-primary mb-4">昨日电量与收益统计</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">光伏发电</span>
                    <span className="text-lg font-display text-primary">{mockData.yesterdayPower.solar} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">风力发电</span>
                    <span className="text-lg font-display text-primary">{mockData.yesterdayPower.wind} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">储能充电量</span>
                    <span className="text-lg font-display text-primary">{mockData.yesterdayPower.charge} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">累计总收益</span>
                    <span className="text-lg font-display text-warning">{mockData.yesterdayPower.grid} 元</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 电池储量统计 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="stat-card">
                <h3 className="text-lg font-display text-primary mb-4">电池储量与放电统计</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-400">电池电量</span>
                      <span className="text-lg font-display text-primary">{mockData.batteryStatus.percentage}%</span>
                    </div>
                    <div className="w-full h-4 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${mockData.batteryStatus.percentage}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">剩余电量</span>
                    <span className="text-lg font-display text-primary">{mockData.batteryStatus.soc} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">节约汽油</span>
                    <span className="text-lg font-display text-success">{mockData.batteryStatus.charging} L</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 中央3D展示区 */}
          <div className="col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Central3DDisplay data={{ solarPower: 20, windPower: 25 }} />
            </motion.div>
          </div>

          {/* 右侧统计卡片 */}
          <div className="col-span-3 space-y-6">
            {/* 今日电量统计 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="stat-card">
                <h3 className="text-lg font-display text-primary mb-4">今天电量与收益统计</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">光伏发电</span>
                    <span className="text-lg font-display text-primary">{mockData.todayPower.solar} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">风力发电</span>
                    <span className="text-lg font-display text-primary">{mockData.todayPower.wind} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">储能充电量</span>
                    <span className="text-lg font-display text-primary">{mockData.todayPower.charge} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">累计总收益</span>
                    <span className="text-lg font-display text-warning">{mockData.todayPower.grid} 元</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 风光储充数据统计 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="stat-card">
                <h3 className="text-lg font-display text-primary mb-4">风光储充数据统计</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-display text-primary glow-text">
                        {mockData.windSolarStats.currentSolar}
                      </div>
                      <div className="text-xs text-neutral-400">光伏功率(kW)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-display text-primary glow-text">
                        {mockData.windSolarStats.currentWind}
                      </div>
                      <div className="text-xs text-neutral-400">风机功率(kW)</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">累计发电量</span>
                    <span className="font-display text-primary">{mockData.windSolarStats.totalGenerated.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">累计充电量</span>
                    <span className="font-display text-primary">{mockData.windSolarStats.totalCharge.toLocaleString()} kWh</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">累计放电量</span>
                    <span className="font-display text-primary">{mockData.windSolarStats.totalGrid.toLocaleString()} kWh</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 底部累计收益 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-4 px-8 py-4 stat-card">
            <MoneyIcon />
            <div>
              <span className="text-neutral-400 mr-2">累计总收益</span>
              <span className="text-3xl font-display text-warning glow-text">
                {mockData.revenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-lg text-warning ml-2">元</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}