const { neon } = require('@neondatabase/serverless')
const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
const sql = neon(url)

async function migrate() {
  console.log('Creating pv tables...')

  await sql`
    CREATE TABLE IF NOT EXISTS pv_panel_overrides (
      panel_id   INTEGER PRIMARY KEY,
      override   TEXT CHECK (override IN ('fault', 'normal')),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS pv_occlusion_reports (
      panel_id    INTEGER PRIMARY KEY,
      occluded    BOOLEAN NOT NULL DEFAULT FALSE,
      ratio       FLOAT   NOT NULL DEFAULT 0,
      type        TEXT,
      reported_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS pv_alarm_events (
      id         SERIAL PRIMARY KEY,
      panel_id   INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      details    JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  // Seed panel_overrides with 4 panels defaulting to 'normal'
  for (const id of [1, 2, 3, 4]) {
    await sql`
      INSERT INTO pv_panel_overrides (panel_id, override)
      VALUES (${id}, 'normal')
      ON CONFLICT (panel_id) DO NOTHING
    `
    // Seed occlusion as not-occluded
    await sql`
      INSERT INTO pv_occlusion_reports (panel_id, occluded, ratio, type)
      VALUES (${id}, false, 0, null)
      ON CONFLICT (panel_id) DO NOTHING
    `
  }

  console.log('Migration complete.')
}

migrate().catch(e => { console.error(e); process.exit(1) })
