'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function Central3DDisplay({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // 绘制连接线动画
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = canvas.offsetHeight

    let animationFrame
    let offset = 0

    const drawConnections = () => {
      ctx.clearRect(0, 0, width, height)
      
      // 设置发光效果
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00ff88'
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 2

      // 绘制连接线
      const connections = [
        { from: { x: width * 0.2, y: height * 0.5 }, to: { x: width * 0.5, y: height * 0.5 } },
        { from: { x: width * 0.8, y: height * 0.5 }, to: { x: width * 0.5, y: height * 0.5 } },
        { from: { x: width * 0.5, y: height * 0.2 }, to: { x: width * 0.5, y: height * 0.5 } },
        { from: { x: width * 0.5, y: height * 0.8 }, to: { x: width * 0.5, y: height * 0.5 } },
      ]

      connections.forEach(({ from, to }) => {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        
        // 创建虚线效果
        ctx.setLineDash([5, 15])
        ctx.lineDashOffset = -offset
        
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      })

      // 绘制能量流动点
      ctx.fillStyle = '#00ff88'
      connections.forEach(({ from, to }, index) => {
        const progress = ((offset / 20 + index * 0.25) % 1)
        const x = from.x + (to.x - from.x) * progress
        const y = from.y + (to.y - from.y) * progress
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      offset += 1
      animationFrame = requestAnimationFrame(drawConnections)
    }

    drawConnections()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gradient-radial from-primary/10 to-transparent rounded-2xl overflow-hidden">
      {/* 背景网格 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* 3D 设备展示 */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {/* 中央充电桩 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute"
        >
          <div className="w-32 h-40 bg-gradient-to-b from-primary/80 to-primary/40 rounded-lg shadow-2xl shadow-primary/50 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg"></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">充电桩</div>
          </div>
        </motion.div>

        {/* 光伏板 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute left-[20%] top-1/2 -translate-y-1/2"
        >
          <div className="w-24 h-20 transform -skew-y-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded"></div>
            <div className="grid grid-cols-3 gap-1 p-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-blue-900/50 rounded-sm"></div>
              ))}
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">光伏</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 风机 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute right-[20%] top-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div className="w-1 h-20 bg-gradient-to-b from-gray-400 to-gray-600 mx-auto"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 left-1/2 -translate-x-1/2"
            >
              {[0, 120, 240].map((angle) => (
                <div
                  key={angle}
                  className="absolute w-16 h-1 bg-gradient-to-r from-gray-300 to-gray-500 origin-left"
                  style={{ transform: `rotate(${angle}deg)` }}
                ></div>
              ))}
            </motion.div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">风机</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 储能设备 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute left-1/2 -translate-x-1/2 top-[20%]"
        >
          <div className="w-20 h-24 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg"></div>
            <div className="p-2 space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-2 bg-green-500/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                  ></motion.div>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">储能设备</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 箱式变电站 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-[20%]"
        >
          <div className="w-28 h-20 bg-gradient-to-b from-orange-600 to-orange-800 rounded-lg shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg"></div>
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">箱式变电站</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 展厅负荷 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute right-[15%] bottom-[25%]"
        >
          <div className="w-24 h-16 bg-gradient-to-b from-purple-600 to-purple-800 rounded-lg shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg"></div>
            <div className="flex items-center justify-center h-full">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">展厅负荷</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 连接线画布 */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none"></canvas>

        {/* 能量流动数值 */}
        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 text-primary font-bold text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {data?.solarPower || 20} kW
          </motion.div>
        </div>
        <div className="absolute right-[35%] top-1/2 -translate-y-1/2 text-primary font-bold text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {data?.windPower || 25} kW
          </motion.div>
        </div>
      </div>

      {/* 光晕效果 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}