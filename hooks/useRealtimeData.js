import { useState, useEffect } from 'react'
import { 
  getRealtimePowerData, 
  getTodaySummary, 
  getInvertersStatus,
  getActiveAlerts,
  get24HourTrend,
  subscribeToRealtimeUpdates,
  generateMockData
} from '../lib/dataService'

export function useRealtimeData(refreshInterval = 5000) {
  const [data, setData] = useState({
    realtime: null,
    summary: null,
    inverters: [],
    alerts: [],
    trend: [],
    loading: true,
    error: null
  })

  // 获取所有数据
  const fetchAllData = async () => {
    try {
      const [realtime, summary, inverters, alerts, trend] = await Promise.all([
        getRealtimePowerData(),
        getTodaySummary(),
        getInvertersStatus(),
        getActiveAlerts(),
        get24HourTrend()
      ])

      setData({
        realtime,
        summary,
        inverters,
        alerts,
        trend,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  useEffect(() => {
    // 初始加载
    fetchAllData()

    // 设置定时刷新
    const interval = setInterval(() => {
      fetchAllData()
    }, refreshInterval)

    // 订阅实时更新
    const unsubscribe = subscribeToRealtimeUpdates((payload) => {
      console.log('Realtime update:', payload)
      // 当有实时更新时，立即刷新数据
      fetchAllData()
    })

    // 生成模拟数据（仅用于演示）
    const mockDataInterval = setInterval(() => {
      generateMockData().catch(console.error)
    }, 10000) // 每10秒生成一次模拟数据

    return () => {
      clearInterval(interval)
      clearInterval(mockDataInterval)
      unsubscribe()
    }
  }, [refreshInterval])

  return data
}

// 格式化数据的辅助函数
export function formatPowerData(data) {
  if (!data) return null

  return {
    // 实时数据
    currentPower: data.realtime?.current_power_kw || 0,
    voltage: data.realtime?.voltage_v || 0,
    current: data.realtime?.current_a || 0,
    temperature: data.realtime?.temperature_c || 0,
    efficiency: data.realtime?.efficiency_percent || 0,

    // 累计数据
    todayEnergy: data.summary?.total_energy_kwh || 0,
    todayRevenue: data.summary?.revenue_rmb || 0,
    co2Reduction: data.summary?.co2_reduction_ton || 0,
    peakPower: data.summary?.peak_power_kw || 0,

    // 逆变器数据
    inverters: data.inverters.map(inv => ({
      id: inv.id,
      name: inv.inverter_code,
      status: inv.status === 'normal' ? 'online' : inv.status === 'warning' ? 'warning' : 'offline',
      power: inv.current_power_kw || 0,
      temperature: inv.temperature_c || 0,
      efficiency: inv.efficiency_percent || 0
    })),

    // 告警数据
    alerts: data.alerts,

    // 趋势数据
    trend: data.trend
  }
}