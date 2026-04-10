'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function Central3DDisplay({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = canvas.offsetHeight

    let animationFrame
    let offset = 0

    const drawConnections = () => {
      ctx.clearRect(0, 0, width, height)
      
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00ff88'
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 2

      const centerX = width / 2
      const centerY = height / 2
      const radiusX = width * 0.3
      const radiusY = height * 0.4
      
      const connections = [
        { from: { x: centerX - radiusX, y: centerY }, to: { x: centerX, y: centerY } },
        { from: { x: centerX, y: centerY - radiusY }, to: { x: centerX, y: centerY } },
      ]

      connections.forEach(({ from, to }) => {
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.setLineDash([5, 15])
        ctx.lineDashOffset = -offset
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      })

      ctx.fillStyle = '#00ff88'
      connections.forEach(({ from, to }, index) => {
        const progress = ((offset / 20 + index * 0.5) % 1)
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
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative z-10 h-full flex items-center justify-center">
        {/* 中央充电桩 - 场站用电 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-32 h-40 bg-gradient-to-b from-primary/80 to-primary/40 rounded-lg shadow-2xl shadow-primary/50 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg"></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">场站用电</div>
          </div>
        </motion.div>

        {/* 光伏板 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute left-[20%] top-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-gray-500 to-gray-700"></div>
            
            <div className="w-32 h-24 transform -rotate-12 skew-y-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded shadow-2xl">
                <div className="absolute inset-1 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5"></div>
                  <div className="absolute inset-0.5 grid grid-cols-6 grid-rows-4 gap-[1px] p-1">
                    {[...Array(24)].map((_, i) => (
                      <div 
                        key={i} 
                        className="relative bg-gradient-to-br from-blue-800 to-blue-950 rounded-[1px] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                        <div className="absolute inset-x-0 top-1/2 h-[0.5px] bg-gray-400/30"></div>
                        <div className="absolute inset-y-0 left-1/2 w-[0.5px] bg-gray-400/30"></div>
                        {i % 3 === 0 && (
                          <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
                </div>
              </div>
              <div className="absolute -inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded pointer-events-none"></div>
            </div>
            
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-primary font-bold whitespace-nowrap">光伏</div>
          </div>
          
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-400/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 储能 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">储能</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 连接线画布 */}
        <canvas ref={canvasRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" style={{ width: '600px', height: '300px' }}></canvas>

        {/* 电流虚线十字指示器 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
        >
          <div className="relative w-16 h-16">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/80 transform -translate-y-1/2"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)',
                   filter: 'drop-shadow(0 0 4px #00ff88)'
                 }}></div>
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-primary/80 transform -translate-x-1/2"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)',
                   filter: 'drop-shadow(0 0 4px #00ff88)'
                 }}></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                 style={{filter: 'drop-shadow(0 0 4px #00ff88)'}}></div>
          </div>
        </motion.div>

        {/* 能量流动数值 - 光伏功率 */}
        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 text-primary font-bold text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {data?.solarPower || 480} W
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
