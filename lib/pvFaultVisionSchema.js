/**
 * 光伏故障 Vision 结构化输出约定（API 与客户端降级共用字段名）
 * @typedef {Object} PvFaultBox
 * @property {number} x 左上角 x，相对整图宽度 0–1
 * @property {number} y 左上角 y，相对整图高度 0–1
 * @property {number} w 宽度，相对整图宽度 0–1
 * @property {number} h 高度，相对整图高度 0–1
 *
 * @typedef {Object} PvFaultAnnotation
 * @property {string} labelZh
 * @property {PvFaultBox} box
 * @property {'low'|'medium'|'high'} [severity]
 *
 * @typedef {Object} PvFaultTypeItem
 * @property {string} code
 * @property {string} nameZh
 * @property {number} [confidence] 0–1
 */

export const PV_VISION_JSON_INSTRUCTION = `你是光伏电站组件表面视觉巡检专家。请仅根据图像判断可见的表面类缺陷（蒙尘、污渍、鸟粪、植被/异物遮挡、明显裂纹碎片、严重热斑迹象、积雪等）或判断为正常。
必须只输出一个 JSON 对象（不要 markdown 代码块），结构严格如下：
{
  "faultTypes": [ { "code": "dust", "nameZh": "蒙尘", "confidence": 0.82 } ],
  "severity": "none" | "low" | "medium" | "high",
  "severityScore": 0.65,
  "maintenanceSuggestions": [ "建议7日内安排组件清洗或机器人除尘", "..." ],
  "annotations": [
    { "labelZh": "轻度积灰区域", "box": { "x": 0.1, "y": 0.15, "w": 0.6, "h": 0.45 }, "severity": "low" }
  ],
  "summaryZh": "一两句话中文总结"
}
规则：
- box 的 x,y,w,h 均为相对整图宽高的 0–1 浮点数；若无可见异常则 annotations 为 []。
- faultTypes 可为空数组表示未见明确故障。
- severity 为 none 时表示基本正常或仅轻微可忽略。
- code 使用简短英文 snake_case，如 dust, soil, bird_droppings, vegetation_shade, crack, hot_spot, snow, shadow, unknown。`

function clamp01(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

export function normalizePvFaultReport(raw, provider) {
  const o = raw && typeof raw === 'object' ? raw : {}
  const faultTypes = Array.isArray(o.faultTypes)
    ? o.faultTypes
        .filter((t) => t && typeof t === 'object')
        .map((t) => ({
          code: String(t.code || 'unknown').slice(0, 64),
          nameZh: String(t.nameZh || t.name || '未命名').slice(0, 80),
          confidence:
            typeof t.confidence === 'number' && !Number.isNaN(t.confidence)
              ? clamp01(t.confidence)
              : undefined,
        }))
    : []
  const severityScore =
    typeof o.severityScore === 'number' && !Number.isNaN(o.severityScore) ? clamp01(o.severityScore) : 0.5
  const maintenanceSuggestions = Array.isArray(o.maintenanceSuggestions)
    ? o.maintenanceSuggestions.map((s) => String(s).slice(0, 300)).filter(Boolean).slice(0, 12)
    : []
  const annotations = Array.isArray(o.annotations)
    ? o.annotations
        .filter((a) => a && typeof a === 'object' && a.box && typeof a.box === 'object')
        .map((a) => {
          const b = a.box
          const x = clamp01(Number(b.x))
          const y = clamp01(Number(b.y))
          let w = clamp01(Number(b.w))
          let h = clamp01(Number(b.h))
          if (x + w > 1) w = Math.max(0, 1 - x)
          if (y + h > 1) h = Math.max(0, 1 - y)
          const as = ['low', 'medium', 'high'].includes(a.severity) ? a.severity : undefined
          return {
            labelZh: String(a.labelZh || a.label || '异常区域').slice(0, 80),
            box: { x, y, w, h },
            severity: as,
          }
        })
        .slice(0, 20)
    : []
  let sev = ['none', 'low', 'medium', 'high'].includes(o.severity) ? o.severity : null
  if (!sev) {
    sev = faultTypes.length === 0 && annotations.length === 0 ? 'none' : 'medium'
  }
  return {
    provider,
    faultTypes,
    severity: sev,
    severityScore,
    maintenanceSuggestions,
    annotations,
    summaryZh: String(o.summaryZh || o.summary || '').slice(0, 800),
  }
}

export function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  const body = fence ? fence[1].trim() : trimmed
  try {
    return JSON.parse(body)
  } catch {
    const start = body.indexOf('{')
    const end = body.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(body.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}
