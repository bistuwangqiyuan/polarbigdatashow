'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 动态导入ECharts组件
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('power')

  // 发电量趋势图配置
  const powerTrendOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 60,
      left: 80,
      right: 40,
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
      data: ['光伏发电', '风力发电', '总发电量'],
      textStyle: { color: '#999' },
      top: 10
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '发电量 (MWh)',
      nameTextStyle: { color: '#999' },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#1a1a1a' } }
    },
    series: [
      {
        name: '光伏发电',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
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
        name: '风力发电',
        type: 'line',
        smooth: true,
        data: [80, 90, 70, 85, 95, 88, 92],
        itemStyle: { color: '#00ff88' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 255, 136, 0.3)' },
              { offset: 1, color: 'rgba(0, 255, 136, 0)' }
            ]
          }
        }
      },
      {
        name: '总发电量',
        type: 'line',
        smooth: true,
        data: [200, 222, 171, 219, 185, 318, 302],
        itemStyle: { color: '#ffaa00' },
        lineStyle: { width: 3 }
      }
    ]
  }

  // 效率分析图配置
  const efficiencyOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 40,
      left: 60,
      right: 40,
      bottom: 60
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'value',
      name: '效率 (%)',
      nameTextStyle: { color: '#999' },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#1a1a1a' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: [85, 82, 88, 95, 93, 89, 86],
      itemStyle: { color: '#00ff88' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 255, 136, 0.3)' },
            { offset: 1, color: 'rgba(0, 255, 136, 0)' }
          ]
        }
      },
      markLine: {
        data: [{ type: 'average', name: '平均值' }],
        lineStyle: { color: '#ffaa00' }
      }
    }]
  }

  // 能源分布饼图配置
  const distributionOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: '#999' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: [
        { value: 335, name: '光伏发电', itemStyle: { color: '#00d4ff' } },
        { value: 234, name: '风力发电', itemStyle: { color: '#00ff88' } },
        { value: 154, name: '储能放电', itemStyle: { color: '#ffaa00' } },
        { value: 135, name: '电网供电', itemStyle: { color: '#ff3366' } }
      ],
      label: {
        show: true,
        formatter: '{b}: {d}%',
        color: '#999'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 212, 255, 0.5)'
        }
      }
    }]
  }

  // 热力图配置
  const heatmapOption = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    grid: {
      top: 60,
      left: 80,
      right: 40,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      inRange: {
        color: ['#1a1a1a', '#0066cc', '#00d4ff', '#00ff88', '#ffaa00', '#ff3366']
      },
      textStyle: { color: '#999' }
    },
    series: [{
      type: 'heatmap',
      data: [
        [0, 0, 10], [1, 0, 20], [2, 0, 30], [3, 0, 40], [4, 0, 50], [5, 0, 40],
        [0, 1, 15], [1, 1, 25], [2, 1, 35], [3, 1, 45], [4, 1, 55], [5, 1, 45],
        [0, 2, 20], [1, 2, 30], [2, 2, 60], [3, 2, 80], [4, 2, 70], [5, 2, 50],
        [0, 3, 25], [1, 3, 35], [2, 3, 65], [3, 3, 85], [4, 3, 75], [5, 3, 55],
        [0, 4, 30], [1, 4, 40], [2, 4, 70], [3, 4, 90], [4, 4, 80], [5, 4, 60],
        [0, 5, 35], [1, 5, 45], [2, 5, 75], [3, 5, 95], [4, 5, 85], [5, 5, 65],
        [0, 6, 40], [1, 6, 50], [2, 6, 80], [3, 6, 100], [4, 6, 90], [5, 6, 70]
      ],
      label: { show: true, color: '#fff' },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 212, 255, 0.5)'
        }
      }
    }]
  }

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
              <h1 className="text-2xl font-display text-primary glow-text">数据分析中心</h1>
            </div>
            
            {/* 时间范围选择 */}
            <div className="flex items-center gap-2">
              {['day', 'week', 'month', 'year'].map(range => (
                <button
                  key={range}
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
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* 关键指标卡片 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: '平均发电效率', value: '92.5%', change: '+2.3%', color: 'text-success' },
            { label: '峰值功率', value: '486.5 MW', change: '+5.8%', color: 'text-success' },
            { label: '容量系数', value: '0.68', change: '-1.2%', color: 'text-danger' },
            { label: 'ROI回报率', value: '15.8%', change: '+0.5%', color: 'text-success' }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="stat-card"
            >
              <p className="text-neutral-400 text-sm mb-2">{metric.label}</p>
              <p className="text-3xl font-display text-primary mb-1">{metric.value}</p>
              <p className={`text-sm ${metric.color}`}>{metric.change} vs 上期</p>
            </motion.div>
          ))}
        </div>

        {/* 图表网格 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 发电量趋势 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-4">发电量趋势分析</h3>
            <div className="h-80">
              <ReactECharts option={powerTrendOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          {/* 效率分析 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-4">系统效率变化</h3>
            <div className="h-80">
              <ReactECharts option={efficiencyOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          {/* 能源分布 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-4">能源构成分析</h3>
            <div className="h-80">
              <ReactECharts option={distributionOption} style={{ height: '100%' }} />
            </div>
          </motion.div>

          {/* 负荷热力图 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="stat-card"
          >
            <h3 className="text-lg font-display text-primary mb-4">负荷分布热力图</h3>
            <div className="h-80">
              <ReactECharts option={heatmapOption} style={{ height: '100%' }} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}