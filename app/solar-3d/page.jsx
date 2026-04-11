'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  getTianjinDecimalHour,
  getClearSkyDayFactor,
  computeArrayOutputW,
  sampleTianjinWeatherForDemo,
  WEATHER_LABELS,
} from 'lib/tianjinSolarSimulation'
import {
  getTypicalDailyKwhSpring,
  getMonthWeeklyKwh,
  sum,
  round2,
  TIANJIN_PLANT,
} from 'lib/tianjinPlantAnalyticsModel'

const SolarStation3D = dynamic(() => import('components/three/SolarStation3D'), {
  ssr: false,
  loading: () => <CanvasLoader />,
})

const ARRAY_JITTERS = [-0.02, 0.01, -0.01, 0.02]

/* ── simulated real-time data matching home page model ── */
function useSimulatedData() {
  const [weather, setWeather] = useState(() => sampleTianjinWeatherForDemo())
  const [data, setData] = useState(() => generateSnapshot(weather))
  const [cumKwh, setCumKwh] = useState(() => {
    const h = getTianjinDecimalHour()
    const typDaily = getTypicalDailyKwhSpring()
    const fraction = Math.max(0, Math.min(1, (h - 5.25) / (19.35 - 5.25)))
    return round2(typDaily * fraction * (0.9 + Math.random() * 0.15))
  })

  useEffect(() => {
    const id = setInterval(() => {
      const snap = generateSnapshot(weather)
      setData(snap)
      const totalW = snap.reduce((s, p) => s + p.power, 0)
      setCumKwh(prev => round2(prev + (totalW * 5) / 3_600_000))
    }, 5000)
    const weatherId = setInterval(() => setWeather(sampleTianjinWeatherForDemo()), 120_000)
    return () => { clearInterval(id); clearInterval(weatherId) }
  }, [weather])

  return { panels: data, cumKwh, weather }
}

function generateSnapshot(weatherKey) {
  const h = getTianjinDecimalHour()
  const dayFactor = getClearSkyDayFactor(h)

  return Array.from({ length: 4 }, (_, i) => {
    const power = computeArrayOutputW(h, weatherKey, 200, ARRAY_JITTERS[i])

    const voc = 37.5
    const voltage = dayFactor > 0
      ? +(voc * (0.82 + dayFactor * 0.15) + (Math.random() - 0.5) * 0.6).toFixed(1)
      : +(voc * 0.05 + Math.random() * 0.3).toFixed(1)
    const current = voltage > 1 ? +(power / voltage).toFixed(2) : 0

    const ambientTemp = h >= 6 && h < 20
      ? 14 + Math.sin(((h - 6) / 14) * Math.PI) * 9
      : 9 + Math.random() * 2
    const panelTemp = +(ambientTemp + dayFactor * 18 + Math.random() * 3).toFixed(1)

    const efficiency = power > 3
      ? +(76 + (power / 200) * 12 + (Math.random() - 0.5) * 2).toFixed(1)
      : 0

    const irradiance = Math.round(dayFactor * 1000 * (0.9 + Math.random() * 0.15))

    let status = 'normal'
    if (power < 3 && dayFactor <= 0) status = 'offline'
    else if (panelTemp > 42) status = 'warning'
    else if (Math.random() < 0.03) status = 'warning'

    return { id: i, power, voltage, current, temp: panelTemp, efficiency, status, irradiance }
  })
}

/* ── status badge ── */
function StatusBadge({ status }) {
  const map = {
    normal: { label: '正常', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    warning: { label: '告警', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    fault: { label: '故障', cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
    offline: { label: '离线', cls: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/40' },
  }
  const m = map[status] || map.normal
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${m.cls}`}>
      {m.label}
    </span>
  )
}

/* ── animated metric card ── */
function MetricCard({ label, value, unit, icon, color = 'cyan' }) {
  const colorMap = {
    cyan: 'from-cyan-500/10 to-cyan-900/5 border-cyan-500/30 text-cyan-400',
    green: 'from-emerald-500/10 to-emerald-900/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/10 to-amber-900/5 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/10 to-purple-900/5 border-purple-500/30 text-purple-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border bg-gradient-to-br backdrop-blur-md p-3 ${colorMap[color]}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold font-display tabular-nums">
        {value}
        <span className="text-sm font-normal ml-1 opacity-70">{unit}</span>
      </div>
    </motion.div>
  )
}

/* ── loading fallback ── */
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-cyan-400 text-sm font-display tracking-wider animate-pulse">
          加载 3D 场景...
        </p>
      </div>
    </div>
  )
}

/* ── panel detail flyout ── */
function PanelDetail({ panel, data, onClose }) {
  if (panel === null || !data) return null
  const d = data[panel]
  return (
    <AnimatePresence>
      <motion.div
        key={panel}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        className="absolute right-4 top-20 bottom-4 w-72 z-30 rounded-2xl border border-cyan-500/30 bg-neutral-950/80 backdrop-blur-xl p-5 flex flex-col gap-4 overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display text-cyan-400">
            PV-{String(panel + 1).padStart(2, '0')}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-cyan-500 transition-colors"
          >
            ×
          </button>
        </div>
        <StatusBadge status={d.status} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoRow label="实时功率" value={`${d.power} W`} />
          <InfoRow label="电压" value={`${d.voltage} V`} />
          <InfoRow label="电流" value={`${d.current} A`} />
          <InfoRow label="温度" value={`${d.temp} °C`} />
          <InfoRow label="转换效率" value={`${d.efficiency}%`} />
          <InfoRow label="辐照度" value={`${d.irradiance} W/m²`} />
        </div>

        <div className="mt-2 pt-3 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 mb-2">组件规格</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
            <span>额定功率</span><span className="text-right">200 W</span>
            <span>尺寸</span><span className="text-right">1.0 × 0.8 m</span>
            <span>电池类型</span><span className="text-right">单晶硅 PERC</span>
            <span>最大系统电压</span><span className="text-right">1000 V</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-neutral-800 flex gap-2">
          <button className="flex-1 py-2 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
            查看历史
          </button>
          <button className="flex-1 py-2 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
            远程关断
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-neutral-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-neutral-200">{value}</span>
    </div>
  )
}

/* ── toolbar ── */
function ViewToolbar({ autoRotate, setAutoRotate, onResetView }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700/60 bg-neutral-900/70 backdrop-blur-lg">
      <button
        onClick={() => setAutoRotate(!autoRotate)}
        className={`px-3 py-1.5 text-xs rounded-full transition-all ${
          autoRotate
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
            : 'text-neutral-400 hover:text-white'
        }`}
      >
        {autoRotate ? '⟳ 自动旋转' : '⟳ 手动'}
      </button>
      <span className="w-px h-4 bg-neutral-700" />
      <span className="text-[10px] text-neutral-500 hidden sm:inline">
        拖拽旋转 · 滚轮缩放 · 右键平移
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════ */
/*  MAIN PAGE                                    */
/* ══════════════════════════════════════════════ */
export default function Solar3DPage() {
  const { panels: panelData, cumKwh, weather } = useSimulatedData()
  const [selectedPanel, setSelectedPanel] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)

  const monthlyKwh = useMemo(() => round2(sum(getMonthWeeklyKwh())), [])

  const totals = useMemo(() => {
    const totalPower = panelData.reduce((s, p) => s + p.power, 0)
    const avgTemp = panelData.reduce((s, p) => s + p.temp, 0) / panelData.length
    const activeEff = panelData.filter((p) => p.efficiency > 0).map((p) => p.efficiency)
    const avgEff = activeEff.length > 0
      ? activeEff.reduce((a, b) => a + b, 0) / activeEff.length
      : 0
    return {
      totalPower: totalPower.toFixed(1),
      avgTemp: avgTemp.toFixed(1),
      avgEff: avgEff.toFixed(1),
      dailyKwh: cumKwh.toFixed(2),
      monthlyKwh,
      weather: WEATHER_LABELS[weather] || '多云',
    }
  }, [panelData, cumKwh, monthlyKwh, weather])

  const handleSelectPanel = useCallback((i) => {
    setSelectedPanel((prev) => (prev === i ? null : i))
  }, [])

  return (
    <div className="min-h-screen dashboard-bg flex flex-col relative overflow-hidden">
      {/* ── header ── */}
      <header className="relative z-20 border-b border-primary/30 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-primary/80 hover:text-primary transition-colors text-sm flex items-center gap-1"
            >
              ← 返回主页
            </Link>
            <span className="w-px h-5 bg-primary/20 hidden sm:block" />
            <Image
              src="/image/logo.png"
              alt="logo"
              width={28}
              height={28}
              className="rounded hidden sm:block"
            />
            <div>
              <h1 className="text-lg font-display text-primary tracking-wide">
                3D 数字光伏安全管理
              </h1>
              <p className="text-[11px] text-neutral-500 hidden sm:block">
                4 × 200W 单晶硅组件 · 投运约1个月 · 北京 · 实时三维监控
              </p>
            </div>
          </div>
          <nav className="flex items-center flex-wrap gap-2 sm:gap-3 text-sm">
            {[
              { label: '故障图库', href: '/gallery' },
              { label: '设备管理', href: '/devices' },
              { label: '报警信息', href: '/alerts' },
              { label: '图像识别', href: '/pv-vision' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-neutral-400 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <span className="text-primary border border-primary/40 rounded-full px-3 py-0.5 text-xs bg-primary/10">
              3D 管理
            </span>
          </nav>
        </div>
      </header>

      {/* ── top metric strip ── */}
      <div className="relative z-10 px-4 py-3">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="实时总功率" value={totals.totalPower} unit="W" icon="⚡" color="cyan" />
          <MetricCard label="今日发电" value={totals.dailyKwh} unit="kWh" icon="☀" color="green" />
          <MetricCard label="本月累计" value={totals.monthlyKwh} unit="kWh" icon="📊" color="purple" />
          <MetricCard label={`组件温度 (${totals.weather})`} value={totals.avgTemp} unit="°C" icon="🌡" color="amber" />
        </div>
      </div>

      {/* ── 3D canvas area ── */}
      <div className="relative flex-1 min-h-[400px]">
        <SolarStation3D
          panelData={panelData}
          selectedPanel={selectedPanel}
          onSelectPanel={handleSelectPanel}
        />

        <PanelDetail
          panel={selectedPanel}
          data={panelData}
          onClose={() => setSelectedPanel(null)}
        />

        <ViewToolbar autoRotate={autoRotate} setAutoRotate={setAutoRotate} />

        {/* ── bottom panel summary bar ── */}
        <div className="absolute bottom-16 left-4 z-20 flex flex-col gap-1.5 sm:flex-row sm:gap-3">
          {panelData.map((p, i) => (
            <motion.button
              key={i}
              onClick={() => handleSelectPanel(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md text-xs transition-all ${
                selectedPanel === i
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                  : 'bg-neutral-900/60 border-neutral-700/50 text-neutral-300 hover:border-cyan-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  p.status === 'normal'
                    ? 'bg-emerald-400'
                    : p.status === 'warning'
                    ? 'bg-amber-400'
                    : p.status === 'fault'
                    ? 'bg-red-400'
                    : 'bg-neutral-500'
                }`}
              />
              <span className="font-display">PV-{String(i + 1).padStart(2, '0')}</span>
              <span className="tabular-nums font-semibold">{p.power}W</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── ambient decorative glow ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>
    </div>
  )
}
