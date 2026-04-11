'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SafeECharts from '../../components/charts/SafeECharts'
import { buildAnalyticsForRange, TIANJIN_PLANT } from 'lib/tianjinPlantAnalyticsModel'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pack = useMemo(() => buildAnalyticsForRange(dateRange), [dateRange])

  const powerTrendOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      grid: {
        top: 60,
        left: 80,
        right: 40,
        bottom: 60,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['光伏发电'],
        textStyle: { color: '#999' },
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: pack.powerTrend.xAxis,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: pack.powerTrend.yName,
        nameTextStyle: { color: '#999' },
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
        splitLine: { lineStyle: { color: '#1a1a1a' } },
      },
      series: [
        {
          name: '光伏发电',
          type: 'line',
          smooth: true,
          data: pack.powerTrend.solar,
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
                { offset: 1, color: 'rgba(0, 212, 255, 0)' },
              ],
            },
          },
        },
      ],
    }),
    [pack.powerTrend]
  )

  const efficiencyOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      grid: {
        top: 40,
        left: 60,
        right: 40,
        bottom: 60,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
      },
      xAxis: {
        type: 'category',
        data: pack.efficiency.xAxis,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
      },
      yAxis: {
        type: 'value',
        name: '效率 (%)',
        min: 0,
        max: 100,
        nameTextStyle: { color: '#999' },
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
        splitLine: { lineStyle: { color: '#1a1a1a' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: pack.efficiency.data,
          itemStyle: { color: '#00ff88' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 255, 136, 0.3)' },
                { offset: 1, color: 'rgba(0, 255, 136, 0)' },
              ],
            },
          },
          markLine: {
            data: [{ type: 'average', name: '平均值' }],
            lineStyle: { color: '#ffaa00' },
          },
        },
      ],
    }),
    [pack.efficiency]
  )

  const distributionOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: '{b}: {c} kWh ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 20,
        top: 'center',
        textStyle: { color: '#999' },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: pack.distribution,
          label: {
            show: true,
            formatter: '{b}: {d}%',
            color: '#999',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 212, 255, 0.5)',
            },
          },
        },
      ],
    }),
    [pack.distribution]
  )

  const heatmapOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: (p) => {
          const triple = Array.isArray(p.value) ? p.value : p.data
          if (!Array.isArray(triple) || triple.length < 3) return ''
          const [xi, yi, val] = triple
          const x = pack.heatmap.xAxis[xi] ?? xi
          const y = pack.heatmap.yAxis[yi] ?? yi
          return `${y} · ${x}<br/>相对出力: ${val}%`
        },
      },
      grid: {
        top: 60,
        left: 100,
        right: 40,
        bottom: 60,
      },
      xAxis: {
        type: 'category',
        data: pack.heatmap.xAxis,
        splitArea: { show: true },
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
      },
      yAxis: {
        type: 'category',
        data: pack.heatmap.yAxis,
        splitArea: { show: true },
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        inRange: {
          color: ['#1a1a1a', '#0066cc', '#00d4ff', '#00ff88', '#ffaa00', '#ff3366'],
        },
        textStyle: { color: '#999' },
        formatter: (v) => `${v}%`,
      },
      series: [
        {
          type: 'heatmap',
          data: pack.heatmap.data,
          label: {
            show: true,
            color: '#fff',
            formatter: (p) => {
              const triple = Array.isArray(p.value) ? p.value : p.data
              return Array.isArray(triple) ? triple[2] : ''
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 212, 255, 0.5)',
            },
          },
        },
      ],
    }),
    [pack]
  )

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回主页
              </Link>
              <Image src="/image/logo.png" alt="公司Logo" width={50} height={50} className="object-contain" />
              <div>
                <h1 className="text-2xl font-display text-primary glow-text">数据分析中心</h1>
                <p className="text-xs text-neutral-500 mt-1">
                  {TIANJIN_PLANT.siteLabel} · {TIANJIN_PLANT.panelCount}×{TIANJIN_PLANT.panelRatedW}W（合计{' '}
                  {TIANJIN_PLANT.peakKwDc}kWp）· 天津 · 已投运约 {TIANJIN_PLANT.monthsInOperation} 个月
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 lg:gap-8">
              <div className="flex items-center gap-2 flex-wrap">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      dateRange === range
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-primary/30'
                    }`}
                  >
                    {range === 'day' && '今日'}
                    {range === 'week' && '本周'}
                    {range === 'month' && '本月'}
                    {range === 'year' && '本年'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-6">
                <div className="text-lg font-display text-primary">
                  {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
                </div>
                <div className="text-sm text-neutral-400">
                  {currentTime.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    weekday: 'long',
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {pack.metrics.map((metric, index) => (
            <motion.div
              key={`${dateRange}-${metric.label}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="stat-card"
            >
              <p className="text-neutral-400 text-sm mb-2">{metric.label}</p>
              <p className="text-3xl font-display text-primary mb-1">{metric.value}</p>
              <p className={`text-sm ${metric.color}`}>{metric.change}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-1">发电量趋势分析</h3>
            <p className="text-xs text-neutral-500 mb-4">{pack.powerFootnote}</p>
            <div className="h-80">
              <SafeECharts option={powerTrendOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-1">系统效率变化</h3>
            <p className="text-xs text-neutral-500 mb-4">{pack.efficiency.footnote}</p>
            <div className="h-80">
              <SafeECharts option={efficiencyOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-1">能源去向（同一时段内）</h3>
            <p className="text-xs text-neutral-500 mb-4">
              光伏总发电量拆分为就地消纳、储能充电与逆变/线路损耗，单位 kWh。
            </p>
            <div className="h-80">
              <SafeECharts option={distributionOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-1">四块组件相对出力热力图</h3>
            <p className="text-xs text-neutral-500 mb-4">
              与设备管理中「光伏阵列-01～04」对应；数值为相对额定出力的百分比（演示归一化）。
            </p>
            <div className="h-80">
              <SafeECharts option={heatmapOption} style={{ height: '100%' }} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 mb-8"
        >
          <h3 className="text-xl font-display text-primary mb-8 text-center">企业实力</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-xl shadow-xl">
              <Image
                src="/image/aboutus2.jpg"
                alt="科研设施"
                width={600}
                height={300}
                className="w-full h-60 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-xl font-medium">科研设施</h4>
                <p className="text-sm text-neutral-300">先进的研发实验中心</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-xl shadow-xl">
              <Image
                src="/image/oiltank.jpg"
                alt="储运设施"
                width={600}
                height={300}
                className="w-full h-60 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-xl font-medium">储运设施</h4>
                <p className="text-sm text-neutral-300">大型油气储运基地</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
