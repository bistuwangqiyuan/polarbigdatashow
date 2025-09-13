'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function EnhancedStatCard({ 
  title, 
  value, 
  unit, 
  subtitle,
  icon, 
  trend, 
  color = 'primary',
  delay = 0,
  comparison
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startValue = displayValue
    const endValue = parseFloat(value) || 0
    const duration = 1000
    const startTime = Date.now()

    const updateValue = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      const currentValue = startValue + (endValue - startValue) * progress
      
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }

    requestAnimationFrame(updateValue)
  }, [value])

  const colorStyles = {
    primary: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    warning: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
    danger: 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className={`
        relative h-full p-6 rounded-2xl
        bg-gradient-to-br ${colorStyles[color]} backdrop-blur-sm
        border border-opacity-30
        shadow-2xl shadow-black/50
        transition-all duration-300
        hover:shadow-cyan-500/20 hover:border-cyan-500/50
        overflow-hidden
      `}>
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* 光晕效果 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-radial from-cyan-500/20 to-transparent rounded-full blur-2xl"></div>
        
        {/* 标题区域 */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-xl
              bg-gradient-to-br ${colorStyles[color]}
              flex items-center justify-center
              backdrop-blur-sm border border-opacity-30
              shadow-lg shadow-black/30
            `}>
              {icon}
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
              {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* 数值显示 */}
        <div className="relative z-10 mb-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${colorStyles[color].split(' ')[3]}`}>
              {displayValue.toLocaleString('zh-CN', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 2 
              })}
            </span>
            <span className="text-lg text-gray-400">{unit}</span>
          </div>
        </div>

        {/* 对比数据 */}
        {comparison && (
          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
            <span>昨日: {comparison.yesterday}{unit}</span>
            <span>今日: {comparison.today}{unit}</span>
          </div>
        )}

        {/* 趋势指示 */}
        {trend && (
          <div className="relative z-10 flex items-center gap-2">
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg
              ${trend.value > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
            `}>
              <svg 
                className={`w-4 h-4 ${trend.value > 0 ? 'rotate-0' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="font-medium">{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-gray-500 text-xs">{trend.label}</span>
          </div>
        )}

        {/* 悬浮效果线条 */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: delay + 0.5 }}
        ></motion.div>
      </div>
    </motion.div>
  )
}