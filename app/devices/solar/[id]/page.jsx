'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// 动态导入ECharts组件
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export default function SolarArrayDetailPage({ params }) {
  const [device, setDevice] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  useEffect(() => {
    // 模拟数据 - 实际应从API获取
    const mockDevices = {
      1: { 
        id: 1, 
        name: '光伏阵列-01', 
        type: '光伏组件', 
        status: 'online', 
        power: 125.5, 
        efficiency: 96.5, 
        temperature: 35, 
        runtime: 4320, 
        load: 85,
        model: 'JA Solar JAM72S09-400/PR',
        manufacturer: '晶澳太阳能',
        installDate: '2023-03-15',
        capacity: '400W x 320块',
        totalCapacity: 128,
        location: 'A区-1号方阵',
        orientation: '正南',
        tilt: '30°',
        image: '/image/solar1.png'
      },
      2: { 
        id: 2, 
        name: '光伏阵列-02', 
        type: '光伏组件', 
        status: 'online', 
        power: 118.2, 
        efficiency: 95.8, 
        temperature: 34, 
        runtime: 4320, 
        load: 82,
        model: 'JA Solar JAM72S09-400/PR',
        manufacturer: '晶澳太阳能',
        installDate: '2023-03-20',
        capacity: '400W x 300块',
        totalCapacity: 120,
        location: 'A区-2号方阵',
        orientation: '正南',
        tilt: '30°',
        image: '/image/solar2.png'
      },
      3: { 
        id: 3, 
        name: '光伏阵列-03', 
        type: '光伏组件', 
        status: 'online', 
        power: 132.1, 
        efficiency: 97.2, 
        temperature: 36, 
        runtime: 4320, 
        load: 88,
        model: 'Longi Solar LR4-72HPH-450M',
        manufacturer: '隆基绿能科技',
        installDate: '2023-04-10',
        capacity: '450W x 300块',
        totalCapacity: 135,
        location: 'B区-1号方阵',
        orientation: '正南',
        tilt: '25°',
        image: '/image/solar4.png'
      },
      4: { 
        id: 4, 
        name: '光伏阵列-04', 
        type: '光伏组件', 
        status: 'offline', 
        power: 0, 
        efficiency: 0, 
        temperature: 25, 
        runtime: 4320, 
        load: 0,
        model: 'Trina Solar TSM-DE18M(II)-450W',
        manufacturer: '天合光能',
        installDate: '2023-04-15',
        capacity: '450W x 280块',
        totalCapacity: 126,
        location: 'B区-2号方阵',
        orientation: '正南',
        tilt: '25°',
        image: '/image/solar5.png'
      },
      5: { 
        id: 5, 
        name: '光伏阵列-05', 
        type: '光伏组件', 
        status: 'offline', 
        power: 0, 
        efficiency: 0, 
        temperature: 25, 
        runtime: 4320, 
        load: 0,
        model: 'Canadian Solar CS3W-450MS',
        manufacturer: '加拿大太阳能',
        installDate: '2023-05-01',
        capacity: '450W x 290块',
        totalCapacity: 130.5,
        location: 'C区-1号方阵',
        orientation: '正南',
        tilt: '30°',
        image: '/image/solar1.png'
      }
    }
    
    setDevice(mockDevices[params.id])
  }, [params.id])

  if (!device) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">加载中...</div>
      </div>
    )
  }

  // 发电趋势图表配置
  const powerTrendOption = {
    backgroundColor: 'transparent',
    title: {
      text: '24小时发电趋势',
      textStyle: { color: '#00d4ff', fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '功率 (kW)',
      nameTextStyle: { color: '#999' },
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' },
      splitLine: { lineStyle: { color: '#333', type: 'dashed' } }
    },
    series: [{
      data: Array.from({ length: 24 }, (_, i) => {
        if (i < 6 || i > 18) return 0
        const peak = i === 12 ? device.power : device.power * (0.3 + 0.7 * Math.sin((i - 6) * Math.PI / 12))
        return Math.max(0, peak + (Math.random() - 0.5) * 10)
      }),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#00d4ff', width: 2 },
      itemStyle: { color: '#00d4ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
          ]
        }
      }
    }],
    grid: { left: '10%', right: '5%', top: '15%', bottom: '15%' }
  }

  return (
    <div className="min-h-screen dashboard-bg">
      {/* 顶部导航 */}
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/devices" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回设备列表
              </Link>
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-2xl font-display text-primary glow-text">{device.name} - 详细信息</h1>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              device.status === 'online' 
                ? 'bg-success/20 text-success border border-success/30'
                : 'bg-danger/20 text-danger border border-danger/30'
            }`}>
              {device.status === 'online' ? '正常运行' : '已关断'}
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* 设备概览卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 设备图片 */}
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

          {/* 实时数据 */}
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
                  <div className="text-sm text-neutral-400">输出功率 (kW)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-success mb-2">{device.efficiency}</div>
                  <div className="text-sm text-neutral-400">转换效率 (%)</div>
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

              {/* 详细参数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-neutral-800">
                <div className="space-y-3">
                  <h4 className="text-md font-display text-primary">技术参数</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">额定容量</span>
                      <span className="text-primary">{device.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">总容量</span>
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
                      <span className="text-primary">{device.runtime}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 图表区域 */}
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
              <div className="text-center">
                <div className="text-6xl font-display text-primary mb-4">
                  {(device.totalCapacity * 24 * 30 * 0.25).toFixed(1)}
                </div>
                <div className="text-lg text-neutral-400 mb-2">本月累计发电量 (kWh)</div>
                <div className="text-sm text-neutral-500">
                  较上月增长 <span className="text-success">+12.5%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 运维记录 */}
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
                  <div className="text-primary font-medium">设备巡检</div>
                  <div className="text-sm text-neutral-400 mt-1">组件清洁、接线检查、性能测试</div>
                </div>
                <div className="text-right">
                  <div className="text-success text-sm">已完成</div>
                  <div className="text-xs text-neutral-500">2024-09-10</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
                <div>
                  <div className="text-primary font-medium">预防性维护</div>
                  <div className="text-sm text-neutral-400 mt-1">逆变器参数调整、线缆紧固</div>
                </div>
                <div className="text-right">
                  <div className="text-warning text-sm">计划中</div>
                  <div className="text-xs text-neutral-500">2024-09-20</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg">
                <div>
                  <div className="text-primary font-medium">效率优化</div>
                  <div className="text-sm text-neutral-400 mt-1">MPPT参数优化、阴影分析</div>
                </div>
                <div className="text-right">
                  <div className="text-primary text-sm">进行中</div>
                  <div className="text-xs text-neutral-500">2024-09-12</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
