const { neon, Pool } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

const databaseUrl = process.env.DATABASE_URL
  || process.env.NETLIFY_DATABASE_URL

if (!databaseUrl) {
  console.error('请设置环境变量 DATABASE_URL 或 NETLIFY_DATABASE_URL')
  process.exit(1)
}

async function initDatabase() {
  console.log('连接 Neon Postgres 数据库...')

  const pool = new Pool({ connectionString: databaseUrl })
  const sql = neon(databaseUrl)

  // 1. 执行 Schema（使用 Pool.query 支持原始 SQL 字符串）
  console.log('创建表结构...')
  const schemaPath = path.join(__dirname, '../lib/neon-schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')

  try {
    await pool.query(schema)
    console.log('表结构创建完成')
  } catch (err) {
    console.warn('Schema 执行警告:', err.message?.substring(0, 120))
  }

  // 2. 检查是否已有数据
  const existing = await sql`SELECT count(*)::int as cnt FROM solar_stations`
  if (existing[0].cnt > 0) {
    console.log(`数据库已包含 ${existing[0].cnt} 个电站，跳过数据初始化`)
    await pool.end()
    return
  }

  // 3. 插入种子数据
  console.log('插入种子数据...')

  await sql`
    INSERT INTO solar_stations (name, location, capacity_mw, status) VALUES
    ('天津滨海光伏电站-A区', '天津滨海新区泰达科技发展中心', 0.65, 'active'),
    ('天津滨海风电机组', '天津滨海新区泰达科技发展中心', 0.15, 'active')
  `

  await sql`
    INSERT INTO inverters (station_id, inverter_code, model, status, current_power_kw, temperature_c, efficiency_percent) VALUES
    (1, 'INV-001', 'SUN2000-1KTL', 'normal', 0.48, 35.2, 96.5),
    (1, 'INV-002', 'SUN2000-1KTL', 'normal', 0.45, 34.8, 95.8)
  `

  await sql`
    INSERT INTO power_generation_summary (station_id, date, total_energy_kwh, revenue_rmb, co2_reduction_ton, peak_power_kw, average_efficiency) VALUES
    (1, CURRENT_DATE, 2.10, 1.16, 0.0015, 0.55, 91.8),
    (2, CURRENT_DATE, 0.28, 0.15, 0.0002, 0.042, 76.5)
  `

  await sql`
    INSERT INTO power_generation_realtime (station_id, current_power_kw, voltage_v, current_a, temperature_c, efficiency_percent) VALUES
    (1, 0.48, 230.5, 2.1, 35.0, 91.8),
    (2, 0.042, 230.2, 0.18, 28.0, 76.5)
  `

  await sql`
    INSERT INTO alerts (station_id, alert_type, severity, message, status) VALUES
    (1, 'temperature', 'warning', '逆变器温度偏高，请注意散热', 'active'),
    (2, 'efficiency', 'info', '风机效率略有下降，建议维护', 'active')
  `

  await sql`
    INSERT INTO energy_storage (name, capacity, current_soc, power, status, temperature) VALUES
    ('储能电池组-01', 2.0, 88.0, 0.08, 'normal', 25.0),
    ('储能电池组-02', 2.0, 85.0, 0.075, 'normal', 24.0),
    ('储能电池组-03', 2.0, 82.0, 0.072, 'normal', 24.0),
    ('储能电池组-04', 2.0, 80.0, 0.068, 'normal', 25.0)
  `

  await sql`
    INSERT INTO devices (name, type, status, power, efficiency, temperature, runtime, load_percent, switchable) VALUES
    ('光伏阵列-01', '光伏组件', 'online', 125.5, 96.5, 35, 4320, 85, true),
    ('光伏阵列-02', '光伏组件', 'online', 118.2, 95.8, 34, 4320, 82, true),
    ('光伏阵列-03', '光伏组件', 'online', 132.1, 97.2, 36, 4320, 88, true),
    ('光伏阵列-04', '光伏组件', 'offline', 0, 0, 25, 4320, 0, true),
    ('风机-01', '风力发电机', 'offline', 0, 0, 25, 3960, 0, false),
    ('风机-02', '风力发电机', 'offline', 0, 0, 25, 3960, 0, false),
    ('储能电池组-01', '储能', 'online', 80.0, 98.5, 25, 8760, 88, false),
    ('储能电池组-02', '储能', 'online', 75.5, 98.2, 24, 8760, 85, false),
    ('储能电池组-03', '储能', 'online', 72.0, 97.9, 24, 8760, 82, false),
    ('储能电池组-04', '储能', 'online', 68.5, 97.6, 25, 8760, 80, false),
    ('逆变器-01', '电力转换', 'online', 95.0, 97.8, 42, 8640, 90, false),
    ('逆变器-02', '电力转换', 'offline', 0, 0, 25, 8635, 0, false),
    ('用能设备-01', '用能设备', 'online', 60.0, 95.0, 30, 7200, 100, false),
    ('用能设备-02', '用能设备', 'online', 30.0, 95.0, 28, 7200, 50, false)
  `

  console.log('种子数据插入完成！')
  await pool.end()
}

initDatabase()
  .then(() => {
    console.log('数据库初始化成功')
    process.exit(0)
  })
  .catch(err => {
    console.error('初始化失败:', err)
    process.exit(1)
  })
