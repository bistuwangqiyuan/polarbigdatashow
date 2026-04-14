import { neon } from '@neondatabase/serverless'

const getDb = () => {
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
  if (!url) throw new Error('Missing database URL')
  return neon(url)
}

export const dynamic = 'force-dynamic'

/**
 * POST /api/pv-state/override
 * Body: { panelId: number, status: 'fault' | 'normal' }
 */
export async function POST(request) {
  try {
    const { panelId, status } = await request.json()
    if (!panelId || !['fault', 'normal'].includes(status)) {
      return Response.json({ error: 'Invalid params' }, { status: 400 })
    }

    const sql = getDb()

    await sql`
      INSERT INTO pv_panel_overrides (panel_id, override, updated_at)
      VALUES (${panelId}, ${status}, NOW())
      ON CONFLICT (panel_id) DO UPDATE
        SET override   = EXCLUDED.override,
            updated_at = NOW()
    `

    await sql`
      INSERT INTO pv_alarm_events (panel_id, event_type, details)
      VALUES (
        ${panelId},
        ${status === 'fault' ? 'fault_set' : 'normal_set'},
        ${JSON.stringify({ source: 'admin', status })}
      )
    `

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[pv-state/override POST]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/pv-state/override/reset  (reset all panels via this route with panelId=0)
 * Actually handled by sending { panelId: 0, status: 'normal' } convention — use dedicated endpoint.
 * Let's handle bulk-reset: body: { resetAll: true }
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    if (!body.resetAll) return Response.json({ error: 'Invalid' }, { status: 400 })

    const sql = getDb()
    await sql`UPDATE pv_panel_overrides SET override = 'normal', updated_at = NOW()`
    await sql`
      INSERT INTO pv_alarm_events (panel_id, event_type, details)
      VALUES (0, 'normal_set', ${JSON.stringify({ source: 'admin', resetAll: true })})
    `
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[pv-state/override PUT]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
