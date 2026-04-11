/**
 * 天津滨海 0.8kWp 电站（4×200W）分析数据模型，与设备管理页一致；图表数据为确定性、可复现。
 * 春季典型辐照偏「多云」；「本年」曲线为同站点满年典型月发电量参考（标注说明）。
 */

import { getClearSkyDayFactor } from './tianjinSolarSimulation'

export const TIANJIN_PLANT = {
  siteLabel: '天津滨海泰达科技发展中心',
  panelCount: 4,
  panelRatedW: 200,
  /** 直流侧组件峰值合计 kW */
  peakKwDc: 0.8,
  /** 逆变器侧可达峰值（略低于组件标称） */
  peakKwAc: 0.76,
  /** 投运约 1 个月（展示用） */
  monthsInOperation: 1,
}

/** 春季典型天气对辐照的平均折减（偏多云，与设备页演示一致量级） */
const SPRING_IRRADIANCE_MEAN = 0.58

/** 组件→计量点综合效率（含逆变器、温度、失配等） */
const DC_TO_METER_EFF = 0.84

export function round2(n) {
  return Math.round(n * 100) / 100
}

/**
 * 典型春季日：逐小时发电量 kWh（天津曲线 × 天气折减 × 0.8kWp）
 */
export function getTypicalSpringHourlyKwh() {
  const { peakKwDc } = TIANJIN_PLANT
  return Array.from({ length: 24 }, (_, hour) => {
    const irr = getClearSkyDayFactor(hour + 0.5) * SPRING_IRRADIANCE_MEAN
    if (irr <= 0) return 0
    return round2(peakKwDc * irr * DC_TO_METER_EFF)
  })
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

/** 典型日总发电量 kWh */
export function getTypicalDailyKwhSpring() {
  return round2(sum(getTypicalSpringHourlyKwh()))
}

/**
 * 各小时「归一化到额定」的加权效率展示用 %（逆变器+失配，夜间为 0）
 */
export function getHourlyEfficiencyPercent() {
  const hourly = getTypicalSpringHourlyKwh()
  const peak = TIANJIN_PLANT.peakKwDc * 1000
  return hourly.map((kwh) => {
    if (kwh <= 0) return 0
    const implied = (kwh * 1000) / peak
    const base = 72 + implied * 14
    return Math.round(Math.min(88, Math.max(74, base)))
  })
}

/** 容量因子 = 时段发电量 / (时段小时 × 峰值功率 kW) */
export function capacityFactor(kwhPeriod, hours) {
  const denom = hours * TIANJIN_PLANT.peakKwDc
  if (denom <= 0) return 0
  return round2(kwhPeriod / denom)
}

const WEEKDAY_MULT = [0.92, 1.06, 0.87, 1.09, 0.94, 1.03, 0.98]

/** 近 7 日逐日发电量 kWh（在典型日基础上小幅波动） */
export function getWeekDailyKwh() {
  const base = getTypicalDailyKwhSpring()
  return WEEKDAY_MULT.map((m) => round2(base * m))
}

/** 近 4 周每周总发电量 kWh（约一个月） */
export function getMonthWeeklyKwh() {
  const weekAvg = round2(sum(getWeekDailyKwh()))
  const mults = [1.04, 0.91, 1.08, 0.95]
  return mults.map((m) => round2(weekAvg * m))
}

/**
 * 同功率天津地区「若满年运行」典型月发电量 kWh（12 个月），总和约 0.95–1.05 MWh 量级
 */
export function getTypicalYearMonthlyKwh() {
  return [50, 62, 82, 98, 112, 116, 118, 112, 94, 78, 58, 46].map(round2)
}

function arrayJitter(id) {
  return 1 + (id - 2.5) * 0.04
}

/** 热力图：4 块板相对贡献 %（行=阵列，列=时间维） */
export function getHeatmapDay() {
  const slots = [0, 4, 8, 12, 16, 20]
  const yAxis = ['光伏阵列-01', '光伏阵列-02', '光伏阵列-03', '光伏阵列-04']
  const data = []
  slots.forEach((hour, xi) => {
    const kwh = getTypicalSpringHourlyKwh()[hour] || 0
    const base = kwh > 0 ? 55 + (kwh / 0.42) * 38 : 0
    yAxis.forEach((_, yi) => {
      const v = kwh <= 0 ? 2 : Math.round(Math.min(100, base * arrayJitter(yi)))
      data.push([xi, yi, v])
    })
  })
  return { xAxis: slots.map((h) => `${String(h).padStart(2, '0')}:00`), yAxis, data }
}

export function getHeatmapWeek() {
  const daily = getWeekDailyKwh()
  const xAxis = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const yAxis = ['光伏阵列-01', '光伏阵列-02', '光伏阵列-03', '光伏阵列-04']
  const data = []
  daily.forEach((kwh, xi) => {
    yAxis.forEach((_, yi) => {
      const base = 42 + (kwh / 3.2) * 52
      const v = Math.round(Math.min(100, base * arrayJitter(yi)))
      data.push([xi, yi, v])
    })
  })
  return { xAxis, yAxis, data }
}

export function getHeatmapMonth() {
  const weeks = getMonthWeeklyKwh()
  const xAxis = ['第1周', '第2周', '第3周', '第4周']
  const yAxis = ['光伏阵列-01', '光伏阵列-02', '光伏阵列-03', '光伏阵列-04']
  const data = []
  weeks.forEach((kwh, xi) => {
    yAxis.forEach((_, yi) => {
      const base = 45 + (kwh / 22) * 48
      const v = Math.round(Math.min(100, base * arrayJitter(yi)))
      data.push([xi, yi, v])
    })
  })
  return { xAxis, yAxis, data }
}

export function getHeatmapYear() {
  const months = getTypicalYearMonthlyKwh()
  const xAxis = months.map((_, i) => `${i + 1}月`)
  const yAxis = ['光伏阵列-01', '光伏阵列-02', '光伏阵列-03', '光伏阵列-04']
  const data = []
  months.forEach((kwh, xi) => {
    yAxis.forEach((_, yi) => {
      const base = 38 + (kwh / 120) * 55
      const v = Math.round(Math.min(100, base * arrayJitter(yi)))
      data.push([xi, yi, v])
    })
  })
  return { xAxis, yAxis, data }
}

/** 能源去向：就地消纳 / 储能充电 / 逆变与线路损耗（kWh），总和≈光伏总发 */
export function getEnergyFlowKwh(totalSolarKwh) {
  const local = round2(totalSolarKwh * 0.56)
  const battery = round2(totalSolarKwh * 0.34)
  const loss = round2(Math.max(0, totalSolarKwh - local - battery))
  return [
    { value: local, name: '就地消纳', itemStyle: { color: '#00d4ff' } },
    { value: battery, name: '储能充电', itemStyle: { color: '#ffaa00' } },
    { value: loss, name: '逆变与线路损耗', itemStyle: { color: '#ff6688' } },
  ]
}

/**
 * @param {'day'|'week'|'month'|'year'} range
 */
export function buildAnalyticsForRange(range) {
  const hourly = getTypicalSpringHourlyKwh()
  const dailyTotal = getTypicalDailyKwhSpring()
  const weekDaily = getWeekDailyKwh()
  const monthWeekly = getMonthWeeklyKwh()
  const yearMonthly = getTypicalYearMonthlyKwh()

  let powerTrend
  let periodSolarKwh
  let periodHours
  let powerFootnote

  if (range === 'day') {
    const xAxis = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    powerTrend = { xAxis, solar: hourly, yName: '发电量 (kWh)', footnote: '按天津春季典型日、4×200W 组件估算逐小时电量。' }
    periodSolarKwh = dailyTotal
    periodHours = 24
    powerFootnote = powerTrend.footnote
  } else if (range === 'week') {
    powerTrend = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      solar: weekDaily,
      yName: '日发电量 (kWh)',
      footnote: '本周逐日总电量（约 0.8kWp）。',
    }
    periodSolarKwh = round2(sum(weekDaily))
    periodHours = 24 * 7
    powerFootnote = powerTrend.footnote
  } else if (range === 'month') {
    powerTrend = {
      xAxis: ['第1周', '第2周', '第3周', '第4周'],
      solar: monthWeekly,
      yName: '周发电量 (kWh)',
      footnote: '近四周周电量，对应电站已投运约一个月的量级。',
    }
    periodSolarKwh = round2(sum(monthWeekly))
    periodHours = 24 * 28
    powerFootnote = powerTrend.footnote
  } else {
    powerTrend = {
      xAxis: yearMonthly.map((_, i) => `${i + 1}月`),
      solar: yearMonthly,
      yName: '月发电量 (kWh)',
      footnote:
        '同站点 0.8kWp 在天津若满年运行的典型月电量参考；当前电站实际仅投运约 1 个月。',
    }
    periodSolarKwh = round2(sum(yearMonthly))
    periodHours = 8760
    powerFootnote = powerTrend.footnote
  }

  const effHourly = getHourlyEfficiencyPercent()
  let efficiency
  if (range === 'day') {
    const points = [0, 4, 8, 12, 16, 20, 23]
    efficiency = {
      xAxis: points.map((h) => `${String(h).padStart(2, '0')}:00`),
      data: points.map((h) => effHourly[h] || 0),
      footnote: '相对额定直流的归一化运行效率（含逆变器），夜间为 0。',
    }
  } else if (range === 'week') {
    efficiency = {
      xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      data: [82, 84, 80, 85, 83, 84, 82],
      footnote: '按日加权平均效率（%）。',
    }
  } else if (range === 'month') {
    efficiency = {
      xAxis: ['第1周', '第2周', '第3周', '第4周'],
      data: [83, 81, 85, 82],
      footnote: '各周平均效率。',
    }
  } else {
    efficiency = {
      xAxis: yearMonthly.map((_, i) => `${i + 1}月`),
      data: [78, 79, 81, 83, 84, 85, 85, 84, 83, 82, 80, 79],
      footnote: '满年典型逐月效率趋势（估算）。',
    }
  }

  const distribution = getEnergyFlowKwh(periodSolarKwh)

  const heatmap =
    range === 'day'
      ? getHeatmapDay()
      : range === 'week'
        ? getHeatmapWeek()
        : range === 'month'
          ? getHeatmapMonth()
          : getHeatmapYear()

  const cf = capacityFactor(periodSolarKwh, periodHours)
  const activeEff = effHourly.filter((e) => e > 0)
  const avgEff =
    range === 'day'
      ? activeEff.length
        ? Math.round(activeEff.reduce((a, b) => a + b, 0) / activeEff.length)
        : 82
      : efficiency.data.length
        ? Math.round(efficiency.data.reduce((a, b) => a + b, 0) / efficiency.data.length)
        : 82

  const peakKw = TIANJIN_PLANT.peakKwAc

  const metrics = []
  if (range === 'day') {
    metrics.push(
      { label: '今日累计发电', value: `${dailyTotal} kWh`, change: '—', color: 'text-neutral-400' },
      { label: '峰值功率(实测级)', value: `${peakKw} kW`, change: '≤0.8kWp 标称', color: 'text-success' },
      { label: '日容量系数', value: String(capacityFactor(dailyTotal, 24)), change: '天津春季典型', color: 'text-neutral-300' },
      { label: '加权平均效率', value: `${avgEff}%`, change: '含逆变器', color: 'text-success' }
    )
  } else if (range === 'week') {
    metrics.push(
      { label: '本周总发电', value: `${round2(sum(weekDaily))} kWh`, change: '4×200W', color: 'text-success' },
      { label: '峰值功率(实测级)', value: `${peakKw} kW`, change: '组件侧 0.8kW', color: 'text-neutral-300' },
      { label: '周容量系数', value: String(cf), change: '0.8kWp 基准', color: 'text-neutral-300' },
      { label: '周平均效率', value: `${avgEff}%`, change: '—', color: 'text-success' }
    )
  } else if (range === 'month') {
    const mTotal = round2(sum(monthWeekly))
    metrics.push(
      { label: '近四周总发电', value: `${mTotal} kWh`, change: '投运约1个月', color: 'text-success' },
      { label: '峰值功率(实测级)', value: `${peakKw} kW`, change: '与设备页一致', color: 'text-neutral-300' },
      { label: '月容量系数', value: String(cf), change: '28 日折算', color: 'text-neutral-300' },
      { label: '月平均效率', value: `${avgEff}%`, change: '—', color: 'text-success' }
    )
  } else {
    const yTotal = round2(sum(yearMonthly))
    metrics.push(
      { label: '典型年满发估算', value: `${yTotal} kWh`, change: '同功率天津参考', color: 'text-neutral-300' },
      { label: '峰值功率(实测级)', value: `${peakKw} kW`, change: '4×200W 标称', color: 'text-neutral-300' },
      { label: '年容量系数', value: String(cf), change: '典型年', color: 'text-neutral-300' },
      { label: '实际投运时长', value: '≈1 个月', change: '未满年', color: 'text-neutral-400' }
    )
  }

  return {
    powerTrend,
    efficiency,
    distribution,
    heatmap,
    metrics,
    powerFootnote,
    plant: TIANJIN_PLANT,
  }
}
