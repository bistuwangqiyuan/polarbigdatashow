const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzyueuweeoakopuuwfau.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.CTLF9Ahmxt7alyiv-sf_Gl3U6SNIWZ01PapTI92Hg0g'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function testSupabaseConnection() {
  console.log('=== 测试 Supabase 连接 ===')
  try {
    const { data, error } = await supabase
      .from('solar_stations')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase连接失败:', error.message)
      return false
    }
    
    console.log('✅ Supabase连接成功')
    return true
  } catch (err) {
    console.error('❌ Supabase连接异常:', err.message)
    return false
  }
}

async function checkDatabaseTables() {
  console.log('\n=== 检查数据库表结构 ===')
  const tables = [
    'solar_stations',
    'power_generation_realtime',
    'power_generation_summary',
    'inverters',
    'alerts'
  ]
  
  let allTablesExist = true
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error(`❌ 表 ${table} 不存在或无法访问:`, error.message)
        allTablesExist = false
      } else {
        console.log(`✅ 表 ${table} 存在 (记录数: ${count || 0})`)
      }
    } catch (err) {
      console.error(`❌ 检查表 ${table} 时出错:`, err.message)
      allTablesExist = false
    }
  }
  
  return allTablesExist
}

async function checkDataService() {
  console.log('\n=== 测试数据服务功能 ===')
  
  try {
    // 测试获取实时数据
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('power_generation_realtime')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()
    
    if (realtimeError && realtimeError.code !== 'PGRST116') {
      console.error('❌ 获取实时数据失败:', realtimeError.message)
    } else if (realtimeData) {
      console.log('✅ 实时数据获取成功:', {
        timestamp: realtimeData.timestamp,
        power: realtimeData.current_power_kw
      })
    } else {
      console.log('⚠️  暂无实时数据')
    }
    
    // 测试获取汇总数据
    const today = new Date().toISOString().split('T')[0]
    const { data: summaryData, error: summaryError } = await supabase
      .from('power_generation_summary')
      .select('*')
      .eq('date', today)
      .single()
    
    if (summaryError && summaryError.code !== 'PGRST116') {
      console.error('❌ 获取汇总数据失败:', summaryError.message)
    } else if (summaryData) {
      console.log('✅ 汇总数据获取成功:', {
        date: summaryData.date,
        totalEnergy: summaryData.total_energy_kwh
      })
    } else {
      console.log('⚠️  暂无今日汇总数据')
    }
    
    return true
  } catch (err) {
    console.error('❌ 数据服务测试失败:', err.message)
    return false
  }
}

async function testWebServer() {
  console.log('\n=== 测试 Web 服务器 ===')
  
  try {
    const response = await fetch('http://localhost:3000')
    if (response.ok) {
      console.log('✅ Web服务器运行正常 (状态码:', response.status, ')')
      return true
    } else {
      console.error('❌ Web服务器响应异常 (状态码:', response.status, ')')
      return false
    }
  } catch (err) {
    console.error('❌ 无法连接到Web服务器 (请确保已运行 npm run dev)')
    return false
  }
}

async function insertTestData() {
  console.log('\n=== 插入测试数据 ===')
  
  try {
    // 获取第一个电站
    const { data: stations, error: stationError } = await supabase
      .from('solar_stations')
      .select('*')
      .limit(1)
      .single()
    
    if (stationError || !stations) {
      console.error('❌ 无法获取电站信息，跳过数据插入')
      return false
    }
    
    // 插入实时数据
    const realtimeData = {
      station_id: stations.id,
      current_power_kw: Math.random() * 50000,
      voltage_v: 220 + Math.random() * 20,
      current_a: 100 + Math.random() * 50,
      temperature_c: 25 + Math.random() * 15,
      efficiency_percent: 85 + Math.random() * 10
    }
    
    const { error: insertError } = await supabase
      .from('power_generation_realtime')
      .insert(realtimeData)
    
    if (insertError) {
      console.error('❌ 插入实时数据失败:', insertError.message)
    } else {
      console.log('✅ 成功插入测试实时数据')
    }
    
    // 插入告警数据
    const alertData = {
      station_id: stations.id,
      alert_type: 'temperature',
      severity: 'warning',
      message: '逆变器温度过高，当前温度 65°C',
      status: 'active'
    }
    
    const { error: alertError } = await supabase
      .from('alerts')
      .insert(alertData)
    
    if (alertError) {
      console.error('❌ 插入告警数据失败:', alertError.message)
    } else {
      console.log('✅ 成功插入测试告警数据')
    }
    
    return true
  } catch (err) {
    console.error('❌ 插入测试数据失败:', err.message)
    return false
  }
}

// 主测试函数
async function runAllTests() {
  console.log('开始功能测试...\n')
  
  const tests = [
    { name: 'Supabase连接', fn: testSupabaseConnection },
    { name: '数据库表结构', fn: checkDatabaseTables },
    { name: '数据服务', fn: checkDataService },
    { name: 'Web服务器', fn: testWebServer },
    { name: '测试数据插入', fn: insertTestData }
  ]
  
  const results = []
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      results.push({ name: test.name, success: result })
    } catch (err) {
      console.error(`测试 ${test.name} 异常:`, err.message)
      results.push({ name: test.name, success: false })
    }
  }
  
  // 输出测试总结
  console.log('\n=== 测试总结 ===')
  const passedTests = results.filter(r => r.success).length
  const totalTests = results.length
  
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.name}`)
  })
  
  console.log(`\n总计: ${passedTests}/${totalTests} 测试通过`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！')
  } else {
    console.log('⚠️  部分测试失败，请检查错误信息')
  }
}

// 运行测试
runAllTests().catch(console.error)