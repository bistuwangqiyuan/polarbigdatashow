/**
 * 天津（Asia/Shanghai）光伏辐照与功率模拟：结合本地时刻与天气类型，使输出功率符合常识。
 * 额定按单阵列 200W（与设备页一致）。
 */

export const TIANJIN_WEATHER = {
  CLEAR: 'clear',
  PARTLY_CLOUDY: 'partly_cloudy',
  CLOUDY: 'cloudy',
  RAIN: 'rain',
  HAZE: 'haze',
}

/** 中文展示用 */
export const WEATHER_LABELS = {
  clear: '晴',
  partly_cloudy: '多云',
  cloudy: '阴',
  rain: '雨',
  haze: '雾霾',
}

/** 天气对辐照的平均乘数（相对晴空日曲线） */
const WEATHER_IRRADIANCE_MEAN = {
  clear: 0.97,
  partly_cloudy: 0.58,
  cloudy: 0.24,
  rain: 0.055,
  haze: 0.44,
}

/**
 * 天津本地时刻（小数小时 0–23.x）
 * 中国标准时间 = UTC+8、无夏令时。用 UTC 偏移计算，避免部分环境下 Intl 将「午夜」误解析为 12（正午），
 * 从而导致夜间仍显示上百瓦功率。
 */
export function getTianjinDecimalHour(date = new Date()) {
  const sh = new Date(date.getTime() + 8 * 3600000)
  return sh.getUTCHours() + sh.getUTCMinutes() / 60 + sh.getUTCSeconds() / 3600
}

/**
 * 晴空下仅由太阳高度决定的相对辐照 0..1（天津滨海春季近似：无有效日照时接近 0）
 */
export function getClearSkyDayFactor(decimalHour) {
  if (decimalHour < 5.25 || decimalHour > 19.35) return 0
  const peak = 12.2
  const halfWidth = 6.15
  const x = ((decimalHour - peak) / halfWidth) * (Math.PI / 2)
  return Math.max(0, Math.cos(x))
}

/**
 * 演示用：按权重随机天气（偏晴天，偶发雨/霾）
 */
export function sampleTianjinWeatherForDemo() {
  const r = Math.random()
  if (r < 0.36) return TIANJIN_WEATHER.CLEAR
  if (r < 0.62) return TIANJIN_WEATHER.PARTLY_CLOUDY
  if (r < 0.77) return TIANJIN_WEATHER.CLOUDY
  if (r < 0.87) return TIANJIN_WEATHER.RAIN
  return TIANJIN_WEATHER.HAZE
}

/**
 * Open-Meteo WMO weathercode → 本站天气键（天津滨海泰达约 39.03°N, 117.71°E）
 * @see https://open-meteo.com/en/docs
 */
export function openMeteoCodeToWeatherKey(code) {
  if (code === 0) return TIANJIN_WEATHER.CLEAR
  if (code === 1 || code === 2) return TIANJIN_WEATHER.PARTLY_CLOUDY
  if (code === 3) return TIANJIN_WEATHER.CLOUDY
  if (code === 45 || code === 48) return TIANJIN_WEATHER.HAZE
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return TIANJIN_WEATHER.RAIN
  if (code >= 71 && code <= 86) return TIANJIN_WEATHER.CLOUDY
  return TIANJIN_WEATHER.PARTLY_CLOUDY
}

/**
 * 综合辐照因子 ∈ [0, ~1]
 * @param {number} jitter01 - 建议每路阵列用不同的小抖动，如 hash(id)*0.02
 */
export function getSolarIrradianceFactor(decimalHour, weatherKey, jitter01 = 0) {
  const day = getClearSkyDayFactor(decimalHour)
  if (day <= 0) return 0
  const mean = WEATHER_IRRADIANCE_MEAN[weatherKey] ?? WEATHER_IRRADIANCE_MEAN.partly_cloudy
  const weatherJitter = 1 + (Math.random() - 0.5) * 0.14
  return Math.min(1, Math.max(0, day * mean * weatherJitter * (1 + jitter01)))
}

/**
 * 单块 200W 阵列输出功率（W）；夜间/阴雨接近 0
 * @param {object} opts
 * @param {number} opts.ratedW - 额定功率 W
 * @param {number} opts.arrayJitter - 阵列间微小差异，如 -0.02..0.02
 */
export function computeArrayOutputW(decimalHour, weatherKey, ratedW = 200, arrayJitter = 0) {
  const irr = getSolarIrradianceFactor(decimalHour, weatherKey, arrayJitter)
  if (irr <= 0) {
    return 0
  }
  const panelEfficiency = 0.78 + Math.random() * 0.1
  const raw = ratedW * irr * panelEfficiency
  return Math.max(0, Math.round(raw + (Math.random() - 0.5) * 6))
}

/** 4×200W 电站合计功率（W），无随机；用于大屏等与设备页同量级对齐 */
export function estimateTianjinPlant800wPowerWDeterministic(date = new Date()) {
  const h = getTianjinDecimalHour(date)
  const day = getClearSkyDayFactor(h)
  if (day <= 0) return 0
  const meanIrr = 0.58
  const dcToAc = 0.84
  return Math.round(800 * day * meanIrr * dcToAc)
}
