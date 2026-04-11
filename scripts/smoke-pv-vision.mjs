/**
 * 部署后冒烟：检查页面与 GET /api/pv-fault-vision 可达
 * 用法: node scripts/smoke-pv-vision.mjs https://emoj.top
 */
const base = (process.argv[2] || process.env.SMOKE_URL || 'https://emoj.top').replace(/\/$/, '')

async function main() {
  const page = await fetch(`${base}/pv-vision`, { redirect: 'follow' })
  const api = await fetch(`${base}/api/pv-fault-vision`, { redirect: 'follow' })
  let apiJson = {}
  try {
    apiJson = await api.json()
  } catch {
    apiJson = {}
  }
  const ok = page.status === 200 && api.status === 200 && apiJson?.ok === true && apiJson?.providers
  console.log(JSON.stringify({ base, pageStatus: page.status, apiStatus: api.status, apiJson }, null, 2))
  if (!ok) {
    console.error('SMOKE_FAILED')
    process.exit(1)
  }
  console.log('SMOKE_OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
