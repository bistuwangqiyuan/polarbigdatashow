import { supabase, isSupabaseConfigured } from './supabase'

// 模拟数据生成器
function generateMockRealtimeData() {
  return {
    id: Date.now(),
    station_id: 1,
    current_power_kw: Math.random() * 100,
    voltage_v: 220 + Math.random() * 20,
    current_a: 100 + Math.random() * 50,
    temperature_c: 25 + Math.random() * 15,
    efficiency_percent: 85 + Math.random() * 10,
    timestamp: new Date().toISOString()
  }
}

function generateMockSummaryData() {
  return {
    total_energy_kwh: Math.random() * 10000,
    revenue_rmb: Math.random() * 8000,
    co2_reduction_ton: Math.random() * 7,
    peak_power_kw: Math.random() * 150,
    average_efficiency: 85 + Math.random() * 10
  }
}

function generateMockInverters() {
  return Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    station_id: 1,
    inverter_code: `INV-00${i + 1}`,
    model: 'SUN2000-100KTL',
    status: Math.random() > 0.2 ? 'normal' : 'warning',
    current_power_kw: Math.random() * 100,
    temperature_c: 30 + Math.random() * 20,
    efficiency_percent: 90 + Math.random() * 8,
    last_update: new Date().toISOString()
  }))
}

function generateMockAlerts() {
  const levels = ['info', 'warning', 'critical']
  const messages = [
    '逆变器温度偏高',
    '发电效率低于预期',
    '设备需要维护',
    '天气条件影响发电'
  ]
  
  return Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    station_id: Math.floor(Math.random() * 4) + 1,
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    status: 'active',
    created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    station_name: `电站${Math.floor(Math.random() * 4) + 1}`
  }))
}

function generate24HourTrend() {
  const hours = 24
  const now = new Date()
  return Array.from({ length: hours }, (_, i) => {
    const hour = (now.getHours() - hours + i + 1 + 24) % 24
    // 模拟日照曲线
    let value = 0
    if (hour >= 6 && hour <= 18) {
      const peakHour = 12
      const diff = Math.abs(hour - peakHour)
      value = Math.max(0, (100 - diff * 15) * (0.8 + Math.random() * 0.2))
    }
    return {
      time: `${hour}:00`,
      value: Math.round(value)
    }
  })
}

// 获取实时发电数据
export async function getRealtimePowerData(stationId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return generateMockRealtimeData()
  }

  try {
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
  } catch (error) {
    console.error('Error fetching realtime data:', error)
    return generateMockRealtimeData()
  }
}

// 获取今日累计数据
export async function getTodaySummary(stationId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return generateMockSummaryData()
  }

  try {
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
  } catch (error) {
    console.error('Error fetching summary data:', error)
    return generateMockSummaryData()
  }
}

// 获取逆变器状态
export async function getInvertersStatus(stationId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return generateMockInverters()
  }

  try {
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
  } catch (error) {
    console.error('Error fetching inverters:', error)
    return generateMockInverters()
  }
}

// 获取告警信息
export async function getActiveAlerts(limit = 10) {
  if (!isSupabaseConfigured || !supabase) {
    return generateMockAlerts()
  }

  try {
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
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return generateMockAlerts()
  }
}

// 获取24小时发电趋势
export async function get24HourTrend(stationId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return generate24HourTrend()
  }

  try {
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
  } catch (error) {
    console.error('Error fetching 24h trend:', error)
    return generate24HourTrend()
  }
}

// 获取所有电站信息
export async function getAllStations() {
  if (!isSupabaseConfigured || !supabase) {
    return [
      {
        id: 1,
        name: '光伏新能源电站1号',
        type: 'solar',
        capacity_mw: 50,
        status: 'active'
      },
      {
        id: 2,
        name: '光伏新能源电站2号',
        type: 'wind',
        capacity_mw: 30,
        status: 'active'
      }
    ]
  }

  try {
    const { data, error } = await supabase
      .from('solar_stations')
      .select('*')
      .eq('status', 'active')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching stations:', error)
    return []
  }
}

// 订阅实时数据更新
export function subscribeToRealtimeUpdates(callback) {
  if (!isSupabaseConfigured || !supabase) {
    // 返回一个空的清理函数
    return () => {}
  }

  try {
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
  } catch (error) {
    console.error('Error setting up subscription:', error)
    return () => {}
  }
}

// 生成模拟数据（用于演示）
export async function generateMockData() {
  // 如果Supabase未配置，则不执行数据库操作
  if (!isSupabaseConfigured || !supabase) {
    return
  }

  try {
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
  } catch (error) {
    console.error('Error generating mock data:', error)
  }
}