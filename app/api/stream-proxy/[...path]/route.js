export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Whitelist of upstream streaming servers (HTTP, no auth required)
const ALLOWED_HOSTS = new Set([
  'aczv.asia',
  'abusiness.icu',
  'awallstreet.icu',
  'bistu.online',
])

const LIVE_PREFIX = '/live/'

/**
 * Rewrite absolute segment URLs in m3u8 manifests so hls.js fetches them
 * through this proxy instead of directly (avoids mixed-content / CORS issues).
 */
function rewriteM3U8(text, requestOrigin, upstreamHost) {
  const proxyBase = `${requestOrigin}/api/stream-proxy/${upstreamHost}/`
  const hostRe = new RegExp(`^https?://${upstreamHost.replace(/\./g, '\\.')}/live/`, 'i')
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('#') || trimmed === '') return line
      if (hostRe.test(trimmed)) {
        try {
          const u = new URL(trimmed)
          const suffix = u.pathname.slice(LIVE_PREFIX.length) + u.search
          return proxyBase + suffix
        } catch {
          return line
        }
      }
      return line
    })
    .join('\n')
}

export async function GET(request, { params }) {
  const { path } = await params
  const segments = Array.isArray(path) ? path : [path]

  // First segment = upstream hostname, remainder = file path under /live/
  const [host, ...rest] = segments

  if (!ALLOWED_HOSTS.has(host)) {
    return new Response(
      JSON.stringify({ error: 'upstream_not_allowed', host }),
      { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }

  const filePath = rest.join('/')
  const url = new URL(request.url)
  const targetUrl = `http://${host}${LIVE_PREFIX}${filePath}${url.search}`

  try {
    const upstream = await fetch(targetUrl, {
      signal: AbortSignal.timeout(9000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StreamProxy/1.0)' },
    })

    const ct = upstream.headers.get('content-type') || 'application/octet-stream'
    const headers = new Headers()
    headers.set('Content-Type', ct)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    if (upstream.status === 403) {
      return new Response(
        JSON.stringify({ error: 'auth_expired', status: 403, message: '流鉴权已过期，请更新 txSecret / txTime' }),
        { status: 403, headers: new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }) }
      )
    }

    const isM3U8 = /\.m3u8(\?|$)/i.test(filePath) || /mpegurl/i.test(ct)
    if (isM3U8) {
      const text = await upstream.text()
      const rewritten = rewriteM3U8(text, url.origin, host)
      headers.set('Content-Type', 'application/vnd.apple.mpegurl')
      return new Response(rewritten, { status: upstream.status, headers })
    }

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }),
    })
  }
}
