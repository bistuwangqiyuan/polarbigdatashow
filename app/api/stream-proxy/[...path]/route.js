export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPSTREAM_BASE = 'http://aczv.asia/live/'

/**
 * For HLS m3u8 files: rewrite absolute segment URLs that point to aczv.asia
 * so hls.js fetches them through our proxy instead of directly (avoids CORS / auth issues).
 */
function rewriteM3U8(text, requestOrigin) {
  const proxyBase = `${requestOrigin}/api/stream-proxy/`
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('#') || trimmed === '') return line
      // Absolute URL pointing at aczv.asia → route through proxy
      if (/^https?:\/\/aczv\.asia\//i.test(trimmed)) {
        try {
          const u = new URL(trimmed)
          const suffix = u.pathname.replace(/^\/live\//, '') + u.search
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
  const pathStr = Array.isArray(path) ? path.join('/') : path
  const url = new URL(request.url)
  const targetUrl = `${UPSTREAM_BASE}${pathStr}${url.search}`

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

    // If upstream returns 403, pass a clear JSON error so the client can detect auth failure
    if (upstream.status === 403) {
      return new Response(
        JSON.stringify({ error: 'auth_expired', status: 403, message: '流鉴权已过期，请更新 txSecret / txTime' }),
        { status: 403, headers: new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }) }
      )
    }

    // For m3u8 manifests: rewrite absolute segment URLs to route through our proxy
    const isM3U8 = /\.m3u8(\?|$)/i.test(pathStr) || /mpegurl/i.test(ct)
    if (isM3U8) {
      const text = await upstream.text()
      const rewritten = rewriteM3U8(text, url.origin)
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
