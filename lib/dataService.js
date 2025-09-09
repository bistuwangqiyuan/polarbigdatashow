import { supabase } from './supabase'

// 获取实时发电数据
export async function getRealtimePowerData(stationId = null) {
  let query = supabase
    .from('power_generation_realtime')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)

  if (stationId) {
    query = query.eq('station_id', stationId)
  }

  const { data, error } = await query
  if (error) throw error
  return data?.[0] || null
}

// 获取今日累计数据
export async function getTodaySummary(stationId = null) {
  const today = new Date().toISOString().split('T')[0]
  
  let query = supabase
    .from('power_generation_summary')
    .select('*')
    .eq('date', today)

  if (stationId) {
    query = query.eq('station_id', stationId)
  }

  const { data, error } = await query
  if (error) throw error
  
  // 如果有多个电站，计算总和
  if (!stationId && data && data.length > 0) {
    return data.reduce((acc, curr) => ({
      total_energy_kwh: (acc.total_energy_kwh || 0) + (curr.total_energy_kwh || 0),
      revenue_rmb: (acc.revenue_rmb || 0) + (curr.revenue_rmb || 0),
      co2_reduction_ton: (acc.co2_reduction_ton || 0) + (curr.co2_reduction_ton || 0),
      peak_power_kw: Math.max(acc.peak_power_kw || 0, curr.peak_power_kw || 0)
    }), {})
  }
  
  return data?.[0] || null
}

// 获取逆变器状态
export async function getInvertersStatus(stationId = null) {
  let query = supabase
    .from('inverters')
    .select('*')
    .order('inverter_code')

  if (stationId) {
    query = query.eq('station_id', stationId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// 获取告警信息
export async function getActiveAlerts(limit = 10) {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      solar_stations (name)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  
  return data?.map(alert => ({
    ...alert,
    station_name: alert.solar_stations?.name
  })) || []
}

// 获取24小时发电趋势
export async function get24HourTrend(stationId = null) {
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  let query = supabase
    .from('power_generation_realtime')
    .select('timestamp, current_power_kw')
    .gte('timestamp', yesterday.toISOString())
    .order('timestamp')

  if (stationId) {
    query = query.eq('station_id', stationId)
  }

  const { data, error } = await query
  if (error) throw error

  // 按小时聚合数据
  const hourlyData = {}
  data?.forEach(record => {
    const hour = new Date(record.timestamp).getHours()
    if (!hourlyData[hour]) {
      hourlyData[hour] = []
    }
    hourlyData[hour].push(record.current_power_kw)
  })

  // 计算每小时平均值
  return Object.entries(hourlyData).map(([hour, values]) => ({
    time: `${hour}:00`,
    value: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  })).sort((a, b) => parseInt(a.time) - parseInt(b.time))
}

// 获取所有电站信息
export async function getAllStations() {
  const { data, error } = await supabase
    .from('solar_stations')
    .select('*')
    .eq('status', 'active')

  if (error) throw error
  return data || []
}

// 订阅实时数据更新
export function subscribeToRealtimeUpdates(callback) {
  const subscription = supabase
    .channel('realtime-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'power_generation_realtime'
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'alerts'
    }, callback)
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// 生成模拟数据（用于演示）
export async function generateMockData() {
  const stations = await getAllStations()
  
  for (const station of stations) {
    // 生成实时发电数据
    const realtimeData = {
      station_id: station.id,
      current_power_kw: Math.random() * station.capacity_mw * 1000 * 0.8,
      voltage_v: 220 + Math.random() * 20,
      current_a: 100 + Math.random() * 50,
      temperature_c: 25 + Math.random() * 15,
      efficiency_percent: 85 + Math.random() * 10
    }

    await supabase.from('power_generation_realtime').insert(realtimeData)

    // 更新今日累计数据
    const today = new Date().toISOString().split('T')[0]
    const existingSummary = await supabase
      .from('power_generation_summary')
      .select('*')
      .eq('station_id', station.id)
      .eq('date', today)
      .single()

    const summaryData = {
      station_id: station.id,
      date: today,
      total_energy_kwh: (existingSummary?.data?.total_energy_kwh || 0) + realtimeData.current_power_kw / 12,
      revenue_rmb: ((existingSummary?.data?.total_energy_kwh || 0) + realtimeData.current_power_kw / 12) * 0.85,
      co2_reduction_ton: ((existingSummary?.data?.total_energy_kwh || 0) + realtimeData.current_power_kw / 12) * 0.0007,
      peak_power_kw: Math.max(existingSummary?.data?.peak_power_kw || 0, realtimeData.current_power_kw),
      average_efficiency: realtimeData.efficiency_percent
    }

    await supabase.from('power_generation_summary').upsert(summaryData)

    // 更新逆变器数据
    const inverters = await supabase
      .from('inverters')
      .select('*')
      .eq('station_id', station.id)

    if (!inverters.data || inverters.data.length === 0) {
      // 创建逆变器
      for (let i = 1; i <= 4; i++) {
        await supabase.from('inverters').insert({
          station_id: station.id,
          inverter_code: `INV-${station.name}-${i}`,
          model: 'SUN2000-100KTL',
          status: Math.random() > 0.1 ? 'normal' : 'warning',
          current_power_kw: Math.random() * 100,
          temperature_c: 30 + Math.random() * 20,
          efficiency_percent: 90 + Math.random() * 8
        })
      }
    } else {
      // 更新现有逆变器
      for (const inverter of inverters.data) {
        await supabase
          .from('inverters')
          .update({
            status: Math.random() > 0.1 ? 'normal' : 'warning',
            current_power_kw: Math.random() * 100,
            temperature_c: 30 + Math.random() * 20,
            efficiency_percent: 90 + Math.random() * 8,
            last_update: new Date().toISOString()
          })
          .eq('id', inverter.id)
      }
    }
  }
}