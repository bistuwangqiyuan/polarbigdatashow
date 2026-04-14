import { neon } from '@neondatabase/serverless'

const getDb = () => {
  const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL
  if (!url) throw new Error('Missing database URL')
  return neon(url)
}

export const dynamic = 'force-dynamic'

/** GET /api/pv-state — returns overrides and latest occlusion per panel */
export async function GET() {
  try {
    const sql = getDb()

    const [overrideRows, occlusionRows] = await Promise.all([
      sql`SELECT panel_id, override, updated_at FROM pv_panel_overrides ORDER BY panel_id`,
      sql`SELECT panel_id, occluded, ratio, type, reported_at FROM pv_occlusion_reports ORDER BY panel_id`,
    ])

    const overrides = {}
    overrideRows.forEach((r) => { overrides[r.panel_id] = r.override })

    const panels = occlusionRows.map((r) => ({
      id: r.panel_id,
      occluded: r.occluded,
      ratio: r.ratio,
      type: r.type,
      reportedAt: r.reported_at,
    }))

    // Treat occlusion stale if oldest report is > 10 min
    const latest = occlusionRows.reduce((max, r) => {
      const t = new Date(r.reported_at).getTime()
      return t > max ? t : max
    }, 0)

    return Response.json({
      overrides,
      occlusion: { panels, timestamp: latest },
    })
  } catch (err) {
    console.error('[pv-state GET]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
