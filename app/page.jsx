'use client'

import { useEffect } from 'react'
import DashboardLayout from 'components/dashboard/DashboardLayout'
import DashboardGrid, { GridItem } from 'components/dashboard/DashboardGrid'
import StatCard from 'components/dashboard/StatCard'
import DeviceStatus from 'components/dashboard/DeviceStatus'
import AlertPanel from 'components/dashboard/AlertPanel'
import PowerTrendChart from 'components/charts/PowerTrendChart'
import EfficiencyChart from 'components/charts/EfficiencyChart'
import StationMap from 'components/charts/StationMap'
import { useRealtimeData, formatPowerData } from 'hooks/useRealtimeData'

// 图标组件
const PowerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const EnergyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CO2Icon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function Page() {
  const { realtime, summary, inverters, alerts, trend, loading, error } = useRealtimeData()
  const data = formatPowerData({ realtime, summary, inverters, alerts, trend })

  // 更新页面标题时钟
  useEffect(() => {
    const updateClock = () => {
      const clockElement = document.getElementById('clock')
      if (clockElement) {
        clockElement.textContent = new Date().toLocaleTimeString('zh-CN')
      }
    }
    
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading && !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-primary text-xl">加载中...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-danger text-xl">数据加载失败: {error}</div>
        </div>
      </DashboardLayout>
    )
  }

  // 生成模拟趋势数据
  const trendData = data?.trend?.length > 0 ? data.trend : Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 5000 + 1000)
  }))

  // 生成模拟效率数据
  const efficiencyData = data?.inverters?.map((inv, idx) => ({
    name: inv.name || `逆变器${idx + 1}`,
    efficiency: inv.efficiency || 90 + Math.random() * 8,
    power: inv.power || Math.random() * 100
  })) || []

  return (
    <DashboardLayout>
      <DashboardGrid cols={12} gap={6}>
        {/* 第一行：核心指标 */}
        <GridItem colSpan={3}>
          <StatCard
            title="实时功率"
            value={data?.currentPower || 0}
            unit="kW"
            icon={<PowerIcon />}
            trend={{ value: 5.2, label: "较昨日同期" }}
            delay={0}
          />
        </GridItem>
        
        <GridItem colSpan={3}>
          <StatCard
            title="今日发电量"
            value={data?.todayEnergy || 0}
            unit="MWh"
            icon={<EnergyIcon />}
            trend={{ value: 8.5, label: "较昨日" }}
            delay={0.1}
          />
        </GridItem>
        
        <GridItem colSpan={3}>
          <StatCard
            title="今日收益"
            value={data?.todayRevenue || 0}
            unit="元"
            icon={<MoneyIcon />}
            trend={{ value: 8.5, label: "较昨日" }}
            delay={0.2}
          />
        </GridItem>
        
        <GridItem colSpan={3}>
          <StatCard
            title="CO₂减排量"
            value={data?.co2Reduction || 0}
            unit="吨"
            icon={<CO2Icon />}
            delay={0.3}
          />
        </GridItem>

        {/* 第二行：图表 */}
        <GridItem colSpan={8} rowSpan={2}>
          <PowerTrendChart data={trendData} />
        </GridItem>
        
        <GridItem colSpan={4} rowSpan={2}>
          <DeviceStatus devices={data?.inverters || []} />
        </GridItem>

        {/* 第三行：地图和效率对比 */}
        <GridItem colSpan={5}>
          <StationMap stations={[]} />
        </GridItem>
        
        <GridItem colSpan={4}>
          <EfficiencyChart data={efficiencyData} />
        </GridItem>
        
        <GridItem colSpan={3}>
          <AlertPanel alerts={data?.alerts || []} />
        </GridItem>
      </DashboardGrid>
    </DashboardLayout>
  )
}