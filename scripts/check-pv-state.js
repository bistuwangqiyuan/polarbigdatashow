const { neon } = require('@neondatabase/serverless')
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
const sql = neon(url)

Promise.all([
  sql`SELECT panel_id, override, updated_at FROM pv_panel_overrides ORDER BY panel_id`,
  sql`SELECT panel_id, occluded, ratio, type, reported_at FROM pv_occlusion_reports ORDER BY panel_id`,
  sql`SELECT COUNT(*)::int as cnt FROM pv_alarm_events`,
]).then(([ov, oc, ev]) => {
  console.log('=== Panel Overrides ===')
  ov.forEach(r => console.log(`  Panel ${r.panel_id}: ${r.override} (${new Date(r.updated_at).toLocaleString('zh-CN')})`))
  console.log('\n=== Occlusion Reports ===')
  oc.forEach(r => console.log(`  Panel ${r.panel_id}: occluded=${r.occluded}, ratio=${r.ratio}, type=${r.type}`))
  console.log('\n=== Alarm Events ===')
  console.log(`  Total: ${ev[0].cnt}`)
}).catch(e => console.error(e.message))
