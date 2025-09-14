'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import SafeECharts from '../../components/charts/SafeECharts'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('power')

  // 根据时间范围生成数据
  const getDataByRange = (range) => {
    const dataConfigs = {
      day: {
        xAxis: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        solar: Array.from({ length: 24 }, (_, i) => {
          if (i < 6 || i > 18) return 0
          return Math.max(0, 100 + 50 * Math.sin((i - 6) * Math.PI / 12) + (Math.random() - 0.5) * 20)
        }),
        wind: Array.from({ length: 24 }, () => 180 + Math.random() * 40)
      },
      week: {
        xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        solar: [120, 132, 101, 134, 90, 230, 210],
        wind: [220, 182, 191, 234, 290, 330, 310]
      },
      month: {
        xAxis: ['1周', '2周', '3周', '4周'],
        solar: [850, 920, 780, 1100],
        wind: [1680, 1540, 1720, 1890]
      },
      year: {
        xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        solar: [3200, 3800, 4200, 4800, 5200, 5800, 6000, 5900, 5200, 4400, 3600, 3100],
        wind: [8200, 7800, 7200, 6800, 6200, 5800, 5400, 5600, 6400, 7200, 7800, 8400]
      }
    }
    
    const config = dataConfigs[range]
    config.total = config.solar.map((solar, i) => solar + config.wind[i])
    return config
  }

  const currentData = getDataByRange(dateRange)

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
      data: currentData.xAxis,
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
        data: currentData.solar,
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
        data: currentData.wind,
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
        data: currentData.total,
        itemStyle: { color: '#ffaa00' },
        lineStyle: { width: 3 }
      }
    ]
  }

  // 获取效率数据
  const getEfficiencyData = (range) => {
    const configs = {
      day: {
        xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        data: [85, 82, 88, 95, 93, 89, 86]
      },
      week: {
        xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        data: [88, 91, 87, 92, 94, 89, 90]
      },
      month: {
        xAxis: ['第1周', '第2周', '第3周', '第4周'],
        data: [89, 91, 93, 90]
      },
      year: {
        xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        data: [85, 87, 89, 91, 93, 94, 95, 94, 92, 90, 88, 86]
      }
    }
    return configs[range]
  }

  const efficiencyData = getEfficiencyData(dateRange)

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
      data: efficiencyData.xAxis,
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
      data: efficiencyData.data,
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

  // 获取能源分布数据
  const getDistributionData = (range) => {
    const configs = {
      day: [
        { value: 245, name: '光伏发电', itemStyle: { color: '#00d4ff' } },
        { value: 180, name: '风力发电', itemStyle: { color: '#00ff88' } },
        { value: 120, name: '储能放电', itemStyle: { color: '#ffaa00' } },
        { value: 95, name: '电网供电', itemStyle: { color: '#ff3366' } }
      ],
      week: [
        { value: 1680, name: '光伏发电', itemStyle: { color: '#00d4ff' } },
        { value: 1260, name: '风力发电', itemStyle: { color: '#00ff88' } },
        { value: 840, name: '储能放电', itemStyle: { color: '#ffaa00' } },
        { value: 665, name: '电网供电', itemStyle: { color: '#ff3366' } }
      ],
      month: [
        { value: 6720, name: '光伏发电', itemStyle: { color: '#00d4ff' } },
        { value: 5040, name: '风力发电', itemStyle: { color: '#00ff88' } },
        { value: 3360, name: '储能放电', itemStyle: { color: '#ffaa00' } },
        { value: 2660, name: '电网供电', itemStyle: { color: '#ff3366' } }
      ],
      year: [
        { value: 80640, name: '光伏发电', itemStyle: { color: '#00d4ff' } },
        { value: 60480, name: '风力发电', itemStyle: { color: '#00ff88' } },
        { value: 40320, name: '储能放电', itemStyle: { color: '#ffaa00' } },
        { value: 31920, name: '电网供电', itemStyle: { color: '#ff3366' } }
      ]
    }
    return configs[range]
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
      data: getDistributionData(dateRange),
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

  // 获取热力图数据
  const getHeatmapData = (range) => {
    const configs = {
      day: {
        xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        yAxis: ['设备组1', '设备组2', '设备组3', '设备组4'],
        data: [
          [0, 0, 10], [1, 0, 20], [2, 0, 30], [3, 0, 85], [4, 0, 50], [5, 0, 40],
          [0, 1, 15], [1, 1, 25], [2, 1, 45], [3, 1, 95], [4, 1, 65], [5, 1, 45],
          [0, 2, 20], [1, 2, 30], [2, 2, 60], [3, 2, 100], [4, 2, 70], [5, 2, 50],
          [0, 3, 25], [1, 3, 35], [2, 3, 65], [3, 3, 90], [4, 3, 75], [5, 3, 55]
        ]
      },
      week: {
        xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        yAxis: ['光伏区1', '光伏区2', '风电区1', '风电区2', '储能区'],
        data: [
          [0, 0, 70], [1, 0, 80], [2, 0, 75], [3, 0, 85], [4, 0, 90], [5, 0, 60], [6, 0, 65],
          [0, 1, 65], [1, 1, 75], [2, 1, 70], [3, 1, 80], [4, 1, 85], [5, 1, 55], [6, 1, 60],
          [0, 2, 85], [1, 2, 80], [2, 2, 90], [3, 2, 85], [4, 2, 88], [5, 2, 82], [6, 2, 84],
          [0, 3, 80], [1, 3, 75], [2, 3, 85], [3, 3, 80], [4, 3, 83], [5, 3, 78], [6, 3, 80],
          [0, 4, 50], [1, 4, 55], [2, 4, 60], [3, 4, 65], [4, 4, 70], [5, 4, 48], [6, 4, 52]
        ]
      },
      month: {
        xAxis: ['第1周', '第2周', '第3周', '第4周'],
        yAxis: ['光伏总计', '风电总计', '储能总计', '充电桩'],
        data: [
          [0, 0, 75], [1, 0, 82], [2, 0, 88], [3, 0, 85],
          [0, 1, 82], [1, 1, 85], [2, 1, 87], [3, 1, 84],
          [0, 2, 60], [1, 2, 65], [2, 2, 70], [3, 2, 68],
          [0, 3, 45], [1, 3, 50], [2, 3, 55], [3, 3, 52]
        ]
      },
      year: {
        xAxis: ['Q1', 'Q2', 'Q3', 'Q4'],
        yAxis: ['光伏系统', '风电系统', '储能系统', '整体效率'],
        data: [
          [0, 0, 78], [1, 0, 85], [2, 0, 92], [3, 0, 80],
          [0, 1, 82], [1, 1, 80], [2, 1, 78], [3, 1, 85],
          [0, 2, 65], [1, 2, 70], [2, 2, 75], [3, 2, 68],
          [0, 3, 75], [1, 3, 78], [2, 3, 82], [3, 3, 78]
        ]
      }
    }
    return configs[range]
  }

  const heatmapConfig = getHeatmapData(dateRange)

  // 获取指标数据
  const getMetricsByRange = (range) => {
    const configs = {
      day: [
        { label: '平均发电效率', value: '91.2%', change: '+1.8%', color: 'text-success' },
        { label: '峰值功率', value: '245.8 MW', change: '+3.2%', color: 'text-success' },
        { label: '容量系数', value: '0.72', change: '+0.8%', color: 'text-success' },
        { label: 'ROI回报率', value: '19.8%', change: '+0.2%', color: 'text-success' }
      ],
      week: [
        { label: '平均发电效率', value: '92.5%', change: '+2.3%', color: 'text-success' },
        { label: '峰值功率', value: '486.5 MW', change: '+5.8%', color: 'text-success' },
        { label: '容量系数', value: '0.68', change: '-1.2%', color: 'text-danger' },
        { label: 'ROI回报率', value: '19.8%', change: '+0.5%', color: 'text-success' }
      ],
      month: [
        { label: '平均发电效率', value: '90.8%', change: '+0.9%', color: 'text-success' },
        { label: '峰值功率', value: '892.3 MW', change: '+8.5%', color: 'text-success' },
        { label: '容量系数', value: '0.65', change: '-2.1%', color: 'text-danger' },
        { label: 'ROI回报率', value: '19.8%', change: '+1.2%', color: 'text-success' }
      ],
      year: [
        { label: '平均发电效率', value: '89.5%', change: '+4.2%', color: 'text-success' },
        { label: '峰值功率', value: '1285.6 MW', change: '+12.3%', color: 'text-success' },
        { label: '容量系数', value: '0.70', change: '+3.5%', color: 'text-success' },
        { label: 'ROI回报率', value: '19.8%', change: '+2.8%', color: 'text-success' }
      ]
    }
    return configs[range]
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
      data: heatmapConfig.xAxis,
      splitArea: { show: true },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'category',
      data: heatmapConfig.yAxis,
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
      data: heatmapConfig.data,
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
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={50}
                height={50}
                className="object-contain"
              />
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
          {getMetricsByRange(dateRange).map((metric, index) => (
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
              <SafeECharts option={powerTrendOption} style={{ height: '100%' }} />
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
              <SafeECharts option={efficiencyOption} style={{ height: '100%' }} />
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
              <SafeECharts option={distributionOption} style={{ height: '100%' }} />
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
              <SafeECharts option={heatmapOption} style={{ height: '100%' }} />
            </div>
          </motion.div>
        </div>

        {/* 企业展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 mb-8"
        >
          <h3 className="text-xl font-display text-primary mb-8 text-center">企业实力</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-xl"
            >
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
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-xl"
            >
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