/**
 * 历史数据页：与 0.8kWp（4×200W）天津电站、投运约 1 个月一致；单位 kWh / 元 / kg CO₂
 */

import {
  getWeekDailyKwh,
  getMonthWeeklyKwh,
  getTypicalYearMonthlyKwh,
  getTypicalDailyKwhSpring,
  sum,
  TIANJIN_PLANT,
} from './tianjinPlantAnalyticsModel'

function round2(n) {
  return Math.round(n * 100) / 100
}

const PRICE_PER_KWH = 0.52
/** 电网排放因子近似 kg CO₂ / kWh */
const CO2_KG_PER_KWH = 0.58

function storageKwhFromSolar(solarKwh) {
  return round2(solarKwh * 0.34)
}

export function buildHistoryPowerTrend(period) {
  if (period === 'week') {
    const solar = getWeekDailyKwh()
    const storage = solar.map(storageKwhFromSolar)
    return {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      solar,
      storage,
      unit: 'kWh',
      note: '近 7 日演示序列（天津春季典型波动）。',
    }
  }
  if (period === 'month') {
    const solar = getMonthWeeklyKwh()
    const storage = solar.map(storageKwhFromSolar)
    return {
      xAxis: ['第1周', '第2周', '第3周', '第4周'],
      solar,
      storage,
      unit: 'kWh',
      note: '并网后近四周，对应投运约 1 个月。',
    }
  }
  const solar = getTypicalYearMonthlyKwh()
  const storage = solar.map((s) => round2(s * 0.32))
  return {
    xAxis: solar.map((_, i) => `${i + 1}月`),
    solar,
    storage,
    unit: 'kWh',
    note: '同功率天津地区「典型年」各月估算，非本站多年实测（电站未满年）。',
  }
}

export function buildHistoryRevenueTrend(period) {
  const p = buildHistoryPowerTrend(period)
  return {
    ...p,
    solar: p.solar.map((k) => round2(k * PRICE_PER_KWH)),
    storage: p.storage.map((k) => round2(k * PRICE_PER_KWH)),
    unit: '元',
  }
}

export function buildHistoryCo2Trend(period) {
  const p = buildHistoryPowerTrend(period)
  return {
    ...p,
    solar: p.solar.map((k) => round2(k * CO2_KG_PER_KWH)),
    storage: p.storage.map((k) => round2(k * CO2_KG_PER_KWH)),
    unit: 'kg',
  }
}

export function getHistoryTrendPack(dataType, period) {
  if (dataType === 'power') return buildHistoryPowerTrend(period)
  if (dataType === 'revenue') return buildHistoryRevenueTrend(period)
  return buildHistoryCo2Trend(period)
}

/** 顶部四宫格：按实际并网约 30 日量级 */
export function getHistoryOverviewStats() {
  const weekDaily = getWeekDailyKwh()
  const maxDay = Math.max(...weekDaily)
  const monthTotal = round2(sum(getMonthWeeklyKwh()))
  const storageMonth = round2(monthTotal * 0.34)
  const grandTotal = round2(monthTotal + storageMonth)
  const revenueTotal = round2(grandTotal * PRICE_PER_KWH)
  return [
    { label: '近7日最高日发电', value: `${maxDay} kWh`, date: '演示序列峰值' },
    { label: '并网首月光伏累计', value: `${monthTotal} kWh`, date: '约30日' },
    { label: '并网以来总电量', value: `${grandTotal} kWh`, date: '光伏+储能口径' },
    { label: '累计估算收益', value: `${revenueTotal} 元`, date: `按 ${PRICE_PER_KWH} 元/kWh` },
  ]
}

/** 环比/同比演示：小幅百分比，避免巨电站量级 */
export function getHistoryComparisonSeries() {
  return {
    xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    yoy: [null, 3.2, 5.1, -2.4, 4.8, 6.2, 5.5, 4.1, 2.8, -1.2, 2.0, 1.5],
    mom: [2.1, 1.8, -0.9, 2.4, 3.1, 2.5, 1.2, 0.8, -2.0, 1.1, 0.6, 0.9],
    note: '演示用小幅波动（0.8kWp 微电站，非上市级统计口径）。',
  }
}

const DAY_MULTS = [
  0.91, 0.94, 1.02, 0.88, 1.06, 0.97, 1.04, 0.93, 1.01, 0.89, 1.05, 0.96, 0.99, 1.03,
]

/** 详细表：14 天，无风电列 */
export function getHistoryDetailRows() {
  const base = getTypicalDailyKwhSpring()
  const rows = []
  for (let i = 0; i < 14; i++) {
    const solar = round2(base * DAY_MULTS[i])
    const storage = storageKwhFromSolar(solar)
    const total = round2(solar + storage)
    const revenue = Math.round(solar * PRICE_PER_KWH * 100) / 100
    let status = 'normal'
    if (solar >= base * 1.04) status = 'excellent'
    else if (solar < base * 0.9) status = 'warning'
    const d = new Date(Date.UTC(2026, 3, 11 - i))
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
    rows.push({ date: dateStr, solar, storage, total, revenue, status })
  }
  return rows
}

export { TIANJIN_PLANT, PRICE_PER_KWH, CO2_KG_PER_KWH }
