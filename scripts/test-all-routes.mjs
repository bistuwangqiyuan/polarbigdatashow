const BASE = process.argv[2] || 'http://localhost:3001'

const routes = [
  '/',
  '/about',
  '/alerts',
  '/analytics',
  '/devices',
  '/gallery',
  '/history',
  '/pv-vision',
  '/settings',
  '/api/pv-fault-vision',
]

let failed = 0

for (const path of routes) {
  try {
    const res = await fetch(`${BASE}${path}`)
    const ok = res.status >= 200 && res.status < 400
    console.log(`${ok ? '✅' : '❌'} ${res.status} ${path}`)
    if (!ok) failed++
  } catch (e) {
    console.log(`❌ ERR ${path}: ${e.message}`)
    failed++
  }
}

console.log(`\n${failed ? `${failed} route(s) failed` : 'All routes passed'}`)
process.exitCode = failed ? 1 : 0
