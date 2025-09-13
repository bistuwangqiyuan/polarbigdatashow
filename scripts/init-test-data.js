const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 缺少必要的环境变量')
  console.log('请确保在 .env.local 文件中设置了以下变量：')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function initTestData() {
  console.log('🚀 开始初始化测试数据...')

  try {
    // 清理现有数据（可选）
    console.log('🧹 清理现有数据...')
    await supabase.from('alerts').delete().neq('id', 0)
    await supabase.from('power_generation_summary').delete().neq('id', 0)
    await supabase.from('power_generation_realtime').delete().neq('id', 0)
    await supabase.from('inverters').delete().neq('id', 0)
    await supabase.from('solar_stations').delete().neq('id', 0)

    // 1. 插入光伏电站基础信息
    console.log('📍 插入电站信息...')
    const { data: stations, error: stationsError } = await supabase
      .from('solar_stations')
      .insert([
        { name: '南庄坪光伏电站-A区', location: '南庄坪工业园区A区', capacity: 500.00, status: 'active', installed_date: '2023-01-15' },
        { name: '南庄坪光伏电站-B区', location: '南庄坪工业园区B区', capacity: 300.00, status: 'active', installed_date: '2023-03-20' },
        { name: '南庄坪风电场-1号', location: '南庄坪山顶', capacity: 100.00, status: 'active', installed_date: '2023-05-10' },
        { name: '南庄坪风电场-2号', location: '南庄坪山顶', capacity: 100.00, status: 'active', installed_date: '2023-05-10' }
      ])
      .select()

    if (stationsError) throw stationsError
    console.log(`✅ 插入了 ${stations.length} 个电站`)

    // 2. 插入逆变器设备信息
    console.log('⚡ 插入逆变器信息...')
    const { data: inverters, error: invertersError } = await supabase
      .from('inverters')
      .insert([
        { station_id: stations[0].id, name: '逆变器-A01', model: 'SUN2000-125KTL', power: 125.00, efficiency: 96.5, temperature: 35.2, status: 'normal' },
        { station_id: stations[0].id, name: '逆变器-A02', model: 'SUN2000-125KTL', power: 125.00, efficiency: 97.2, temperature: 34.8, status: 'normal' },
        { station_id: stations[0].id, name: '逆变器-A03', model: 'SUN2000-125KTL', power: 125.00, efficiency: 95.8, temperature: 36.5, status: 'normal' },
        { station_id: stations[0].id, name: '逆变器-A04', model: 'SUN2000-125KTL', power: 125.00, efficiency: 96.1, temperature: 35.9, status: 'normal' },
        { station_id: stations[1].id, name: '逆变器-B01', model: 'SUN2000-100KTL', power: 100.00, efficiency: 96.8, temperature: 33.2, status: 'normal' },
        { station_id: stations[1].id, name: '逆变器-B02', model: 'SUN2000-100KTL', power: 100.00, efficiency: 97.5, temperature: 32.8, status: 'normal' },
        { station_id: stations[1].id, name: '逆变器-B03', model: 'SUN2000-100KTL', power: 100.00, efficiency: 0, temperature: 25.0, status: 'offline' }
      ])
      .select()

    if (invertersError) throw invertersError
    console.log(`✅ 插入了 ${inverters.length} 个逆变器`)

    // 3. 插入实时发电数据
    console.log('📊 插入实时发电数据...')
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('power_generation_realtime')
      .insert([
        { station_id: stations[0].id, current_power: 385.50, voltage: 690.0, current: 323.5, frequency: 50.02, power_factor: 0.98 },
        { station_id: stations[1].id, current_power: 256.80, voltage: 690.0, current: 215.4, frequency: 50.01, power_factor: 0.97 },
        { station_id: stations[2].id, current_power: 45.30, voltage: 690.0, current: 38.0, frequency: 50.00, power_factor: 0.96 },
        { station_id: stations[3].id, current_power: 38.70, voltage: 690.0, current: 32.5, frequency: 50.00, power_factor: 0.95 }
      ])
      .select()

    if (realtimeError) throw realtimeError
    console.log(`✅ 插入了 ${realtimeData.length} 条实时数据`)

    // 4. 插入历史统计数据
    console.log('📈 插入历史统计数据...')
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    const summaryData = []
    
    // 今日数据
    summaryData.push(
      { station_id: stations[0].id, summary_date: today, total_energy: 6230.5, peak_power: 486.2, average_power: 259.6, capacity_factor: 0.52, revenue: 3115.25, co2_reduction: 4.36 },
      { station_id: stations[1].id, summary_date: today, total_energy: 4156.3, peak_power: 298.5, average_power: 173.2, capacity_factor: 0.58, revenue: 2078.15, co2_reduction: 2.91 },
      { station_id: stations[2].id, summary_date: today, total_energy: 875.6, peak_power: 95.2, average_power: 36.5, capacity_factor: 0.36, revenue: 437.80, co2_reduction: 0.61 },
      { station_id: stations[3].id, summary_date: today, total_energy: 786.9, peak_power: 88.5, average_power: 32.8, capacity_factor: 0.33, revenue: 393.45, co2_reduction: 0.55 }
    )
    
    // 昨日数据
    summaryData.push(
      { station_id: stations[0].id, summary_date: yesterday, total_energy: 8056.2, peak_power: 498.5, average_power: 335.7, capacity_factor: 0.67, revenue: 4028.10, co2_reduction: 5.64 },
      { station_id: stations[1].id, summary_date: yesterday, total_energy: 5382.1, peak_power: 312.6, average_power: 224.3, capacity_factor: 0.75, revenue: 2691.05, co2_reduction: 3.77 },
      { station_id: stations[2].id, summary_date: yesterday, total_energy: 1184.5, peak_power: 98.5, average_power: 49.4, capacity_factor: 0.49, revenue: 592.25, co2_reduction: 0.83 },
      { station_id: stations[3].id, summary_date: yesterday, total_energy: 1184.5, peak_power: 92.3, average_power: 49.4, capacity_factor: 0.49, revenue: 592.25, co2_reduction: 0.83 }
    )

    const { data: summary, error: summaryError } = await supabase
      .from('power_generation_summary')
      .insert(summaryData)
      .select()

    if (summaryError) throw summaryError
    console.log(`✅ 插入了 ${summary.length} 条统计数据`)

    // 5. 插入告警信息
    console.log('🚨 插入告警信息...')
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .insert([
        { station_id: stations[0].id, alert_type: 'temperature', severity: 'warning', title: '逆变器温度偏高', description: '逆变器A03温度达到36.5°C，请注意散热', status: 'active' },
        { station_id: stations[1].id, alert_type: 'device', severity: 'error', title: '逆变器离线', description: '逆变器B03已离线，请检查设备状态', status: 'active' },
        { station_id: stations[2].id, alert_type: 'efficiency', severity: 'info', title: '效率略有下降', description: '风机1号效率降至94.2%，建议进行维护', status: 'acknowledged' },
        { station_id: stations[0].id, alert_type: 'maintenance', severity: 'info', title: '定期维护提醒', description: '光伏板清洗维护时间已到', status: 'resolved' }
      ])
      .select()

    if (alertsError) throw alertsError
    console.log(`✅ 插入了 ${alerts.length} 条告警`)

    console.log('\n✨ 测试数据初始化成功！')
    console.log('您现在可以启动应用查看效果了：npm run dev')

  } catch (error) {
    console.error('❌ 初始化失败：', error.message)
    if (error.details) {
      console.error('详细信息：', error.details)
    }
    process.exit(1)
  }
}

// 运行初始化
initTestData()