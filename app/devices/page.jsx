'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// 设备状态组件
const DeviceCard = ({ device, index }) => {
  const statusColors = {
    online: 'text-success border-success/30 bg-success/10',
    offline: 'text-danger border-danger/30 bg-danger/10',
    warning: 'text-warning border-warning/30 bg-warning/10'
  }

  const statusText = {
    online: '正常运行',
    offline: '离线',
    warning: '告警'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="stat-card hover:border-primary/40 transition-all duration-300 group"
    >
      {/* 设备头部 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-display text-primary">{device.name}</h3>
          <p className="text-sm text-neutral-400 mt-1">{device.type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[device.status]}`}>
          {statusText[device.status]}
        </span>
      </div>

      {/* 设备参数 */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500">输出功率</p>
            <p className="text-lg font-display text-primary">{device.power} kW</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">效率</p>
            <p className="text-lg font-display text-primary">{device.efficiency}%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral-500">温度</p>
            <p className="text-lg font-display text-primary">{device.temperature}°C</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">运行时长</p>
            <p className="text-lg font-display text-primary">{device.runtime}h</p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-400 mb-1">
            <span>负载率</span>
            <span>{device.load}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: '0%' }}
              animate={{ width: `${device.load}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* 查看详情 */}
      <div className="mt-4 pt-4 border-t border-neutral-800">
        <button className="text-sm text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 transform duration-300">
          查看详细信息 →
        </button>
      </div>
    </motion.div>
  )
}

export default function DevicesPage() {
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 模拟设备数据
  const devices = [
    { id: 1, name: '光伏阵列-01', type: '光伏组件', status: 'online', power: 125.5, efficiency: 96.5, temperature: 35, runtime: 4320, load: 85 },
    { id: 2, name: '光伏阵列-02', type: '光伏组件', status: 'online', power: 118.2, efficiency: 95.8, temperature: 34, runtime: 4320, load: 82 },
    { id: 3, name: '风机-01', type: '风力发电机', status: 'online', power: 45.3, efficiency: 94.2, temperature: 28, runtime: 3960, load: 75 },
    { id: 4, name: '风机-02', type: '风力发电机', status: 'warning', power: 38.7, efficiency: 92.1, temperature: 31, runtime: 3960, load: 68 },
    { id: 5, name: '储能电池组-01', type: '储能设备', status: 'online', power: 80.0, efficiency: 98.5, temperature: 25, runtime: 8760, load: 88 },
    { id: 6, name: '储能电池组-02', type: '储能设备', status: 'online', power: 75.5, efficiency: 98.2, temperature: 24, runtime: 8760, load: 85 },
    { id: 7, name: '逆变器-01', type: '电力转换', status: 'online', power: 95.0, efficiency: 97.8, temperature: 42, runtime: 8640, load: 90 },
    { id: 8, name: '逆变器-02', type: '电力转换', status: 'offline', power: 0, efficiency: 0, temperature: 25, runtime: 8635, load: 0 },
    { id: 9, name: '充电桩-01', type: '充电设备', status: 'online', power: 60.0, efficiency: 95.0, temperature: 30, runtime: 7200, load: 100 },
    { id: 10, name: '充电桩-02', type: '充电设备', status: 'online', power: 30.0, efficiency: 95.0, temperature: 28, runtime: 7200, load: 50 },
  ]

  // 设备类型
  const deviceTypes = [
    { value: 'all', label: '全部设备', count: devices.length },
    { value: '光伏组件', label: '光伏组件', count: devices.filter(d => d.type === '光伏组件').length },
    { value: '风力发电机', label: '风力发电机', count: devices.filter(d => d.type === '风力发电机').length },
    { value: '储能设备', label: '储能设备', count: devices.filter(d => d.type === '储能设备').length },
    { value: '电力转换', label: '电力转换', count: devices.filter(d => d.type === '电力转换').length },
    { value: '充电设备', label: '充电设备', count: devices.filter(d => d.type === '充电设备').length },
  ]

  // 过滤设备
  const filteredDevices = devices.filter(device => {
    const matchesType = filterType === 'all' || device.type === filterType
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

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
              <h1 className="text-2xl font-display text-primary glow-text">设备管理中心</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">
                在线设备: {devices.filter(d => d.status === 'online').length} / {devices.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* 搜索和筛选 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索设备..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary/50"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* 类型筛选 */}
            <div className="flex items-center gap-2">
              {deviceTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filterType === type.value
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-primary/30'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
              导出报告
            </button>
            <button className="px-4 py-2 bg-success/20 text-success border border-success/30 rounded-lg hover:bg-success/30 transition-colors">
              添加设备
            </button>
          </div>
        </div>

        {/* 设备网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDevices.map((device, index) => (
            <DeviceCard key={device.id} device={device} index={index} />
          ))}
        </div>

        {/* 空状态 */}
        {filteredDevices.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg">没有找到匹配的设备</p>
          </div>
        )}
      </main>
    </div>
  )
}