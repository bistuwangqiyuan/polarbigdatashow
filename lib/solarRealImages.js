/** 天津 4×200W 子阵：单块组件实拍（solarreal1–4） */
export const SOLAR_REAL_PANEL_BY_ARRAY_ID = {
  1: '/image/solarreal1.png',
  2: '/image/solarreal2.png',
  3: '/image/solarreal3.png',
  4: '/image/solarreal4.png',
}

/** 四块组件并排现场图（横幅/概览） */
export const SOLAR_REAL_FIELD_IMAGE = '/image/solarreal.jpg'

export function solarRealPanelSrc(arrayId) {
  const n = Number(arrayId)
  return SOLAR_REAL_PANEL_BY_ARRAY_ID[n] ?? '/image/solar1.png'
}
