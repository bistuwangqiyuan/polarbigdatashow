/**
 * 浏览器端：拉取图片并转为 Data URL、压缩长边以降低 Vision API 体积。
 */

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('read_failed'))
    r.readAsDataURL(blob)
  })
}

export async function fetchImageAsDataUrl(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch_${res.status}`)
  const blob = await res.blob()
  return blobToDataUrl(blob)
}

/**
 * @param {string} dataUrl
 * @param {number} maxSide
 * @param {string} outMime 'image/jpeg' | 'image/webp' | 'image/png'
 * @param {number} quality 0-1 for jpeg/webp
 */
export async function compressDataUrl(dataUrl, maxSide = 1280, outMime = 'image/jpeg', quality = 0.88) {
  if (typeof window === 'undefined') return dataUrl
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        let { width, height } = img
        const scale = Math.min(1, maxSide / Math.max(width, height))
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const out = canvas.toDataURL(outMime, quality)
        resolve(out)
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => reject(new Error('compress_load_failed'))
    img.src = dataUrl
  })
}
