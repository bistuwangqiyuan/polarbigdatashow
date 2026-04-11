'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  getHistoryTrendPack,
  getHistoryOverviewStats,
  getHistoryComparisonSeries,
  getHistoryDetailRows,
  TIANJIN_PLANT,
} from 'lib/tianjinHistoryModel'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedDataType, setSelectedDataType] = useState('power')
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const trendData = useMemo(
    () => getHistoryTrendPack(selectedDataType, selectedPeriod),
    [selectedDataType, selectedPeriod]
  )

  const comparison = useMemo(() => getHistoryComparisonSeries(), [])
  const overviewStats = useMemo(() => getHistoryOverviewStats(), [])
  const historyRows = useMemo(() => getHistoryDetailRows(), [])

  const longTermTrendOption = useMemo(() => {
    const total = trendData.xAxis.map((_, i) => trendData.solar[i] + trendData.storage[i])
    const yName =
      selectedDataType === 'power'
        ? `电量 (${trendData.unit})`
        : selectedDataType === 'revenue'
          ? `收益 (${trendData.unit})`
          : `CO₂ 当量 (${trendData.unit})`

    return {
      backgroundColor: 'transparent',
      grid: { top: 60, left: 80, right: 40, bottom: 100 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter(params) {
          let result = `${params[0].name}<br/>`
          params.forEach((item) => {
            const v =
              typeof item.value === 'number' ? item.value.toLocaleString() : item.value
            result += `${item.seriesName}: ${v} ${trendData.unit}<br/>`
          })
          return result
        },
      },
      legend: {
        data: ['光伏发电', '储能相关', '总计'],
        textStyle: { color: '#999' },
        top: 10,
      },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider',
          start: 0,
          end: 100,
          bottom: 20,
          textStyle: { color: '#999' },
          borderColor: '#333',
          fillerColor: 'rgba(0, 212, 255, 0.2)',
          handleStyle: { color: '#00d4ff' },
          dataBackground: {
            lineStyle: { color: '#333' },
            areaStyle: { color: 'rgba(0, 212, 255, 0.1)' },
          },
        },
      ],
      xAxis: {
        type: 'category',
        data: trendData.xAxis,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        name: yName,
        nameTextStyle: { color: '#999' },
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: {
          color: '#999',
          formatter: (value) => value.toLocaleString(),
        },
        splitLine: { lineStyle: { color: '#1a1a1a' } },
      },
      series: [
        {
          name: '光伏发电',
          type: 'bar',
          stack: 'total',
          data: trendData.solar,
          itemStyle: { color: '#00d4ff' },
          emphasis: {
            itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0, 212, 255, 0.5)' },
          },
        },
        {
          name: '储能相关',
          type: 'bar',
          stack: 'total',
          data: trendData.storage,
          itemStyle: { color: '#ffaa00' },
        },
        {
          name: '总计',
          type: 'line',
          data: total,
          itemStyle: { color: '#ff3366' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 8,
        },
      ],
    }
  }, [trendData, selectedDataType])

  const comparisonOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      grid: { top: 60, left: 80, right: 80, bottom: 60 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['同比增长', '环比增长'],
        textStyle: { color: '#999' },
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: comparison.xAxis,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#999' },
      },
      yAxis: [
        {
          type: 'value',
          name: '增长率 (%)',
          nameTextStyle: { color: '#999' },
          axisLine: { lineStyle: { color: '#333' } },
          axisLabel: { color: '#999' },
          splitLine: { lineStyle: { color: '#1a1a1a' } },
        },
      ],
      series: [
        {
          name: '同比增长',
          type: 'line',
          smooth: true,
          data: comparison.yoy,
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
        {
          name: '环比增长',
          type: 'line',
          smooth: true,
          data: comparison.mom,
          itemStyle: { color: '#00ff88' },
        },
      ],
    }),
    [comparison]
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
                <h1 className="text-2xl font-display text-primary glow-text">历史数据查询</h1>
                <p className="text-xs text-neutral-500 mt-1">
                  {TIANJIN_PLANT.siteLabel} · {TIANJIN_PLANT.panelCount}×{TIANJIN_PLANT.panelRatedW}W（
                  {TIANJIN_PLANT.peakKwDc}kWp）· 并网约 {TIANJIN_PLANT.monthsInOperation} 个月
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 lg:gap-8">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { value: 'power', label: '发电量' },
                  { value: 'revenue', label: '收益' },
                  { value: 'co2', label: 'CO₂减排' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedDataType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedDataType === type.value
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-primary/30'
                    }`}
                  >
                    {type.label}
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
          {overviewStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="stat-card"
            >
              <p className="text-neutral-400 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-display text-primary mb-1">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.date}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="stat-card"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
              <div>
                <h3 className="text-lg font-display text-primary">趋势分析</h3>
                <p className="text-xs text-neutral-500 mt-1">{trendData.note}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['year', 'month', 'week'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${
                      selectedPeriod === period
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-primary/30'
                    }`}
                  >
                    {period === 'year' && '年度'}
                    {period === 'month' && '月度'}
                    {period === 'week' && '周度'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-96">
              <ReactECharts option={longTermTrendOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-1">增长率分析</h3>
            <p className="text-xs text-neutral-500 mb-4">{comparison.note}</p>
            <div className="h-80">
              <ReactECharts option={comparisonOption} style={{ height: '100%' }} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display text-primary">详细历史记录</h3>
            <button
              type="button"
              className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors text-sm"
            >
              导出数据
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">日期</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">光伏 (kWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">储能 (kWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">合计 (kWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">收益 (元)</th>
                  <th className="text-center py-3 px-4 text-neutral-400 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((row, index) => (
                  <motion.tr
                    key={row.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-neutral-300">{row.date}</td>
                    <td className="py-3 px-4 text-right font-display text-primary">{row.solar}</td>
                    <td className="py-3 px-4 text-right font-display text-primary">{row.storage}</td>
                    <td className="py-3 px-4 text-right font-display text-warning">{row.total}</td>
                    <td className="py-3 px-4 text-right font-display text-success">{row.revenue}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${row.status === 'excellent' && 'bg-success/20 text-success border border-success/30'}
                        ${row.status === 'normal' && 'bg-primary/20 text-primary border border-primary/30'}
                        ${row.status === 'warning' && 'bg-warning/20 text-warning border border-warning/30'}
                      `}
                      >
                        {row.status === 'excellent' && '优秀'}
                        {row.status === 'normal' && '正常'}
                        {row.status === 'warning' && '预警'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
