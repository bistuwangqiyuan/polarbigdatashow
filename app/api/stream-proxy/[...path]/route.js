export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPSTREAM_BASE = 'http://aczv.asia/live/'

export async function GET(request, { params }) {
  const { path } = await params
  const pathStr = Array.isArray(path) ? path.join('/') : path
  const url = new URL(request.url)
  const targetUrl = `${UPSTREAM_BASE}${pathStr}${url.search}`

  try {
    const upstream = await fetch(targetUrl, {
      signal: AbortSignal.timeout(9000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const ct = upstream.headers.get('content-type') || 'application/octet-stream'
    const headers = new Headers()
    headers.set('Content-Type', ct)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
