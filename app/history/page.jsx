'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 动态导入ECharts组件
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedDataType, setSelectedDataType] = useState('power')

  // 长期趋势图配置
  const longTermTrendOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 60,
      left: 80,
      right: 40,
      bottom: 100
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: function(params) {
        let result = params[0].name + '<br/>'
        params.forEach(item => {
          result += `${item.seriesName}: ${item.value.toLocaleString()} ${
            selectedDataType === 'power' ? 'MWh' : 
            selectedDataType === 'revenue' ? '元' : 
            '吨'
          }<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['光伏发电', '风力发电', '储能系统', '总计'],
      textStyle: { color: '#999' },
      top: 10
    },
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }, {
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
        areaStyle: { color: 'rgba(0, 212, 255, 0.1)' }
      }
    }],
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: selectedDataType === 'power' ? '发电量 (MWh)' : 
            selectedDataType === 'revenue' ? '收益 (万元)' : 
            'CO₂减排 (吨)',
      nameTextStyle: { color: '#999' },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { 
        color: '#999',
        formatter: function(value) {
          return value.toLocaleString()
        }
      },
      splitLine: { lineStyle: { color: '#1a1a1a' } }
    },
    series: [
      {
        name: '光伏发电',
        type: 'bar',
        stack: 'total',
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000, 24000, 22000, 18000, 15000, 14000],
        itemStyle: { color: '#00d4ff' },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 212, 255, 0.5)'
          }
        }
      },
      {
        name: '风力发电',
        type: 'bar',
        stack: 'total',
        data: [8000, 9000, 7000, 8500, 9500, 8800, 9200, 9800, 8600, 7500, 8200, 8800],
        itemStyle: { color: '#00ff88' }
      },
      {
        name: '储能系统',
        type: 'bar',
        stack: 'total',
        data: [4000, 4500, 3500, 4200, 5000, 4800, 5200, 5500, 4800, 4000, 4300, 4600],
        itemStyle: { color: '#ffaa00' }
      },
      {
        name: '总计',
        type: 'line',
        data: [24000, 26700, 20600, 26100, 23500, 36600, 35400, 39300, 35400, 29500, 27500, 27400],
        itemStyle: { color: '#ff3366' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }

  // 同比环比分析配置
  const comparisonOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 60,
      left: 80,
      right: 80,
      bottom: 60
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['同比增长', '环比增长'],
      textStyle: { color: '#999' },
      top: 10
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    yAxis: [{
      type: 'value',
      name: '增长率 (%)',
      nameTextStyle: { color: '#999' },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#1a1a1a' } }
    }],
    series: [
      {
        name: '同比增长',
        type: 'line',
        smooth: true,
        data: [5.2, 8.3, -2.1, 12.5, 15.8, 18.2, 22.5, 19.8, 16.5, 12.3, 8.9, 6.5],
        itemStyle: { color: '#00d4ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0)' }
            ]
          }
        }
      },
      {
        name: '环比增长',
        type: 'line',
        smooth: true,
        data: [3.2, 5.1, -3.5, 8.2, 10.5, 12.8, 15.2, 11.5, 8.2, 5.5, 3.2, 2.1],
        itemStyle: { color: '#00ff88' }
      }
    ]
  }

  // 历史记录表格数据
  const historyData = [
    { date: '2025-01-10', solar: 235.6, wind: 89.5, storage: 45.2, total: 370.3, revenue: 18515, status: 'normal' },
    { date: '2025-01-09', solar: 228.4, wind: 92.3, storage: 42.8, total: 363.5, revenue: 18175, status: 'normal' },
    { date: '2025-01-08', solar: 215.2, wind: 85.6, storage: 40.5, total: 341.3, revenue: 17065, status: 'warning' },
    { date: '2025-01-07', solar: 242.8, wind: 95.2, storage: 48.6, total: 386.6, revenue: 19330, status: 'normal' },
    { date: '2025-01-06', solar: 198.5, wind: 78.3, storage: 35.2, total: 312.0, revenue: 15600, status: 'normal' },
    { date: '2025-01-05', solar: 256.3, wind: 102.5, storage: 52.3, total: 411.1, revenue: 20555, status: 'excellent' },
    { date: '2025-01-04', solar: 238.9, wind: 88.7, storage: 44.8, total: 372.4, revenue: 18620, status: 'normal' },
  ]

  return (
    <div className="min-h-screen dashboard-bg">
      {/* 顶部导航 */}
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回主页
              </Link>
              <h1 className="text-2xl font-display text-primary glow-text">历史数据查询</h1>
            </div>
            
            {/* 数据类型选择 */}
            <div className="flex items-center gap-2">
              {[
                { value: 'power', label: '发电量' },
                { value: 'revenue', label: '收益' },
                { value: 'co2', label: 'CO₂减排' }
              ].map(type => (
                <button
                  key={type.value}
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
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: '历史最高日发电', value: '486.5 MWh', date: '2024-07-15' },
            { label: '历史最高月发电', value: '12,865 MWh', date: '2024年7月' },
            { label: '累计总发电量', value: '856,420 MWh', date: '自2020年起' },
            { label: '累计总收益', value: '4.28 亿元', date: '自2020年起' }
          ].map((stat, index) => (
            <motion.div
              key={index}
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

        {/* 图表区域 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 长期趋势 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="stat-card col-span-2"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-display text-primary">年度趋势分析</h3>
              <div className="flex gap-2">
                {['year', 'month', 'week'].map(period => (
                  <button
                    key={period}
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

          {/* 同比环比分析 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="stat-card col-span-2"
          >
            <h3 className="text-lg font-display text-primary mb-4">增长率分析</h3>
            <div className="h-80">
              <ReactECharts option={comparisonOption} style={{ height: '100%' }} />
            </div>
          </motion.div>
        </div>

        {/* 历史记录表格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display text-primary">详细历史记录</h3>
            <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors text-sm">
              导出数据
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">日期</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">光伏 (MWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">风力 (MWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">储能 (MWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">总计 (MWh)</th>
                  <th className="text-right py-3 px-4 text-neutral-400 font-medium">收益 (元)</th>
                  <th className="text-center py-3 px-4 text-neutral-400 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-neutral-300">{row.date}</td>
                    <td className="py-3 px-4 text-right font-display text-primary">{row.solar}</td>
                    <td className="py-3 px-4 text-right font-display text-primary">{row.wind}</td>
                    <td className="py-3 px-4 text-right font-display text-primary">{row.storage}</td>
                    <td className="py-3 px-4 text-right font-display text-warning">{row.total}</td>
                    <td className="py-3 px-4 text-right font-display text-success">{row.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${row.status === 'excellent' && 'bg-success/20 text-success border border-success/30'}
                        ${row.status === 'normal' && 'bg-primary/20 text-primary border border-primary/30'}
                        ${row.status === 'warning' && 'bg-warning/20 text-warning border border-warning/30'}
                      `}>
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