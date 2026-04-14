import { NextResponse } from 'next/server'
import {
  analyzeWithGroq,
  analyzeWithMistral,
  analyzeWithZhipuGLM,
  analyzeWithDashScopeQwenVL,
  analyzeWithGemini,
  analyzeWithOpenAI,
} from 'lib/pvFaultVisionServer'
import { PV_PANEL_OCCLUSION_INSTRUCTION, normalizePanelOcclusionReport } from 'lib/pvFaultVisionSchema'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_BASE64_LENGTH = 14 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

function stripDataUrl(input) {
  if (typeof input !== 'string') return { mime: null, b64: null }
  const m = input.match(/^data:([^;]+);base64,(.+)$/i)
  if (m) {
    const mime = m[1].toLowerCase().split(';')[0].trim()
    return { mime: ALLOWED_MIME.has(mime) ? mime : null, b64: m[2].replace(/\s/g, '') }
  }
  return { mime: null, b64: input.replace(/\s/g, '') }
}

function resolveKey(names) {
  for (const n of names) {
    const v = process.env[n]
    if (v) return v
  }
  return null
}

/**
 * Provider chain definition — order determines fallback priority.
 * Each entry: { id, label, envNames[], analyze(b64, mime, key) }
 */
const PROVIDER_CHAIN = [
  {
    id: 'groq',
    label: 'Groq Llama 4 Scout',
    envNames: ['GROQ_API_KEY'],
    analyze: analyzeWithGroq,
  },
  {
    id: 'mistral',
    label: 'Mistral Pixtral',
    envNames: ['MISTRAL_API_KEY'],
    analyze: analyzeWithMistral,
  },
  {
    id: 'zhipu',
    label: '智谱 GLM-4V',
    envNames: ['GLM_API_KEY', 'ZHIPU_API_KEY'],
    analyze: analyzeWithZhipuGLM,
  },
  {
    id: 'dashscope',
    label: '阿里通义 Qwen-VL',
    envNames: ['DASHSCOPE_API_KEY', 'QWEN_API_KEY', 'ALIYUN_DASHSCOPE_API_KEY'],
    analyze: analyzeWithDashScopeQwenVL,
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    envNames: ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'GOOGLE_AI_API_KEY'],
    analyze: analyzeWithGemini,
  },
  {
    id: 'openai',
    label: 'OpenAI GPT-4o',
    envNames: ['OPENAI_API_KEY'],
    analyze: analyzeWithOpenAI,
  },
]

export async function GET() {
  const providers = {}
  for (const p of PROVIDER_CHAIN) {
    providers[p.id] = !!resolveKey(p.envNames)
  }
  const configured = PROVIDER_CHAIN.filter((p) => providers[p.id]).map((p) => p.label)
  return NextResponse.json({
    ok: true,
    providers,
    chain: PROVIDER_CHAIN.map((p) => p.label).join(' → '),
    hint: `自动切换链路：${configured.join(' → ') || '（未配置任何提供方）'}`,
  })
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null)
    const imageBase64 = body?.imageBase64
    let mimeType = typeof body?.mimeType === 'string' ? body.mimeType.toLowerCase() : null

    if (typeof imageBase64 !== 'string' || imageBase64.length < 80) {
      return NextResponse.json(
        { ok: false, code: 'INVALID_BODY', message: '请提供 imageBase64（建议 data URL 或纯 base64）' },
        { status: 400 }
      )
    }

    if (imageBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { ok: false, code: 'PAYLOAD_TOO_LARGE', message: '图片过大，请在浏览器端压缩后再试' },
        { status: 413 }
      )
    }

    const stripped = stripDataUrl(imageBase64)
    const b64 = stripped.b64
    if (!b64) {
      return NextResponse.json({ ok: false, code: 'INVALID_BASE64', message: '无效的 base64' }, { status: 400 })
    }
    if (stripped.mime) mimeType = stripped.mime
    if (!mimeType || !ALLOWED_MIME.has(mimeType)) mimeType = 'image/png'

    const available = PROVIDER_CHAIN.map((p) => ({ ...p, key: resolveKey(p.envNames) })).filter((p) => p.key)

    if (!available.length) {
      return NextResponse.json(
        {
          ok: false,
          code: 'NO_PROVIDER',
          message: '未配置任何 Vision API 密钥，将使用浏览器端降级分析',
        },
        { status: 200 }
      )
    }

    // Build extra opts for panel_occlusion mode
    const analyzeOpts = body?.mode === 'panel_occlusion'
      ? { customPrompt: PV_PANEL_OCCLUSION_INSTRUCTION, normalizer: normalizePanelOcclusionReport }
      : {}

    const tried = []
    for (const p of available) {
      const result = await p.analyze(b64, mimeType, p.key, analyzeOpts)
      if (result.ok) {
        return NextResponse.json({
          ok: true,
          report: result.report,
          usedProvider: p.id,
          usedLabel: p.label,
          fallbackFrom: tried.length ? tried.map((t) => t.split(':')[0]).join(',') : null,
        })
      }
      tried.push(`${p.id}:${result.error}`)
    }

    return NextResponse.json({
      ok: false,
      code: 'VISION_FAILED',
      message: `全部 ${available.length} 个提供方均未返回有效结果`,
      tried: tried.slice(-6),
    })
  } catch (e) {
    console.error('pv-fault-vision', e)
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: e?.message || '服务器错误' },
      { status: 500 }
    )
  }
}
