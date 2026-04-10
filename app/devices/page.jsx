'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

// 设备类型背景图映射
const deviceImages = {
  '光伏组件': ['/image/solar1.png', '/image/solar2.png', '/image/solar3.png', '/image/solar4.png'],
}

const deviceGradients = {
  '风力发电机': 'from-sky-800/60 via-blue-900/70 to-slate-950/90',
  '储能': 'from-emerald-800/60 via-green-900/70 to-slate-950/90',
  '电力转换': 'from-violet-800/60 via-purple-900/70 to-slate-950/90',
  '用能设备': 'from-amber-800/60 via-orange-900/70 to-slate-950/90',
}

const DeviceTypeIcon = ({ type }) => {
  const icons = {
    '风力发电机': (
      <svg className="w-16 h-16 text-white/15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.7 2.3c-.4-.4-1-.4-1.4 0l-4 4c-.4.4-.4 1 0 1.4s1 .4 1.4 0L11 5.4V11H5.4l2.3-2.3c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-4 4c-.4.4-.4 1 0 1.4l4 4c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4L5.4 13H11v5.6l-2.3-2.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l4 4c.2.2.5.3.7.3s.5-.1.7-.3l4-4c.4-.4.4-1 0-1.4s-1-.4-1.4 0L13 18.6V13h5.6l-2.3 2.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l4-4c.4-.4.4-1 0-1.4l-4-4c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4L18.6 11H13V5.4l2.3 2.3c.2.2.5.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-4-4z"/>
      </svg>
    ),
    '储能': (
      <svg className="w-16 h-16 text-white/15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>
      </svg>
    ),
    '电力转换': (
      <svg className="w-16 h-16 text-white/15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    '用能设备': (
      <svg className="w-16 h-16 text-white/15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
      </svg>
    ),
  }
  return icons[type] || null
}

// 设备状态组件
const DeviceCard = ({ device, index, onToggle }) => {
  const statusColors = {
    online: 'text-success border-success/30 bg-success/10',
    offline: 'text-danger border-danger/30 bg-danger/10',
    warning: 'text-warning border-warning/30 bg-warning/10'
  }

  const statusText = {
    online: '正常运行',
    offline: device.switchable ? '已关断' : '离线',
    warning: '告警'
  }

  const solarImages = deviceImages['光伏组件']
  const hasBgImage = device.type === '光伏组件' && solarImages
  const bgImage = hasBgImage ? solarImages[(device.id - 1) % solarImages.length] : null
  const gradient = deviceGradients[device.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-xl border border-white/10 hover:border-primary/40 transition-all duration-300 group"
    >
      {/* 背景层 */}
      {hasBgImage ? (
        <>
          <Image
            src={bgImage}
            alt={device.type}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient || 'from-slate-800/60 to-slate-950/90'}`}>
          <div className="absolute right-2 top-2 opacity-60">
            <DeviceTypeIcon type={device.type} />
          </div>
        </div>
      )}

      {/* 内容层 */}
      <div className="relative z-10 p-5">
        {/* 设备头部 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-display text-white drop-shadow-md">{device.name}</h3>
            <p className="text-sm text-neutral-300 mt-1">{device.type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${statusColors[device.status]}`}>
            {statusText[device.status]}
          </span>
        </div>

        {/* 设备参数 */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-400">输出功率</p>
              <p className="text-lg font-display text-white drop-shadow-sm">{Math.round(device.power)} kW</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">效率</p>
              <p className="text-lg font-display text-white drop-shadow-sm">{device.efficiency}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-400">温度</p>
              <p className="text-lg font-display text-white drop-shadow-sm">{device.temperature}°C</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">运行时长</p>
              <p className="text-lg font-display text-white drop-shadow-sm">{device.runtime}h</p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>负载率</span>
              <span>{device.load}%</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: '0%' }}
                animate={{ width: `${device.load}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
          {device.type === '光伏组件' ? (
            <Link href={`/devices/solar/${device.id}`} className="flex-1 text-center py-2 text-sm text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded backdrop-blur-sm transition-colors">
              查看详情
            </Link>
          ) : (
            <button className="flex-1 py-2 text-sm text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded backdrop-blur-sm transition-colors">
              查看详情
            </button>
          )}
          
          {device.switchable && (
            <button 
              onClick={() => onToggle && onToggle(device.id)}
              className={`flex-1 py-2 text-sm border rounded backdrop-blur-sm transition-colors ${
                device.status === 'online' 
                  ? 'text-danger hover:text-danger/80 bg-danger/10 hover:bg-danger/20 border-danger/30' 
                  : 'text-success hover:text-success/80 bg-success/10 hover:bg-success/20 border-success/30'
              }`}
            >
              {device.status === 'online' ? '关断' : '开启'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function DevicesPage() {
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 模拟设备数据
  const [devices, setDevices] = useState([
    { id: 1, name: '光伏阵列-01', type: '光伏组件', status: 'online', power: 125.5, efficiency: 96.5, temperature: 35, runtime: 4320, load: 85, switchable: true },
    { id: 2, name: '光伏阵列-02', type: '光伏组件', status: 'online', power: 118.2, efficiency: 95.8, temperature: 34, runtime: 4320, load: 82, switchable: true },
    { id: 3, name: '光伏阵列-03', type: '光伏组件', status: 'online', power: 132.1, efficiency: 97.2, temperature: 36, runtime: 4320, load: 88, switchable: true },
    { id: 4, name: '光伏阵列-04', type: '光伏组件', status: 'offline', power: 0, efficiency: 0, temperature: 25, runtime: 4320, load: 0, switchable: true },
    { id: 5, name: '风机-01', type: '风力发电机', status: 'offline', power: 0, efficiency: 0, temperature: 25, runtime: 3960, load: 0 },
    { id: 6, name: '风机-02', type: '风力发电机', status: 'offline', power: 0, efficiency: 0, temperature: 25, runtime: 3960, load: 0 },
    { id: 7, name: '储能电池组-01', type: '储能', status: 'online', power: 80.0, efficiency: 98.5, temperature: 25, runtime: 8760, load: 88 },
    { id: 8, name: '储能电池组-02', type: '储能', status: 'online', power: 75.5, efficiency: 98.2, temperature: 24, runtime: 8760, load: 85 },
    { id: 9, name: '储能电池组-03', type: '储能', status: 'online', power: 72.0, efficiency: 97.9, temperature: 24, runtime: 8760, load: 82 },
    { id: 10, name: '储能电池组-04', type: '储能', status: 'online', power: 68.5, efficiency: 97.6, temperature: 25, runtime: 8760, load: 80 },
    { id: 11, name: '逆变器-01', type: '电力转换', status: 'online', power: 95.0, efficiency: 97.8, temperature: 42, runtime: 8640, load: 90 },
    { id: 12, name: '逆变器-02', type: '电力转换', status: 'offline', power: 0, efficiency: 0, temperature: 25, runtime: 8635, load: 0 },
    { id: 13, name: '用能设备-01', type: '用能设备', status: 'online', power: 60.0, efficiency: 95.0, temperature: 30, runtime: 7200, load: 100 },
    { id: 14, name: '用能设备-02', type: '用能设备', status: 'online', power: 30.0, efficiency: 95.0, temperature: 28, runtime: 7200, load: 50 },
  ])

  // 切换设备状态
  const toggleDeviceStatus = (deviceId) => {
    setDevices(prevDevices =>
      prevDevices.map(device => {
        if (device.id === deviceId && device.switchable) {
          const newStatus = device.status === 'online' ? 'offline' : 'online'
          const newPower = newStatus === 'online' ? (device.type === '光伏组件' ? Math.round(120 + Math.random() * 20) : device.power) : 0
          const newEfficiency = newStatus === 'online' ? (device.type === '光伏组件' ? Math.round(95 + Math.random() * 3) : device.efficiency) : 0
          const newLoad = newStatus === 'online' ? (device.type === '光伏组件' ? Math.round(80 + Math.random() * 15) : device.load) : 0
          
          return {
            ...device,
            status: newStatus,
            power: newPower,
            efficiency: newEfficiency,
            load: newLoad
          }
        }
        return device
      })
    )
  }

  // 设备类型
  const deviceTypes = [
    { value: 'all', label: '全部设备', count: devices.length },
    { value: '光伏组件', label: '光伏组件', count: devices.filter(d => d.type === '光伏组件').length },
    { value: '风力发电机', label: '风力发电机', count: devices.filter(d => d.type === '风力发电机').length },
    { value: '储能', label: '储能', count: devices.filter(d => d.type === '储能').length },
    { value: '电力转换', label: '电力转换', count: devices.filter(d => d.type === '电力转换').length },
    { value: '用能设备', label: '用能设备', count: devices.filter(d => d.type === '用能设备').length },
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
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={50}
                height={50}
                className="object-contain"
              />
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
            <DeviceCard key={device.id} device={device} index={index} onToggle={toggleDeviceStatus} />
          ))}
        </div>

        {/* 空状态 */}
        {filteredDevices.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg">没有找到匹配的设备</p>
          </div>
        )}

        {/* 企业设施展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 mb-8"
        >
          <h3 className="text-xl font-display text-primary mb-8 text-center">设施概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-xl"
            >
              <Image
                src="/image/oilstoragetank.jpg"
                alt="储油设施"
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">储油设施</h4>
                <p className="text-sm text-neutral-300">大型储油罐群</p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-xl"
            >
              <Image
                src="/image/oilstoragetank2.png"
                alt="储运基地"
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">储运基地</h4>
                <p className="text-sm text-neutral-300">现代化储运中心</p>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-xl"
            >
              <Image
                src="/image/pipe.jpg"
                alt="输送管道"
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">输送管道</h4>
                <p className="text-sm text-neutral-300">长输管道网络</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}