import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = process.argv[2] || 'https://emoj.top'

async function main() {
  console.log(`Testing PV Vision API at ${BASE}\n`)

  console.log('=== GET /api/pv-fault-vision ===')
  const getRes = await fetch(`${BASE}/api/pv-fault-vision`)
  const getJson = await getRes.json()
  console.log('Status:', getRes.status)
  const configured = Object.entries(getJson.providers || {})
    .filter(([, v]) => v)
    .map(([k]) => k)
  console.log('Configured providers:', configured.join(', '))
  console.log()

  console.log('=== POST /api/pv-fault-vision (sample7.png) ===')
  const imgPath = resolve('public/image/fault-gallery/sample7.png')
  let imgBuf
  try {
    imgBuf = readFileSync(imgPath)
  } catch {
    console.log('Could not read sample image, skipping POST test')
    return
  }
  const b64 = `data:image/png;base64,${imgBuf.toString('base64')}`
  console.log(`Image size: ${(b64.length / 1024).toFixed(0)} KB (base64)`)

  const start = Date.now()
  const postRes = await fetch(`${BASE}/api/pv-fault-vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: b64, mimeType: 'image/png' }),
  })
  const elapsed = Date.now() - start
  const postJson = await postRes.json()
  console.log(`Status: ${postRes.status} (${elapsed}ms)`)
  console.log('ok:', postJson.ok)

  if (postJson.ok && postJson.report) {
    const r = postJson.report
    console.log('Provider:', postJson.usedProvider, `(${postJson.usedLabel || r.provider || ''})`)
    if (postJson.fallbackFrom) console.log('Fallback from:', postJson.fallbackFrom)
    console.log('Severity:', r.severity, `(score: ${r.severityScore})`)
    console.log('Fault types:', (r.faultTypes || []).map((f) => `${f.nameZh}(${f.code})`).join(', ') || 'none')
    console.log('Annotations:', (r.annotations || []).length)
    console.log('Summary:', r.summaryZh || '-')
    console.log('\n=== RESULT: PASSED ===')
  } else {
    console.log('Error:', postJson.code, postJson.message)
    if (postJson.tried) console.log('Tried:', postJson.tried.join(' | '))
    console.log('\n=== RESULT: FAILED ===')
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exitCode = 1
})
