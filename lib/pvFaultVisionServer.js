import {
  PV_VISION_JSON_INSTRUCTION,
  extractJsonObject,
  normalizePvFaultReport,
  normalizePanelOcclusionReport,
} from 'lib/pvFaultVisionSchema'

/**
 * 通用 OpenAI 兼容接口调用（Groq / Mistral / 智谱 / DashScope 等均复用）
 * @param {{ baseUrl, apiKey, models, providerTag, mimeType, base64NoPrefix,
 *           supportsJsonMode?, customPrompt?, normalizer? }} opts
 */
async function callOpenAICompatVision({
  baseUrl,
  apiKey,
  models,
  providerTag,
  mimeType,
  base64NoPrefix,
  supportsJsonMode = true,
  customPrompt,
  normalizer,
}) {
  const prompt = customPrompt
    ? `${customPrompt}\n\n只输出 JSON 对象本身，不要 markdown 代码块。`
    : `${PV_VISION_JSON_INSTRUCTION}\n\n只输出 JSON 对象本身，不要 markdown 代码块。`
  const normalize = normalizer || ((raw) => normalizePvFaultReport(raw, `${providerTag}`))
  const dataUrl = `data:${mimeType || 'image/png'};base64,${base64NoPrefix}`
  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`
  let lastErr = 'unknown'

  for (const model of models) {
    const buildBody = (useJsonMode) => {
      const body = {
        model,
        max_tokens: 2048,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }
      if (useJsonMode) body.response_format = { type: 'json_object' }
      return body
    }

    try {
      let res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(buildBody(supportsJsonMode)),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        if (supportsJsonMode && res.status === 400 && /response_format|json_object|not support/i.test(errText)) {
          res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(buildBody(false)),
          })
        } else {
          lastErr = `${providerTag}_http_${res.status}: ${errText.slice(0, 200)}`
          continue
        }
      }

      if (!res.ok) {
        const t = await res.text().catch(() => '')
        lastErr = `${providerTag}_http_${res.status}: ${t.slice(0, 200)}`
        continue
      }

      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content || ''
      const parsed = extractJsonObject(text)
      if (!parsed) {
        lastErr = `${providerTag}_parse`
        continue
      }
      return { ok: true, report: normalize(parsed) }
    } catch (e) {
      lastErr = e?.message || `${providerTag}_fetch`
    }
  }
  return { ok: false, error: lastErr }
}

// ─── Groq（Llama 4 Scout 多模态，免费额度） ────────────────────────

export function analyzeWithGroq(base64NoPrefix, mimeType, apiKey, opts = {}) {
  return callOpenAICompatVision({
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey,
    models: ['meta-llama/llama-4-scout-17b-16e-instruct'],
    providerTag: 'groq',
    mimeType,
    base64NoPrefix,
    supportsJsonMode: true,
    ...opts,
  })
}

// ─── Mistral（Pixtral 多模态） ─────────────────────────────────────

export function analyzeWithMistral(base64NoPrefix, mimeType, apiKey, opts = {}) {
  return callOpenAICompatVision({
    baseUrl: 'https://api.mistral.ai/v1',
    apiKey,
    models: ['pixtral-large-latest', 'pixtral-12b-2409'],
    providerTag: 'mistral',
    mimeType,
    base64NoPrefix,
    supportsJsonMode: true,
    ...opts,
  })
}

// ─── 智谱 GLM-4V（免费 flash + 高精度 plus） ───────────────────────

export function analyzeWithZhipuGLM(base64NoPrefix, mimeType, apiKey, opts = {}) {
  return callOpenAICompatVision({
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey,
    models: ['glm-4v-flash', 'glm-4v-plus'],
    providerTag: 'zhipu',
    mimeType,
    base64NoPrefix,
    supportsJsonMode: false,
    ...opts,
  })
}

// ─── 阿里通义千问 VL（DashScope OpenAI 兼容） ──────────────────────

export function analyzeWithDashScopeQwenVL(base64NoPrefix, mimeType, apiKey, opts = {}) {
  const baseUrl =
    process.env.DASHSCOPE_COMPAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  return callOpenAICompatVision({
    baseUrl,
    apiKey,
    models: ['qwen-vl-max', 'qwen-vl-plus'],
    providerTag: 'dashscope',
    mimeType,
    base64NoPrefix,
    supportsJsonMode: true,
    ...opts,
  })
}

// ─── Google Gemini（原生 API） ──────────────────────────────────────

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash']

export async function analyzeWithGemini(base64NoPrefix, mimeType, apiKey, opts = {}) {
  const { customPrompt, normalizer } = opts
  const prompt = customPrompt
    ? `${customPrompt}\n\n只输出 JSON，键名必须与说明一致。`
    : `${PV_VISION_JSON_INSTRUCTION}\n\n只输出 JSON，键名必须与说明一致。`
  const normalize = normalizer || ((raw) => normalizePvFaultReport(raw, 'gemini'))
  let lastErr = 'unknown'
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: mimeType || 'image/png', data: base64NoPrefix } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      })
      if (!res.ok) {
        lastErr = `gemini_http_${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`
        continue
      }
      const data = await res.json()
      const cand = data?.candidates?.[0]
      const fr = cand?.finishReason
      if (fr === 'SAFETY' || fr === 'BLOCKLIST' || fr === 'PROHIBITED_CONTENT') {
        lastErr = `gemini_blocked_${fr}`
        continue
      }
      const text =
        cand?.content?.parts?.map((p) => p.text).filter(Boolean).join('') ||
        cand?.content?.parts?.[0]?.text ||
        ''
      let parsed = extractJsonObject(text)
      if (!parsed && text && text.trim().startsWith('{')) {
        try { parsed = JSON.parse(text.trim()) } catch { parsed = null }
      }
      if (!parsed) { lastErr = 'gemini_parse'; continue }
      return { ok: true, report: normalize(parsed) }
    } catch (e) {
      lastErr = e?.message || 'gemini_fetch'
    }
  }
  return { ok: false, error: lastErr }
}

// ─── OpenAI GPT-4o（最后兜底） ─────────────────────────────────────

export async function analyzeWithOpenAI(base64NoPrefix, mimeType, apiKey, opts = {}) {
  const { customPrompt, normalizer } = opts
  const prompt = customPrompt
    ? `${customPrompt}\n\n只输出 JSON 对象本身。`
    : `${PV_VISION_JSON_INSTRUCTION}\n\n只输出 JSON 对象本身。`
  const normalize = normalizer || ((raw) => normalizePvFaultReport(raw, 'openai:gpt-4o'))
  const dataUrl = `data:${mimeType || 'image/png'};base64,${base64NoPrefix}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2048,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
            ],
          },
        ],
      }),
    })
    if (!res.ok) {
      return { ok: false, error: `openai_http_${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}` }
    }
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ''
    const parsed = extractJsonObject(text)
    if (!parsed) return { ok: false, error: 'openai_parse' }
    return { ok: true, report: normalize(parsed) }
  } catch (e) {
    return { ok: false, error: e?.message || 'openai_fetch' }
  }
}
