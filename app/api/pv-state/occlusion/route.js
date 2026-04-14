import { neon } from '@neondatabase/serverless'

const getDb = () => {
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
  if (!url) throw new Error('Missing database URL')
  return neon(url)
}

export const dynamic = 'force-dynamic'

/**
 * POST /api/pv-state/occlusion
 * Body: { panels: [{ id, occluded, ratio, type }] }
 * Saves the latest AI occlusion report to the database.
 */
export async function POST(request) {
  try {
    const { panels } = await request.json()
    if (!Array.isArray(panels)) {
      return Response.json({ error: 'panels must be array' }, { status: 400 })
    }

    const sql = getDb()

    await Promise.all(panels.map((p) =>
      sql`
        INSERT INTO pv_occlusion_reports (panel_id, occluded, ratio, type, reported_at)
        VALUES (${p.id}, ${!!p.occluded}, ${p.ratio ?? 0}, ${p.type ?? null}, NOW())
        ON CONFLICT (panel_id) DO UPDATE
          SET occluded    = EXCLUDED.occluded,
              ratio       = EXCLUDED.ratio,
              type        = EXCLUDED.type,
              reported_at = NOW()
      `
    ))

    // Log event for panels that are occluded
    const occluded = panels.filter((p) => p.occluded && p.ratio > 0)
    if (occluded.length > 0) {
      await Promise.all(occluded.map((p) =>
        sql`
          INSERT INTO pv_alarm_events (panel_id, event_type, details)
          VALUES (
            ${p.id},
            'occlusion_detected',
            ${JSON.stringify({ ratio: p.ratio, type: p.type })}
          )
        `
      ))
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[pv-state/occlusion POST]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
