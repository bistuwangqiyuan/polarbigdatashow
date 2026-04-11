/**
 * Netlify 生产站点路由冒烟测试
 * 用法: node scripts/smoke-netlify.mjs https://emoj.top
 */
const base = (process.argv[2] || process.env.SMOKE_URL || 'https://emoj.top').replace(/\/$/, '')

const routes = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/devices', name: 'devices' },
  { path: '/devices/solar/1', name: 'solar-detail' },
  { path: '/gallery', name: 'gallery' },
  { path: '/pv-vision', name: 'pv-vision' },
  { path: '/analytics', name: 'analytics' },
  { path: '/history', name: 'history' },
  { path: '/settings', name: 'settings' },
  { path: '/alerts', name: 'alerts' },
  { path: '/robots.txt', name: 'robots' },
  { path: '/sitemap.xml', name: 'sitemap' },
  { path: '/api/init-data', name: 'api-init-data', method: 'GET' },
  { path: '/api/pv-fault-vision', name: 'api-pv-vision', method: 'GET' },
]

const staticChecks = [
  { path: '/image/logo.png', name: 'logo' },
  { path: '/image/fault-gallery/sample7.png', name: 'fault-sample7' },
]

async function checkOne(url, { method = 'GET', name }) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 25000)
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'smoke-netlify/1' },
    })
    clearTimeout(t)
    return { name, url, ok: res.ok, status: res.status }
  } catch (e) {
    clearTimeout(t)
    return { name, url, ok: false, status: 0, error: e.message }
  }
}

async function main() {
  const failures = []
  console.log(`Testing ${base}\n`)

  for (const r of routes) {
    const url = `${base}${r.path}`
    const result = await checkOne(url, r)
    const line = `${result.status} ${r.name} ${r.path}`
    if (!result.ok || result.status !== 200) {
      console.error(`FAIL ${line}`, result.error || '')
      failures.push(result)
    } else {
      console.log(`OK   ${line}`)
    }
  }

  for (const r of staticChecks) {
    const url = `${base}${r.path}`
    const result = await checkOne(url, r)
    const line = `${result.status} ${r.name} ${r.path}`
    if (!result.ok || (result.status !== 200 && result.status !== 304)) {
      console.error(`FAIL ${line}`, result.error || '')
      failures.push(result)
    } else {
      console.log(`OK   ${line}`)
    }
  }

  const vision = await fetch(`${base}/api/pv-fault-vision`).then((x) => x.json())
  if (!vision?.ok || !vision?.providers) {
    console.error('FAIL api-pv-vision-json shape', vision)
    failures.push({ name: 'api-pv-vision-json' })
  } else {
    console.log('OK   api-pv-vision-json providers', vision.providers)
  }

  if (failures.length) {
    console.error(`\nFAILED ${failures.length} check(s)`)
    process.exit(1)
  }
  console.log('\nALL_TESTS_PASSED')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
