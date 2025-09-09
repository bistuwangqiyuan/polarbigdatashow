'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function StatCard({ 
  title, 
  value, 
  unit = '', 
  icon, 
  trend = null,
  animate = true,
  delay = 0 
}) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    if (animate && typeof value === 'number') {
      const duration = 2000
      const start = Date.now()
      const startValue = displayValue
      
      const timer = setInterval(() => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        
        setDisplayValue(Math.round(startValue + (value - startValue) * easeOutQuart))
        
        if (progress >= 1) {
          clearInterval(timer)
        }
      }, 16)
      
      return () => clearInterval(timer)
    } else {
      setDisplayValue(value)
    }
  }, [value, animate]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="stat-label">{title}</h3>
        {icon && (
          <div className="text-primary/60">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex items-center">
        <div>
          <div className="stat-value">
            {typeof value === 'number' ? displayValue.toLocaleString('zh-CN') : value}
            {unit && <span className="text-2xl ml-1 text-primary/80">{unit}</span>}
          </div>
          
          {trend && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-sm ${trend.value > 0 ? 'text-success' : 'text-danger'}`}>
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-neutral-500">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 data-stream rounded-lg"></div>
    </motion.div>
  )
}