import { sql, isDatabaseConfigured } from './db'

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

export async function getRealtimePowerData(stationId = null) {
  if (!isDatabaseConfigured || !sql) {
    return generateMockRealtimeData()
  }

  try {
    let rows
    if (stationId) {
      rows = await sql`
        SELECT * FROM power_generation_realtime
        WHERE station_id = ${stationId}
        ORDER BY timestamp DESC LIMIT 1
      `
    } else {
      rows = await sql`
        SELECT * FROM power_generation_realtime
        ORDER BY timestamp DESC LIMIT 1
      `
    }
    return rows[0] || null
  } catch (error) {
    console.error('Error fetching realtime data:', error)
    return generateMockRealtimeData()
  }
}

export async function getTodaySummary(stationId = null) {
  if (!isDatabaseConfigured || !sql) {
    return generateMockSummaryData()
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    let rows

    if (stationId) {
      rows = await sql`
        SELECT * FROM power_generation_summary
        WHERE date = ${today} AND station_id = ${stationId}
      `
    } else {
      rows = await sql`
        SELECT * FROM power_generation_summary
        WHERE date = ${today}
      `
    }

    if (!stationId && rows && rows.length > 0) {
      return rows.reduce((acc, curr) => ({
        total_energy_kwh: (acc.total_energy_kwh || 0) + Number(curr.total_energy_kwh || 0),
        revenue_rmb: (acc.revenue_rmb || 0) + Number(curr.revenue_rmb || 0),
        co2_reduction_ton: (acc.co2_reduction_ton || 0) + Number(curr.co2_reduction_ton || 0),
        peak_power_kw: Math.max(acc.peak_power_kw || 0, Number(curr.peak_power_kw || 0))
      }), {})
    }

    return rows[0] || null
  } catch (error) {
    console.error('Error fetching summary data:', error)
    return generateMockSummaryData()
  }
}

export async function getInvertersStatus(stationId = null) {
  if (!isDatabaseConfigured || !sql) {
    return generateMockInverters()
  }

  try {
    let rows
    if (stationId) {
      rows = await sql`
        SELECT * FROM inverters
        WHERE station_id = ${stationId}
        ORDER BY inverter_code
      `
    } else {
      rows = await sql`
        SELECT * FROM inverters ORDER BY inverter_code
      `
    }
    return rows || []
  } catch (error) {
    console.error('Error fetching inverters:', error)
    return generateMockInverters()
  }
}

export async function getActiveAlerts(limit = 10) {
  if (!isDatabaseConfigured || !sql) {
    return generateMockAlerts()
  }

  try {
    const rows = await sql`
      SELECT a.*, s.name AS station_name
      FROM alerts a
      LEFT JOIN solar_stations s ON a.station_id = s.id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `
    return rows || []
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return generateMockAlerts()
  }
}

export async function get24HourTrend(stationId = null) {
  if (!isDatabaseConfigured || !sql) {
    return generate24HourTrend()
  }

  try {
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    const since = yesterday.toISOString()

    let rows
    if (stationId) {
      rows = await sql`
        SELECT timestamp, current_power_kw
        FROM power_generation_realtime
        WHERE timestamp >= ${since} AND station_id = ${stationId}
        ORDER BY timestamp
      `
    } else {
      rows = await sql`
        SELECT timestamp, current_power_kw
        FROM power_generation_realtime
        WHERE timestamp >= ${since}
        ORDER BY timestamp
      `
    }

    const hourlyData = {}
    rows?.forEach(record => {
      const hour = new Date(record.timestamp).getHours()
      if (!hourlyData[hour]) hourlyData[hour] = []
      hourlyData[hour].push(Number(record.current_power_kw))
    })

    return Object.entries(hourlyData).map(([hour, values]) => ({
      time: `${hour}:00`,
      value: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    })).sort((a, b) => parseInt(a.time) - parseInt(b.time))
  } catch (error) {
    console.error('Error fetching 24h trend:', error)
    return generate24HourTrend()
  }
}

export async function getAllStations() {
  if (!isDatabaseConfigured || !sql) {
    return [
      { id: 1, name: '光伏新能源电站1号', type: 'solar', capacity_mw: 50, status: 'active' },
      { id: 2, name: '光伏新能源电站2号', type: 'wind', capacity_mw: 30, status: 'active' }
    ]
  }

  try {
    const rows = await sql`
      SELECT * FROM solar_stations WHERE status = 'active'
    `
    return rows || []
  } catch (error) {
    console.error('Error fetching stations:', error)
    return []
  }
}

export function subscribeToRealtimeUpdates(callback) {
  return () => {}
}

export async function generateMockData() {
  if (!isDatabaseConfigured || !sql) return

  try {
    const stations = await getAllStations()
    
    for (const station of stations) {
      const powerKw = Math.random() * Number(station.capacity_mw) * 1000 * 0.8
      const voltage = 220 + Math.random() * 20
      const current = 100 + Math.random() * 50
      const temp = 25 + Math.random() * 15
      const efficiency = 85 + Math.random() * 10

      await sql`
        INSERT INTO power_generation_realtime
          (station_id, current_power_kw, voltage_v, current_a, temperature_c, efficiency_percent)
        VALUES (${station.id}, ${powerKw}, ${voltage}, ${current}, ${temp}, ${efficiency})
      `

      const today = new Date().toISOString().split('T')[0]
      const existing = await sql`
        SELECT * FROM power_generation_summary
        WHERE station_id = ${station.id} AND date = ${today}
      `

      const prevEnergy = existing[0] ? Number(existing[0].total_energy_kwh) : 0
      const newEnergy = prevEnergy + powerKw / 12
      const revenue = newEnergy * 0.85
      const co2 = newEnergy * 0.0007
      const peakPower = Math.max(existing[0] ? Number(existing[0].peak_power_kw) : 0, powerKw)

      if (existing.length > 0) {
        await sql`
          UPDATE power_generation_summary
          SET total_energy_kwh = ${newEnergy},
              revenue_rmb = ${revenue},
              co2_reduction_ton = ${co2},
              peak_power_kw = ${peakPower},
              average_efficiency = ${efficiency}
          WHERE station_id = ${station.id} AND date = ${today}
        `
      } else {
        await sql`
          INSERT INTO power_generation_summary
            (station_id, date, total_energy_kwh, revenue_rmb, co2_reduction_ton, peak_power_kw, average_efficiency)
          VALUES (${station.id}, ${today}, ${newEnergy}, ${revenue}, ${co2}, ${peakPower}, ${efficiency})
        `
      }
    }
  } catch (error) {
    console.error('Error generating mock data:', error)
  }
}
