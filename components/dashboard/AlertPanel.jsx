'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

export default function AlertPanel({ alerts = [] }) {
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-danger border-danger/50 bg-danger/10'
      case 'warning':
        return 'text-warning border-warning/50 bg-warning/10'
      case 'info':
        return 'text-primary border-primary/50 bg-primary/10'
      default:
        return 'text-neutral-400 border-neutral-600 bg-neutral-800/50'
    }
  }

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical':
        return '严重'
      case 'warning':
        return '警告'
      case 'info':
        return '信息'
      default:
        return '通知'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="stat-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="stat-label">系统告警</h3>
        <span className="text-xs text-neutral-500">
          共 {alerts.length} 条
        </span>
      </div>
      
      <div className="flex-1 overflow-auto space-y-2">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${getSeverityClass(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  alert.severity === 'critical' ? 'bg-danger/20' : 
                  alert.severity === 'warning' ? 'bg-warning/20' : 
                  'bg-primary/20'
                }`}>
                  {getSeverityText(alert.severity)}
                </span>
                <span className="text-xs text-neutral-500">
                  {format(new Date(alert.created_at), 'HH:mm:ss')}
                </span>
              </div>
              
              <p className="text-sm leading-relaxed">
                {alert.message}
              </p>
              
              {alert.station_name && (
                <div className="mt-2 text-xs text-neutral-500">
                  位置: {alert.station_name}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
            暂无告警信息
          </div>
        )}
      </div>
    </motion.div>
  )
}