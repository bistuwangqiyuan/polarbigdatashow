const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL)

async function verify() {
  const stations = await sql`SELECT name, location FROM solar_stations`
  console.log('电站:', JSON.stringify(stations, null, 2))

  const devices = await sql`SELECT count(*)::int as c FROM devices`
  console.log('设备数:', devices[0].c)

  const storage = await sql`SELECT count(*)::int as c FROM energy_storage`
  console.log('储能数:', storage[0].c)

  const alerts = await sql`SELECT count(*)::int as c FROM alerts`
  console.log('告警数:', alerts[0].c)
}

verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
