'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Central3DDisplay from 'components/dashboard/Central3DDisplay'
import EnhancedStatCard from 'components/dashboard/EnhancedStatCard'
import { useRealtimeData } from 'hooks/useRealtimeData'
import { isDatabaseConfigured } from 'lib/db'

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
  const [weatherData, setWeatherData] = useState({
    temperature: 18.5,
    humidity: 46,
    lightIntensity: 42000
  })

  const [dynamicData, setDynamicData] = useState({
    solarPower: 480,
    batteryCharging: 52,
    gridPower: 428,
    efficiency: { solar: 91.8 },
    todayGenerated: { solar: 1.82 },
    todayCharged: 0.32,
    todayRevenue: 1.00,
    batterySOC: 72,
    batteryCapacity: 1.44
  })

  // 时间更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 环境数据模拟（天津滨海新区，4月春季）
  useEffect(() => {
    const updateWeather = () => {
      const now = new Date()
      const h = now.getHours() + now.getMinutes() / 60

      // 温度：日间 15-23°C，夜间 9-14°C（天津4月典型值）
      let tempBase
      if (h >= 6 && h < 10) tempBase = 10 + (h - 6) * 2.25
      else if (h >= 10 && h < 15) tempBase = 19 + Math.sin((h - 10) / 5 * Math.PI) * 3.5
      else if (h >= 15 && h < 20) tempBase = 19 - (h - 15) * 1.8
      else {
        const nh = h >= 20 ? h - 20 : h + 4
        tempBase = 10 + Math.sin(nh / 10 * Math.PI) * 0.8
      }
      const temperature = parseFloat((tempBase + (Math.random() - 0.5) * 1.2).toFixed(1))

      // 湿度：与温度大致反相，天津春季偏干燥 30-60%
      let humBase
      if (h >= 10 && h < 16) humBase = 34 + Math.random() * 8
      else if (h >= 6 && h < 10) humBase = 48 - (h - 6) * 2
      else humBase = 50 + Math.random() * 8
      const humidity = Math.round(humBase + (Math.random() - 0.5) * 4)

      // 光照度（lux）：夜间 0，日出日落 1000-5000，正午晴天 60000-80000
      let lightBase = 0
      if (h >= 6 && h <= 18) {
        const solarAngle = ((h - 12) / 6) * (Math.PI / 2)
        lightBase = 75000 * Math.max(0, Math.cos(solarAngle))
      }
      const lightIntensity = Math.round(Math.max(0, lightBase + (Math.random() - 0.5) * lightBase * 0.1))

      setWeatherData({ temperature, humidity, lightIntensity })
    }

    updateWeather()
    const weatherTimer = setInterval(updateWeather, 30000)
    return () => clearInterval(weatherTimer)
  }, [])

  // 数据动态更新（每5秒）—— 800W光伏电站（4×200W光伏板）
  useEffect(() => {
    const dataTimer = setInterval(() => {
      setDynamicData(prev => {
        const now = new Date()
        const timeDecimal = now.getHours() + now.getMinutes() / 60
        const isDaytime = timeDecimal >= 6 && timeDecimal <= 18

        // 光伏功率：余弦曲线模拟日照（800W额定，4×200W）
        let solarBase = 0
        if (isDaytime) {
          const solarNoon = 12.5
          const halfDay = 6.5
          const angle = ((timeDecimal - solarNoon) / halfDay) * (Math.PI / 2)
          solarBase = 800 * 0.85 * Math.max(0, Math.cos(angle))
        }
        const newSolarPower = Math.max(0, solarBase + (Math.random() - 0.5) * solarBase * 0.08)

        const batteryCharging = newSolarPower * (0.12 + Math.random() * 0.08)
        const gridPower = newSolarPower - batteryCharging

        const solarEfficiency = newSolarPower > 0
          ? Math.min(95, 83 + (newSolarPower / 800) * 12) : 0

        const solarIncrement = (newSolarPower * 5) / 3600000
        const chargeIncrement = (batteryCharging * 5) / 3600000
        const revenueIncrement = solarIncrement * 0.55

        const newBatteryCapacity = Math.min(2.0, prev.batteryCapacity + chargeIncrement)
        const newBatterySOC = Math.round((newBatteryCapacity / 2.0) * 100)

        return {
          solarPower: Math.round(newSolarPower),
          batteryCharging: Math.round(batteryCharging),
          gridPower: Math.round(gridPower),
          efficiency: {
            solar: solarEfficiency.toFixed(1)
          },
          todayGenerated: {
            solar: parseFloat((prev.todayGenerated.solar + solarIncrement).toFixed(2))
          },
          todayCharged: parseFloat((prev.todayCharged + chargeIncrement).toFixed(2)),
          todayRevenue: parseFloat((prev.todayRevenue + revenueIncrement).toFixed(2)),
          batterySOC: newBatterySOC,
          batteryCapacity: parseFloat(newBatteryCapacity.toFixed(2))
        }
      })
    }, 5000)

    return () => clearInterval(dataTimer)
  }, [])

  // 加载状态处理
  if (loading && !realtime) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary text-2xl font-display animate-pulse mb-4">
            {!isDatabaseConfigured ? '正在启动大屏模式...' : '系统加载中...'}
          </div>
          {!isDatabaseConfigured && (
            <div className="text-sm text-warning bg-warning/10 px-4 py-2 rounded border border-warning/30">
              未配置数据库，正在使用模拟数据运行
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
            {!isDatabaseConfigured 
              ? '配置错误：请检查数据库配置' 
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

  // 800W 光伏电站数据（4×200W光伏板，已运行约90天）
  const mockData = {
    yesterdayPower: { solar: 2.76, charge: 0.55, revenue: 1.52 },
    batteryStatus: { fuelSaved: 27.8 },
    solarStats: {
      totalGenerated: 248.6,
      totalCharge: 49.7,
      totalGrid: 124.3
    },
    baseRevenue: 135.57
  }

  return (
    <div className="min-h-screen dashboard-bg relative overflow-hidden" id="main-content" role="main">
      {/* 背景装饰 */}
      <div className="absolute inset-0 grid-bg opacity-10" aria-hidden="true"></div>
      
      {/* 顶部标题栏 */}
      <header className="relative z-20 border-b border-primary/30 backdrop-blur-sm" role="banner">
        <div className="px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/image/logo.png"
                alt="光伏新能源管理系统Logo - 智能能源监控平台"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
              <h1 className="text-2xl font-display text-primary glow-text" itemProp="name">
                光伏能源关断管理系统
              </h1>
              <p className="sr-only">专业的光伏新能源实时监控与智能管理平台，提供7x24小时光伏发电和储能系统监控服务</p>
            </div>
            <div className="flex items-center gap-8">
              <nav className="flex items-center gap-5" role="navigation" aria-label="主导航">
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
                {!isDatabaseConfigured && (
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
        {/* 地点与环境监测信息栏 */}
        <div className="px-8 pb-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-neutral-300">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-primary/90">天津滨海泰达科技发展中心</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96L13.75 4a2 2 0 00-3.5 0L3.32 16.04A2 2 0 005.07 19z" />
                </svg>
                <span className="text-neutral-400">温度</span>
                <motion.span 
                  key={weatherData.temperature}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="font-display text-red-400"
                >
                  {weatherData.temperature}°C
                </motion.span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="text-neutral-400">湿度</span>
                <motion.span 
                  key={weatherData.humidity}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="font-display text-blue-400"
                >
                  {weatherData.humidity}%
                </motion.span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-neutral-400">光照度</span>
                <motion.span 
                  key={weatherData.lightIntensity}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="font-display text-yellow-400"
                >
                  {weatherData.lightIntensity.toLocaleString()} lux
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 h-[calc(100vh-100px)] p-6" role="main" itemScope itemType="https://schema.org/Dashboard">
        <div className="h-full grid grid-cols-12 gap-6">
          {/* 左侧统计卡片 */}
          <div className="col-span-3 space-y-6">
            {/* 昨日电量统计 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <article className="stat-card" role="region" aria-label="昨日电量与收益统计">
                <h2 className="text-lg font-display text-primary mb-4">昨日电量与收益统计</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">光伏发电</span>
                    <span className="text-lg font-display text-primary">{mockData.yesterdayPower.solar.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">储能充电量</span>
                    <span className="text-lg font-display text-primary">{mockData.yesterdayPower.charge.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">昨日收益</span>
                    <span className="text-lg font-display text-warning">{mockData.yesterdayPower.revenue.toFixed(2)} 元</span>
                  </div>
                </div>
              </article>
            </motion.div>

            {/* 电池储量统计 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <article className="stat-card" role="region" aria-label="电池储量与放电统计">
                <h2 className="text-lg font-display text-primary mb-4">电池储量与放电统计</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-neutral-400">电池电量</span>
                      <motion.span 
                        key={dynamicData.batterySOC}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg font-display text-primary"
                      >
                        {dynamicData.batterySOC}%
                      </motion.span>
                    </div>
                    <div className="w-full h-4 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        animate={{ width: `${dynamicData.batterySOC}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">剩余电量</span>
                    <motion.span 
                      key={dynamicData.batteryCapacity}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-lg font-display text-primary"
                    >
                      {dynamicData.batteryCapacity.toFixed(2)} kWh
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">节约汽油</span>
                    <span className="text-lg font-display text-success">{mockData.batteryStatus.fuelSaved} L</span>
                  </div>
                </div>
              </article>
            </motion.div>
          </div>

          {/* 中央3D展示区 */}
          <section className="col-span-6" role="region" aria-label="实时能源可视化展示">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <Central3DDisplay data={{ 
                solarPower: dynamicData.solarPower 
              }} />
            </motion.div>
          </section>

          {/* 右侧统计卡片 */}
          <aside className="col-span-3 space-y-6" role="complementary" aria-label="实时数据统计">
            {/* 今日电量统计 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <article className="stat-card" role="region" aria-label="今天电量与收益统计">
                <h2 className="text-lg font-display text-primary mb-4">今天电量与收益统计</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">光伏发电</span>
                    <motion.span 
                      key={dynamicData.todayGenerated.solar}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-display text-primary"
                    >
                      {dynamicData.todayGenerated.solar.toFixed(2)} kWh
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">储能充电量</span>
                    <motion.span 
                      key={dynamicData.todayCharged}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-display text-primary"
                    >
                      {dynamicData.todayCharged.toFixed(2)} kWh
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">今日收益</span>
                    <motion.span 
                      key={dynamicData.todayRevenue}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-display text-warning"
                    >
                      {dynamicData.todayRevenue.toFixed(2)} 元
                    </motion.span>
                  </div>
                </div>
              </article>
            </motion.div>

            {/* 风光储充数据统计 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <article className="stat-card" role="region" aria-label="光储数据统计">
                <h2 className="text-lg font-display text-primary mb-4">光储数据统计</h2>
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <motion.div 
                      key={dynamicData.solarPower}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-display text-primary glow-text"
                    >
                      {dynamicData.solarPower}
                    </motion.div>
                    <div className="text-xs text-neutral-400">光伏实时功率(W)</div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">累计发电量</span>
                    <span className="font-display text-primary">{mockData.solarStats.totalGenerated.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">累计充电量</span>
                    <span className="font-display text-primary">{mockData.solarStats.totalCharge.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">累计放电量</span>
                    <span className="font-display text-primary">{mockData.solarStats.totalGrid.toFixed(1)} kWh</span>
                  </div>
                </div>
              </article>
            </motion.div>
          </aside>
        </div>

        {/* 底部累计收益 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <aside className="flex items-center gap-4 px-8 py-4 stat-card" role="contentinfo" aria-label="累计总收益">
            <MoneyIcon />
            <div>
              <span className="text-neutral-400 mr-2">累计总收益</span>
              <motion.span 
                key={mockData.baseRevenue + dynamicData.todayRevenue}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-display text-warning glow-text"
              >
                {(mockData.baseRevenue + dynamicData.todayRevenue).toFixed(2)}
              </motion.span>
              <span className="text-lg text-warning ml-2">元</span>
            </div>
          </aside>
        </motion.div>

        {/* 左下角企业宣传图 - 与左侧卡片对齐 */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute bottom-6 left-6 w-[calc(25%-1.5rem)]"
        >
          <figure className="relative group w-full">
            <Image
              src="/image/aboutus.png"
              alt="光伏新能源企业宣传 - 绿色能源解决方案提供商，专注于光伏发电系统集成与优化"
              width={400}
              height={160}
              className="w-full h-auto rounded-lg shadow-xl border border-primary/20 object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
              itemProp="image"
            />
            <figcaption className="sr-only">光伏新能源企业形象展示</figcaption>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
          </figure>
        </motion.div>

        {/* 右下角企业宣传图 - 与右侧卡片对齐 */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute bottom-6 right-6 w-[calc(25%-1.5rem)]"
        >
          <figure className="relative group w-full">
            <Image
              src="/image/aboutus2.jpg"
              alt="新能源技术展示 - 光伏储能一体化管理，智慧能源综合解决方案"
              width={400}
              height={160}
              className="w-full h-auto rounded-lg shadow-xl border border-primary/20 object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
              itemProp="image"
            />
            <figcaption className="sr-only">新能源技术应用展示</figcaption>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
          </figure>
        </motion.div>
      </main>
    </div>
  )
}