'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// 动态导入ECharts组件
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function HistoryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedDataType, setSelectedDataType] = useState('power')

  // 根据选择的数据类型和时间周期获取数据
  const getTrendData = () => {
    const baseData = {
      power: {
        year: {
          xAxis: ['2020', '2021', '2022', '2023', '2024'],
          solar: [280000, 320000, 380000, 420000, 456000],
          wind: [180000, 210000, 240000, 265000, 285000],
          storage: [80000, 95000, 110000, 125000, 140000],
          unit: 'MWh'
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          solar: [12000, 13200, 10100, 13400, 9000, 23000, 21000, 24000, 22000, 18000, 15000, 14000],
          wind: [8000, 9000, 7000, 8500, 9500, 8800, 9200, 9800, 8600, 7500, 8200, 8800],
          storage: [4000, 4500, 3500, 4200, 5000, 4800, 5200, 5500, 4800, 4000, 4300, 4600],
          unit: 'MWh'
        },
        week: {
          xAxis: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
          solar: [2800, 3100, 2900, 3300, 3500, 3200, 3400, 3600],
          wind: [2100, 2300, 2200, 2400, 2500, 2350, 2450, 2600],
          storage: [1100, 1200, 1150, 1250, 1300, 1280, 1320, 1380],
          unit: 'MWh'
        }
      },
      revenue: {
        year: {
          xAxis: ['2020', '2021', '2022', '2023', '2024'],
          solar: [14000, 16000, 19000, 21000, 22800],
          wind: [9000, 10500, 12000, 13250, 14250],
          storage: [4000, 4750, 5500, 6250, 7000],
          unit: '万元'
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          solar: [600, 660, 505, 670, 450, 1150, 1050, 1200, 1100, 900, 750, 700],
          wind: [400, 450, 350, 425, 475, 440, 460, 490, 430, 375, 410, 440],
          storage: [200, 225, 175, 210, 250, 240, 260, 275, 240, 200, 215, 230],
          unit: '万元'
        },
        week: {
          xAxis: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
          solar: [140, 155, 145, 165, 175, 160, 170, 180],
          wind: [105, 115, 110, 120, 125, 117.5, 122.5, 130],
          storage: [55, 60, 57.5, 62.5, 65, 64, 66, 69],
          unit: '万元'
        }
      },
      co2: {
        year: {
          xAxis: ['2020', '2021', '2022', '2023', '2024'],
          solar: [224000, 256000, 304000, 336000, 364800],
          wind: [144000, 168000, 192000, 212000, 228000],
          storage: [64000, 76000, 88000, 100000, 112000],
          unit: '吨'
        },
        month: {
          xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          solar: [9600, 10560, 8080, 10720, 7200, 18400, 16800, 19200, 17600, 14400, 12000, 11200],
          wind: [6400, 7200, 5600, 6800, 7600, 7040, 7360, 7840, 6880, 6000, 6560, 7040],
          storage: [3200, 3600, 2800, 3360, 4000, 3840, 4160, 4400, 3840, 3200, 3440, 3680],
          unit: '吨'
        },
        week: {
          xAxis: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周'],
          solar: [2240, 2480, 2320, 2640, 2800, 2560, 2720, 2880],
          wind: [1680, 1840, 1760, 1920, 2000, 1880, 1960, 2080],
          storage: [880, 960, 920, 1000, 1040, 1024, 1056, 1104],
          unit: '吨'
        }
      }
    }
    
    const data = baseData[selectedDataType][selectedPeriod]
    const total = data.xAxis.map((_, i) => data.solar[i] + data.wind[i] + data.storage[i])
    
    return {
      xAxis: data.xAxis,
      solar: data.solar,
      wind: data.wind,
      storage: data.storage,
      total: total,
      unit: data.unit
    }
  }

  const trendData = getTrendData()

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
          result += `${item.seriesName}: ${item.value.toLocaleString()} ${trendData.unit}<br/>`
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
      data: trendData.xAxis,
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
        data: trendData.solar,
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
        data: trendData.wind,
        itemStyle: { color: '#00ff88' }
      },
      {
        name: '储能系统',
        type: 'bar',
        stack: 'total',
        data: trendData.storage,
        itemStyle: { color: '#ffaa00' }
      },
      {
        name: '总计',
        type: 'line',
        data: trendData.total,
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
    { date: '2025-09-14', solar: 245.8, wind: 95.2, storage: 48.5, total: 389.5, revenue: 19475, status: 'normal' },
    { date: '2025-09-13', solar: 238.6, wind: 92.3, storage: 46.2, total: 377.1, revenue: 18855, status: 'normal' },
    { date: '2025-09-12', solar: 225.3, wind: 88.6, storage: 44.5, total: 358.4, revenue: 17920, status: 'normal' },
    { date: '2025-09-11', solar: 215.2, wind: 85.6, storage: 42.5, total: 343.3, revenue: 17165, status: 'warning' },
    { date: '2025-09-10', solar: 252.8, wind: 98.2, storage: 50.6, total: 401.6, revenue: 20080, status: 'excellent' },
    { date: '2025-09-09', solar: 248.5, wind: 96.3, storage: 49.2, total: 394.0, revenue: 19700, status: 'normal' },
    { date: '2025-09-08', solar: 236.3, wind: 91.5, storage: 45.3, total: 373.1, revenue: 18655, status: 'normal' },
    { date: '2025-09-07', solar: 242.8, wind: 94.2, storage: 47.6, total: 384.6, revenue: 19230, status: 'normal' },
    { date: '2025-09-06', solar: 228.5, wind: 89.3, storage: 43.2, total: 361.0, revenue: 18050, status: 'normal' },
    { date: '2025-09-05', solar: 256.3, wind: 102.5, storage: 52.3, total: 411.1, revenue: 20555, status: 'excellent' },
    { date: '2025-09-04', solar: 238.9, wind: 93.7, storage: 46.8, total: 379.4, revenue: 18970, status: 'normal' },
    { date: '2025-09-03', solar: 232.6, wind: 90.3, storage: 44.2, total: 367.1, revenue: 18355, status: 'normal' },
    { date: '2025-09-02', solar: 245.2, wind: 95.6, storage: 48.5, total: 389.3, revenue: 19465, status: 'normal' },
    { date: '2025-09-01', solar: 250.5, wind: 97.3, storage: 49.2, total: 397.0, revenue: 19850, status: 'excellent' },
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
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={50}
                height={50}
                className="object-contain"
              />
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