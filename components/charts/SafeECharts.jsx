'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// 动态导入ReactECharts，禁用SSR
const ReactECharts = dynamic(
  () => import('echarts-for-react'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-primary animate-pulse">加载图表中...</div>
      </div>
    )
  }
)

export default function SafeECharts({ option, style, ...props }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-primary animate-pulse">初始化图表...</div>
      </div>
    )
  }

  return <ReactECharts option={option} style={style} {...props} />
}
