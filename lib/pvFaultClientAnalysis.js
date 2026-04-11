import { normalizePvFaultReport } from 'lib/pvFaultVisionSchema'

/**
 * 浏览器端离线分析：基于缩略图像素统计的粗判（无云端 Vision 时的降级）。
 * @param {string} dataUrl - data:image/...;base64,...
 * @returns {Promise<ReturnType<normalizePvFaultReport>>}
 */
export function runClientSidePvHeuristic(dataUrl) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image')) {
      reject(new Error('invalid_image'))
      return
    }
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const maxSide = 320
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
        const w = Math.max(1, Math.round(img.naturalWidth * scale))
        const h = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(fallbackUnknownReport())
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const { data } = ctx.getImageData(0, 0, w, h)
        let sum = 0
        let sumSq = 0
        let n = 0
        let dark = 0
        const step = 3
        for (let y = 0; y < h; y += step) {
          for (let x = 0; x < w; x += step) {
            const i = (y * w + x) * 4
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const lum = 0.299 * r + 0.587 * g + 0.114 * b
            sum += lum
            sumSq += lum * lum
            n++
            if (lum < 55) dark++
          }
        }
        const mean = sum / n
        const variance = Math.max(0, sumSq / n - mean * mean)
        const darkRatio = dark / n

        let raw
        if (darkRatio > 0.35) {
          raw = {
            faultTypes: [
              { code: 'shadow_or_occlusion', nameZh: '阴影或重度遮挡（像素启发式）', confidence: 0.55 },
            ],
            severity: 'high',
            severityScore: 0.72,
            maintenanceSuggestions: [
              '排查周边遮挡物与组串失配，必要时修剪植被或调整支架。',
              '建议结合现场 IV 曲线或无人机巡检复核。',
            ],
            annotations: [
              {
                labelZh: '偏暗区域（启发式）',
                box: { x: 0.08, y: 0.1, w: 0.84, h: 0.75 },
                severity: 'high',
              },
            ],
            summaryZh:
              '离线分析：图像整体偏暗像素占比较高，可能与阴影、污渍或拍摄曝光有关，建议上传更清晰照片或使用云端 Vision 复核。',
          }
        } else if (mean > 70 && mean < 175 && variance < 900) {
          raw = {
            faultTypes: [{ code: 'dust', nameZh: '可能蒙尘或透光下降（像素启发式）', confidence: 0.48 }],
            severity: 'medium',
            severityScore: 0.55,
            maintenanceSuggestions: [
              '建议安排组件表面清洁，并记录清洗前后发电对比。',
              '若近处有扬尘源，可适当提高清洗频次。',
            ],
            annotations: [
              {
                labelZh: '表层灰雾感区域（启发式）',
                box: { x: 0.12, y: 0.18, w: 0.76, h: 0.58 },
                severity: 'medium',
              },
            ],
            summaryZh:
              '离线分析：亮度中等且对比度偏低，常见于均匀薄尘或雾化透光；结论仅供参考，请以云端识别或人工巡检为准。',
          }
        } else if (variance > 2800) {
          raw = {
            faultTypes: [{ code: 'uneven_soil', nameZh: '局部污渍或斑块（像素启发式）', confidence: 0.42 }],
            severity: 'medium',
            severityScore: 0.5,
            maintenanceSuggestions: ['对高对比斑块区域做近距离拍照存档，并安排定点清洗或更换受损组件。'],
            annotations: [
              {
                labelZh: '高对比斑块（启发式）',
                box: { x: 0.2, y: 0.22, w: 0.55, h: 0.48 },
                severity: 'medium',
              },
            ],
            summaryZh:
              '离线分析：画面亮度起伏较大，可能存在局部污渍、裂纹反光或遮挡边界；建议启用云端 Vision 精检。',
          }
        } else {
          raw = {
            faultTypes: [],
            severity: 'none',
            severityScore: 0.22,
            maintenanceSuggestions: ['保持例行巡检；若发电量异常可补充近景照片后再检。'],
            annotations: [],
            summaryZh:
              '离线分析：未触发明显异常启发式规则，组件表面可能较清洁或图像不足以判断；建议使用云端识别确认。',
          }
        }
        resolve(normalizePvFaultReport(raw, 'client-heuristic'))
      } catch {
        resolve(fallbackUnknownReport())
      }
    }
    img.onerror = () => reject(new Error('image_load_failed'))
    img.src = dataUrl
  })
}

function fallbackUnknownReport() {
  return normalizePvFaultReport(
    {
      faultTypes: [{ code: 'unknown', nameZh: '无法离线判定', confidence: 0.2 }],
      severity: 'low',
      severityScore: 0.3,
      maintenanceSuggestions: [
        '请上传更清晰的光伏组件正面照片，或配置 DASHSCOPE_API_KEY（通义千问 VL）/ GEMINI_API_KEY / OPENAI_API_KEY 启用云端 Vision。',
      ],
      annotations: [],
      summaryZh: '浏览器端分析失败或图像无效。',
    },
    'client-heuristic'
  )
}

/** 演示用：蒙尘场景结构化结果（无 API 时全流程展示） */
export function getDemoScriptedDustReport() {
  return normalizePvFaultReport(
    {
      faultTypes: [{ code: 'dust', nameZh: '蒙尘', confidence: 0.88 }],
      severity: 'medium',
      severityScore: 0.63,
      maintenanceSuggestions: [
        '建议在 7–14 日内安排清洗（水洗或专用清洗车），避开正午高温时段。',
        '清洗后对比同条件日发电量，记录灰损回收比例。',
        '若厂区扬尘大，可缩短清洗周期或加装防尘网。',
      ],
      annotations: [
        {
          labelZh: '表层均匀薄尘',
          box: { x: 0.1, y: 0.14, w: 0.78, h: 0.62 },
          severity: 'medium',
        },
        {
          labelZh: '边框积灰带',
          box: { x: 0.06, y: 0.72, w: 0.88, h: 0.18 },
          severity: 'low',
        },
      ],
      summaryZh:
        '演示结论：组件表面可见均匀薄尘，透光率下降导致出力潜在损失；清洗后通常可明显恢复。以下为演示框位，真实部署以 Vision API 返回为准。',
    },
    'demo-scripted'
  )
}
