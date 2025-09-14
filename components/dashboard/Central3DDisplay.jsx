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

      // 绘制连接线 - 调整为相对于300x150的canvas
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.4
      
      const connections = [
        { from: { x: centerX - radius, y: centerY }, to: { x: centerX, y: centerY } }, // 左到中
        { from: { x: centerX + radius, y: centerY }, to: { x: centerX, y: centerY } }, // 右到中
        { from: { x: centerX, y: centerY - radius * 0.6 }, to: { x: centerX, y: centerY } }, // 上到中
        { from: { x: centerX, y: centerY + radius * 0.6 }, to: { x: centerX, y: centerY } }, // 下到中
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
            {/* 支架 */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-gray-500 to-gray-700"></div>
            
            {/* 光伏板主体 */}
            <div className="w-32 h-24 transform -rotate-12 skew-y-6 relative">
              {/* 铝合金边框 */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded shadow-2xl">
                {/* 内部光伏电池阵列 */}
                <div className="absolute inset-1 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded overflow-hidden">
                  {/* 玻璃反光效果 */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5"></div>
                  
                  {/* 光伏电池单元网格 */}
                  <div className="absolute inset-0.5 grid grid-cols-6 grid-rows-4 gap-[1px] p-1">
                    {[...Array(24)].map((_, i) => (
                      <div 
                        key={i} 
                        className="relative bg-gradient-to-br from-blue-800 to-blue-950 rounded-[1px] overflow-hidden"
                      >
                        {/* 电池片内部纹理 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                        {/* 电极线 */}
                        <div className="absolute inset-x-0 top-1/2 h-[0.5px] bg-gray-400/30"></div>
                        <div className="absolute inset-y-0 left-1/2 w-[0.5px] bg-gray-400/30"></div>
                        {/* 微小反光点 */}
                        {i % 3 === 0 && (
                          <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* 额外的光泽层 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
                </div>
              </div>
              
              {/* 边框高光 */}
              <div className="absolute -inset-[1px] bg-gradient-to-br from-white/20 to-transparent rounded pointer-events-none"></div>
            </div>
            
            {/* 标签 */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-primary font-bold whitespace-nowrap">光伏</div>
          </div>
          
          {/* 发光效果 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-400/20 rounded-full blur-xl"></div>
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

        {/* 储能 */}
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
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold">储能</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-current/20 rounded-full blur-xl"></div>
        </motion.div>

        {/* 变电站 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-[20%]"
        >
          <div className="relative w-36 h-24">
            {/* 围栏底座 */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-gray-600 to-gray-800 rounded"></div>
            
            {/* 主变压器 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-16">
              {/* 变压器主体 */}
              <div className="relative w-full h-full">
                {/* 变压器外壳 */}
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-orange-700 rounded-lg shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-lg"></div>
                  
                  {/* 散热片纹理 */}
                  <div className="absolute inset-x-1 inset-y-2 flex flex-col gap-[1px]">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 bg-orange-800/40 rounded-sm"></div>
                    ))}
                  </div>
                  
                  {/* 变压器铭牌 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-4 bg-yellow-600/80 rounded-sm flex items-center justify-center">
                    <div className="text-[6px] font-bold text-orange-900">HV</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 高压线塔架 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8">
              {/* 横梁 */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-gray-400 to-gray-600"></div>
              
              {/* 支撑柱 */}
              <div className="absolute top-0 left-2 w-0.5 h-full bg-gradient-to-b from-gray-400 to-gray-600"></div>
              <div className="absolute top-0 right-2 w-0.5 h-full bg-gradient-to-b from-gray-400 to-gray-600"></div>
              
              {/* 绝缘子串 */}
              {[0, 1, 2].map((i) => (
                <div key={i} className="absolute top-1" style={{ left: `${25 + i * 25}%` }}>
                  {/* 绝缘子 */}
                  <div className="flex flex-col items-center gap-[1px]">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="w-2 h-[2px] bg-gradient-to-b from-teal-300 to-teal-500 rounded-full"></div>
                    ))}
                  </div>
                  {/* 连接线 */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[1px] h-3 bg-orange-600"></div>
                </div>
              ))}
            </div>
            
            {/* 开关设备 */}
            <div className="absolute bottom-2 left-3 w-4 h-4 bg-gradient-to-b from-gray-300 to-gray-500 rounded-sm shadow-md">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-sm"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* 电流指示 */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-6 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-gradient-to-b from-yellow-400 to-orange-600"
            ></motion.div>
            
            {/* 标签 */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-primary font-bold whitespace-nowrap">变电站</div>
          </div>
          
          {/* 发光效果 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-500/20 rounded-full blur-xl"></div>
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

        {/* 连接线画布 - 位于中央 */}
        <canvas ref={canvasRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" style={{ width: '300px', height: '150px' }}></canvas>

        {/* 电流虚线十字指示器 - 位于场站用电圆形中心 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
        >
          <div className="relative w-16 h-16">
            {/* 水平虚线 */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/80 transform -translate-y-1/2"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)',
                   filter: 'drop-shadow(0 0 4px #00ff88)'
                 }}></div>
            {/* 垂直虚线 */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-primary/80 transform -translate-x-1/2"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)',
                   filter: 'drop-shadow(0 0 4px #00ff88)'
                 }}></div>
            {/* 中心圆点 */}
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                 style={{filter: 'drop-shadow(0 0 4px #00ff88)'}}></div>
          </div>
        </motion.div>

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