const { neon } = require('@neondatabase/serverless')
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
const sql = neon(url)

async function migrate() {
  console.log('Altering pv_panel_overrides to allow offline...')
  await sql`
    ALTER TABLE pv_panel_overrides
      DROP CONSTRAINT IF EXISTS pv_panel_overrides_override_check
  `
  await sql`
    ALTER TABLE pv_panel_overrides
      ADD CONSTRAINT pv_panel_overrides_override_check
        CHECK (override IN ('fault', 'normal', 'offline'))
  `
  console.log('Done.')
}

migrate().catch(e => { console.error(e); process.exit(1) })
