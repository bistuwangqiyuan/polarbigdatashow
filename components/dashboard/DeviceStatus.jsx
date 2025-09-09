'use client'

import { motion } from 'framer-motion'

export default function DeviceStatus({ devices = [] }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'online':
        return 'status-online'
      case 'offline':
        return 'status-offline'
      case 'warning':
        return 'status-warning'
      default:
        return 'text-neutral-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return '正常运行'
      case 'offline':
        return '离线'
      case 'warning':
        return '告警'
      default:
        return '未知'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="stat-card h-full"
    >
      <h3 className="stat-label mb-4">逆变器状态</h3>
      
      <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-auto">
        {devices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-300">{device.name}</span>
              <div className={`w-2 h-2 rounded-full ${getStatusClass(device.status)}`}></div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">状态</span>
                <span className={getStatusClass(device.status)}>{getStatusText(device.status)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">功率</span>
                <span className="text-primary">{device.power} kW</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">效率</span>
                <span className="text-neutral-300">{device.efficiency}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-500">温度</span>
                <span className={device.temperature > 60 ? 'text-warning' : 'text-neutral-300'}>
                  {device.temperature}°C
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}