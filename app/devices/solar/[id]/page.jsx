'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { getTypicalSpringHourlyKwh, getTypicalDailyKwhSpring } from 'lib/tianjinPlantAnalyticsModel'
import { computeArrayOutputW, getTianjinDecimalHour, TIANJIN_WEATHER } from 'lib/tianjinSolarSimulation'
import { solarRealPanelSrc } from 'lib/solarRealImages'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const PANEL_RATED_W = 200

function round2(n) {
  return Math.round(n * 100) / 100
}

function buildDevice(id) {
  const specs = {
    1: {
      name: '光伏阵列-01',
      status: 'online',
      manufacturer: '晶澳太阳能',
      model: '单晶 200W 组件（子阵）',
      installDate: '2026-03-11',
      location: '天津滨海泰达 · A区-1',
      orientation: '正南',
      tilt: '30°',
      image: solarRealPanelSrc(1),
    },
    2: {
      name: '光伏阵列-02',
      status: 'online',
      manufacturer: '隆基绿能',
      model: '单晶 200W 组件（子阵）',
      installDate: '2026-03-11',
      location: '天津滨海泰达 · A区-2',
      orientation: '正南',
      tilt: '30°',
      image: solarRealPanelSrc(2),
    },
    3: {
      name: '光伏阵列-03',
      status: 'online',
      manufacturer: '天合光能',
      model: '单晶 200W 组件（子阵）',
      installDate: '2026-03-11',
      location: '天津滨海泰达 · B区-1',
      orientation: '正南',
      tilt: '28°',
      image: solarRealPanelSrc(3),
    },
    4: {
      name: '光伏阵列-04',
      status: 'offline',
      manufacturer: '通威太阳能',
      model: '单晶 200W 组件（子阵）',
      installDate: '2026-03-11',
      location: '天津滨海泰达 · B区-2',
      orientation: '正南',
      tilt: '28°',
      image: solarRealPanelSrc(4),
    },
  }
  const base = specs[id]
  if (!base) return null
  const jitter = ((id % 5) - 2) * 0.01
  const power =
    base.status === 'online'
      ? computeArrayOutputW(getTianjinDecimalHour(), TIANJIN_WEATHER.PARTLY_CLOUDY, PANEL_RATED_W, jitter)
      : 0
  const load = base.status === 'online' ? Math.round((power / PANEL_RATED_W) * 100) : 0
  const efficiency = base.status === 'online' ? parseFloat(((power / PANEL_RATED_W) * 100).toFixed(1)) : 0
  return {
    id,
    ...base,
    type: '光伏组件',
    power,
    efficiency,
    temperature: 32,
    runtime: 720,
    load,
    capacity: '200W × 1 路（全站 4×200W）',
    totalCapacity: 0.2,
  }
}

export default function SolarArrayDetailPage({ params }) {
  const rawId = params?.id
  const id = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId)

  const [device, setDevice] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDevice(buildDevice(id))
    setReady(true)
  }, [id])

  useEffect(() => {
    if (!device || device.status === 'offline') return
    const tick = () => {
      setDevice((prev) => {
        if (!prev || prev.status === 'offline') return prev
        const jitter = ((prev.id % 5) - 2) * 0.01
        const p = computeArrayOutputW(
          getTianjinDecimalHour(),
          TIANJIN_WEATHER.PARTLY_CLOUDY,
          PANEL_RATED_W,
          jitter
        )
        return {
          ...prev,
          power: p,
          load: Math.round((p / PANEL_RATED_W) * 100),
          efficiency: parseFloat(((p / PANEL_RATED_W) * 100).toFixed(1)),
        }
      })
    }
    tick()
    const t = setInterval(tick, 10000)
    return () => clearInterval(t)
  }, [device?.id, device?.status])

  const hourlyPanelW = useMemo(
    () => getTypicalSpringHourlyKwh().map((k) => Math.round((k / 4) * 1000)),
    []
  )

  const monthKwhPanel = useMemo(() => round2((getTypicalDailyKwhSpring() * 30) / 4), [])

  const powerTrendOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      title: {
        text: '典型日 24h 功率曲线（天津春季、单路 200W）',
        textStyle: { color: '#00d4ff', fontSize: 14 },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        textStyle: { color: '#fff' },
        formatter: (items) => {
          const p = items[0]
          return `${p.name}<br/>功率: ${p.value} W`
        },
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        name: '功率 (W)',
        max: 220,
        nameTextStyle: { color: '#999' },
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
        splitLine: { lineStyle: { color: '#333', type: 'dashed' } },
      },
      series: [
        {
          data: hourlyPanelW,
          type: 'line',
          smooth: true,
          lineStyle: { color: '#00d4ff', width: 2 },
          itemStyle: { color: '#00d4ff' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.05)' },
              ],
            },
          },
        },
      ],
      grid: { left: '12%', right: '5%', top: '18%', bottom: '15%' },
    }),
    [hourlyPanelW]
  )

  if (!ready) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">加载中...</div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="min-h-screen dashboard-bg flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-300">未找到该光伏阵列（本站仅 4×200W 四路子阵）。</p>
        <Link href="/devices" className="text-primary hover:underline">
          返回设备列表
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/devices" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回设备列表
              </Link>
              <Image src="/image/logo.png" alt="公司Logo" width={50} height={50} className="object-contain" />
              <h1 className="text-2xl font-display text-primary glow-text">{device.name} - 详细信息</h1>
            </div>
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                device.status === 'online'
                  ? 'bg-success/20 text-success border border-success/30'
                  : 'bg-danger/20 text-danger border border-danger/30'
              }`}
            >
              {device.status === 'online' ? '正常运行' : '已关断'}
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="stat-card">
              <h3 className="text-lg font-display text-primary mb-4">设备外观</h3>
              <div className="relative overflow-hidden rounded-lg mb-4">
                <Image
                  src={device.image}
                  alt={device.name}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm">{device.location}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">制造商</span>
                  <span className="text-primary">{device.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">型号</span>
                  <span className="text-primary">{device.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">安装日期</span>
                  <span className="text-primary">{device.installDate}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="stat-card">
              <h3 className="text-lg font-display text-primary mb-6">实时监控数据</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-display text-primary mb-2">{device.power}</div>
                  <div className="text-sm text-neutral-400">输出功率 (W)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-success mb-2">{device.efficiency}</div>
                  <div className="text-sm text-neutral-400">相对额定 (%)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-warning mb-2">{device.temperature}</div>
                  <div className="text-sm text-neutral-400">组件温度 (°C)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-secondary mb-2">{device.load}</div>
                  <div className="text-sm text-neutral-400">负载率 (%)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-neutral-800">
                <div className="space-y-3">
                  <h4 className="text-md font-display text-primary">技术参数</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">额定容量</span>
                      <span className="text-primary">{device.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">本子阵额定</span>
                      <span className="text-primary">{device.totalCapacity} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">安装位置</span>
                      <span className="text-primary">{device.location}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-md font-display text-primary">安装信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">朝向</span>
                      <span className="text-primary">{device.orientation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">倾斜角</span>
                      <span className="text-primary">{device.tilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">运行时间</span>
                      <span className="text-primary">{device.runtime}h（约30日）</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="stat-card">
            <h3 className="text-lg font-display text-primary mb-4">发电趋势</h3>
            <div className="h-80">
              <ReactECharts option={powerTrendOption} style={{ height: '100%' }} />
            </div>
          </div>

          <div className="stat-card">
            <h3 className="text-lg font-display text-primary mb-4">月度发电统计</h3>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="text-6xl font-display text-primary mb-4">{monthKwhPanel}</div>
                <div className="text-lg text-neutral-400 mb-2">本月累计发电量 (kWh)</div>
                <div className="text-sm text-neutral-500">单路子阵约占全站 0.8kWp 的 1/4（演示估算）</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="stat-card">
            <h3 className="text-lg font-display text-primary mb-6">运维记录</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
                <div>
                  <div className="text-primary font-medium">并网验收</div>
                  <div className="text-sm text-neutral-400 mt-1">接线、绝缘、IV 曲线抽检</div>
                </div>
                <div className="text-right">
                  <div className="text-success text-sm">已完成</div>
                  <div className="text-xs text-neutral-500">2026-03-11</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
                <div>
                  <div className="text-primary font-medium">首次巡检</div>
                  <div className="text-sm text-neutral-400 mt-1">组件清洁度、压块紧固</div>
                </div>
                <div className="text-right">
                  <div className="text-warning text-sm">计划中</div>
                  <div className="text-xs text-neutral-500">2026-04-18</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
                <div>
                  <div className="text-primary font-medium">数据对时</div>
                  <div className="text-sm text-neutral-400 mt-1">采集器与东八区对时</div>
                </div>
                <div className="text-right">
                  <div className="text-primary text-sm">进行中</div>
                  <div className="text-xs text-neutral-500">2026-04-11</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
