'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  TIANJIN_WEATHER,
  getTianjinDecimalHour,
  computeArrayOutputW,
  sampleTianjinWeatherForDemo,
  openMeteoCodeToWeatherKey,
  WEATHER_LABELS,
} from 'lib/tianjinSolarSimulation'
import { SOLAR_REAL_FIELD_IMAGE } from 'lib/solarRealImages'

const deviceGradients = {
  '储能': 'from-emerald-800/60 via-green-900/70 to-slate-950/90',
}

const SOLAR_RATED_W = 200

/** Fetch latest PV state (overrides + occlusion) from the database API. */
async function fetchPvState() {
  try {
    const res = await fetch('/api/pv-state', { cache: 'no-store' })
    if (!res.ok) throw new Error('fetch failed')
    return await res.json()
  } catch {
    return { overrides: {}, occlusion: { panels: [], timestamp: 0 } }
  }
}

/**
 * Apply device statuses from admin overrides + auto-alarm logic.
 *
 * Priority:
 *  1. Admin 'offline' override → offline (no matter what)
 *  2. Admin 'fault'   override → warning
 *  3. Admin 'normal'  override → online
 *  4. Auto threshold (< 80% avg AND deviation > 10 W) → warning
 *
 * Works at any time of day (including when power = 0 at night).
 */
function applySolarAnomalyFlags(devices, adminOverrides = {}) {
  // Step 1: apply override statuses + zero-out power for offline panels
  const withOverrides = devices.map((d) => {
    if (d.type !== '光伏组件') return d
    const ov = adminOverrides[d.id]
    if (ov === 'offline') return { ...d, status: 'offline', power: 0, load: 0, efficiency: 0, adminFault: false }
    if (ov === 'fault')   return { ...d, status: 'warning', adminFault: true }
    if (ov === 'normal')  return { ...d, status: 'online',  adminFault: false }
    return d
  })

  // Step 2: auto-alarm for panels without an admin override
  const freeOnline = withOverrides.filter(
    (d) => d.type === '光伏组件' && d.power > 0 && d.status !== 'offline' && !adminOverrides[d.id]
  )
  if (freeOnline.length === 0) return withOverrides

  const avgPower = freeOnline.reduce((s, d) => s + d.power, 0) / freeOnline.length
  const threshold = avgPower * 0.8

  return withOverrides.map((d) => {
    if (d.type !== '光伏组件') return d
    if (d.status === 'offline') return d
    if (adminOverrides[d.id]) return d          // already handled above
    if (d.power <= 0) return d
    const deviation = avgPower - d.power
    const isAnomaly = d.power < threshold && deviation > 10
    return { ...d, status: isAnomaly ? 'warning' : 'online', adminFault: false }
  })
}

/**
 * Compute panel power from weather, optionally applying per-panel occlusion factors.
 * @param {object[]} devices
 * @param {string} weatherKey
 * @param {Record<number,number>} occlusionFactors  panelId → power factor (0–1)
 * @param {Record<number,{type:string,ratio:number}>} occlusionDetails panelId → detail info
 */
function mapSolarPowerFromWeather(devices, weatherKey, occlusionFactors = {}, occlusionDetails = {}) {
  const h = getTianjinDecimalHour()
  const basePowers = {}
  devices.forEach((d) => {
    if (d.type !== '光伏组件') return
    if (d.status === 'offline') { basePowers[d.id] = 0; return }
    const jitter = ((d.id % 5) - 2) * 0.01
    basePowers[d.id] = computeArrayOutputW(h, weatherKey, SOLAR_RATED_W, jitter)
  })

  return devices.map((d) => {
    if (d.type !== '光伏组件') return d
    if (d.status === 'offline') return { ...d, power: 0, load: 0, efficiency: 0, occlusionInfo: null }

    const factor = occlusionFactors[d.id] !== undefined ? occlusionFactors[d.id] : 1.0
    const power = parseFloat((basePowers[d.id] * factor).toFixed(1))
    return {
      ...d,
      power,
      load: Math.round((power / SOLAR_RATED_W) * 100),
      efficiency: parseFloat(((power / SOLAR_RATED_W) * 100).toFixed(1)),
      occlusionInfo: occlusionDetails[d.id] || null,
    }
  })
}

/** Convert an occlusion panels array into factors and details maps keyed by panel id. */
function buildOcclusionMaps(panels) {
  const factors = {}
  const details = {}
  if (!Array.isArray(panels)) return { factors, details }
  panels.forEach((p) => {
    if (p.occluded && typeof p.ratio === 'number' && p.ratio > 0) {
      factors[p.id] = Math.max(0, 1 - p.ratio)
      details[p.id] = { type: p.type || '异物', ratio: p.ratio }
    }
  })
  return { factors, details }
}

const DeviceTypeIcon = ({ type }) => {
  const icons = {
    '储能': (
      <svg className="w-16 h-16 text-white/15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>
      </svg>
    ),
  }
  return icons[type] || null
}

const DeviceCard = ({ device, index, onToggle, envTemp }) => {
  const statusColors = {
    online: 'text-success border-success/30 bg-success/10',
    offline: 'text-danger border-danger/30 bg-danger/10',
    warning: 'text-warning border-warning/30 bg-warning/10'
  }

  const statusText = {
    online: '正常运行',
    offline: device.switchable ? '已关断' : '离线',
    warning: '异常报警'
  }

  const isSolar = device.type === '光伏组件'
  const gradient = deviceGradients[device.type]

  const displayUnit = 'W'
  const displayVoltage = device.type === '储能' ? '12V' : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 group ${
        device.status === 'warning'
          ? 'border-warning/50 shadow-lg shadow-warning/10'
          : 'border-white/10 hover:border-primary/40'
      }`}
    >
      {isSolar ? (
        <>
          <Image
            src="/image/solarreal7.png"
            alt={`${device.name} 实拍组件`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient || 'from-slate-800/60 to-slate-950/90'}`}>
          <div className="absolute right-2 top-2 opacity-60">
            <DeviceTypeIcon type={device.type} />
          </div>
        </div>
      )}

      <div className="relative z-10 p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-display text-white drop-shadow-md">{device.name}</h3>
            <p className="text-sm text-neutral-300 mt-1">{device.type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${statusColors[device.status]}`}>
            {statusText[device.status]}
          </span>
        </div>


        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-400">输出功率</p>
              <p className="text-lg font-display text-white drop-shadow-sm">
                {Math.round(device.power)} {displayUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">效率</p>
              <p className="text-lg font-display text-white drop-shadow-sm">{device.efficiency}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-neutral-400">环境温度</p>
              <p className="text-lg font-display text-white drop-shadow-sm">{envTemp}°C</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">
                {device.type === '储能' ? '输出电压' : '运行时长'}
              </p>
              <p className="text-lg font-display text-white drop-shadow-sm">
                {device.type === '储能' ? displayVoltage : `${device.runtime}h`}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-neutral-300 mb-1">
              <span>负载率</span>
              <span>{device.load}%</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className={`h-full ${
                  device.status === 'warning'
                    ? 'bg-gradient-to-r from-warning to-danger'
                    : 'bg-gradient-to-r from-primary to-secondary'
                }`}
                initial={{ width: '0%' }}
                animate={{ width: `${device.load}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
          {device.type === '光伏组件' ? (
            <Link href={`/devices/solar/${device.id}`} className="flex-1 text-center py-2 text-sm text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded backdrop-blur-sm transition-colors">
              查看详情
            </Link>
          ) : (
            <button className="flex-1 py-2 text-sm text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded backdrop-blur-sm transition-colors">
              查看详情
            </button>
          )}
          
          {device.switchable && (
            <button 
              onClick={() => onToggle && onToggle(device.id)}
              className={`flex-1 py-2 text-sm border rounded backdrop-blur-sm transition-colors ${
                device.status === 'online' || device.status === 'warning'
                  ? 'text-danger hover:text-danger/80 bg-danger/10 hover:bg-danger/20 border-danger/30' 
                  : 'text-success hover:text-success/80 bg-success/10 hover:bg-success/20 border-success/30'
              }`}
            >
              {device.status === 'online' || device.status === 'warning' ? '关断' : '开启'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function DevicesPage() {
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [envTemp, setEnvTemp] = useState(18.5)

  // Latest occlusion panels from DB (refreshed every 5s)
  const occlusionPanelsRef = useRef([])
  // Admin manual overrides from DB (refreshed every 5s)
  const adminOverridesRef = useRef({})

  const bootRef = useRef(null)
  if (bootRef.current === null) {
    const w = TIANJIN_WEATHER.CLEAR
    const base = [
      { id: 1, name: '光伏阵列-01', type: '光伏组件', status: 'online', runtime: 722, switchable: true },
      { id: 2, name: '光伏阵列-02', type: '光伏组件', status: 'online', runtime: 722, switchable: true },
      { id: 3, name: '光伏阵列-03', type: '光伏组件', status: 'online', runtime: 722, switchable: true },
      { id: 4, name: '光伏阵列-04', type: '光伏组件', status: 'online', runtime: 722, switchable: true },
      { id: 5, name: '储能电池-01', type: '储能', status: 'online', power: 78, efficiency: 86.5, runtime: 720, load: 78 },
      { id: 6, name: '储能电池-02', type: '储能', status: 'online', power: 72, efficiency: 85.2, runtime: 720, load: 72 },
      { id: 7, name: '储能电池-03', type: '储能', status: 'online', power: 65, efficiency: 84.8, runtime: 720, load: 65 },
      { id: 8, name: '储能电池-04', type: '储能', status: 'online', power: 58, efficiency: 83.6, runtime: 720, load: 58 },
    ]
    bootRef.current = {
      weather: w,
      devices: applySolarAnomalyFlags(mapSolarPowerFromWeather(base, w)),
    }
  }

  const [weatherKey, setWeatherKey] = useState(bootRef.current.weather)
  const [devices, setDevices] = useState(bootRef.current.devices)

  // 天津滨海泰达科技发展中心：环境温度用本地钟点；光伏功率用 Asia/Shanghai 与天气联动
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const h = getTianjinDecimalHour(now)
      let tempBase
      if (h >= 6 && h < 10) tempBase = 10 + (h - 6) * 2.25
      else if (h >= 10 && h < 15) tempBase = 19 + Math.sin((h - 10) / 5 * Math.PI) * 3.5
      else if (h >= 15 && h < 20) tempBase = 19 - (h - 15) * 1.8
      else {
        const nh = h >= 20 ? h - 20 : h + 4
        tempBase = 10 + Math.sin(nh / 10 * Math.PI) * 0.8
      }
      setEnvTemp(parseFloat((tempBase + (Math.random() - 0.5) * 1.2).toFixed(1)))
    }
    update()
    const timer = setInterval(update, 10000)
    return () => clearInterval(timer)
  }, [])

  // 天津滨海泰达：Open-Meteo 实况天气（失败则回退随机演示）
  useEffect(() => {
    let cancelled = false
    const applyWeather = (key) => {
      if (cancelled) return
      setWeatherKey(key)
      setDevices((prev) => {
        const { factors, details } = buildOcclusionMaps(occlusionPanelsRef.current)
        return applySolarAnomalyFlags(
          mapSolarPowerFromWeather(prev, key, factors, details),
          adminOverridesRef.current
        )
      })
    }
    const load = async () => {
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast?latitude=39.03&longitude=117.71&current=weather_code&timezone=Asia%2FShanghai'
        const res = await fetch(url)
        if (!res.ok) throw new Error('weather')
        const j = await res.json()
        const code = j.current?.weather_code
        if (typeof code === 'number') applyWeather(openMeteoCodeToWeatherKey(code))
        else applyWeather(sampleTianjinWeatherForDemo())
      } catch {
        applyWeather(sampleTianjinWeatherForDemo())
      }
    }
    load()
    const id = setInterval(load, 10 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // Poll DB for admin overrides + AI occlusion every 5 s, apply immediately to devices
  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      const state = await fetchPvState()
      if (cancelled) return
      adminOverridesRef.current = state.overrides || {}
      occlusionPanelsRef.current = state.occlusion?.panels || []

      setDevices((prev) => {
        const overrides = adminOverridesRef.current
        const { factors, details } = buildOcclusionMaps(occlusionPanelsRef.current)
        const h = getTianjinDecimalHour()

        // Compute power for each panel, respecting offline overrides
        const withPower = prev.map((d) => {
          if (d.type !== '光伏组件') return d
          // If admin said offline, zero out immediately (applySolarAnomalyFlags will confirm status)
          if (overrides[d.id] === 'offline') {
            return { ...d, power: 0, load: 0, efficiency: 0, occlusionInfo: null }
          }
          const jitter = ((d.id % 5) - 2) * 0.01
          const factor = factors[d.id] !== undefined ? factors[d.id] : 1.0
          const basePower = computeArrayOutputW(h, weatherKey, SOLAR_RATED_W, jitter)
          const power = parseFloat((basePower * factor).toFixed(1))
          return {
            ...d,
            power,
            load: Math.round((power / SOLAR_RATED_W) * 100),
            efficiency: parseFloat(((power / SOLAR_RATED_W) * 100).toFixed(1)),
            occlusionInfo: details[d.id] || null,
          }
        })
        return applySolarAnomalyFlags(withPower, overrides)
      })
    }
    poll()
    const t = setInterval(poll, 5000)
    return () => { cancelled = true; clearInterval(t) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherKey])

  // 每 10 秒：按天津时刻与当前天气重算光伏出力，叠加 AI 识别遮挡因子；储能小幅波动
  useEffect(() => {
    const timer = setInterval(() => {
      setDevices((prev) => {
        const h = getTianjinDecimalHour()
        const overrides = adminOverridesRef.current
        const { factors, details } = buildOcclusionMaps(occlusionPanelsRef.current)

        const updated = prev.map((d) => {
          if (d.type === '光伏组件') {
            // Respect offline override — keep power at 0
            if (overrides[d.id] === 'offline') return d
            if (d.status === 'offline') return d
            const jitter = ((d.id % 5) - 2) * 0.01
            const factor = factors[d.id] !== undefined ? factors[d.id] : 1.0
            const power = parseFloat((computeArrayOutputW(h, weatherKey, SOLAR_RATED_W, jitter) * factor).toFixed(1))
            return {
              ...d,
              power,
              load: Math.round((power / SOLAR_RATED_W) * 100),
              efficiency: parseFloat(((power / SOLAR_RATED_W) * 100).toFixed(1)),
              occlusionInfo: details[d.id] || null,
            }
          }
          if (d.type === '储能' && d.power > 0) {
            const newPower = Math.max(0, d.power + (Math.random() - 0.5) * 4)
            return { ...d, power: Math.round(newPower), load: Math.round(newPower) }
          }
          return d
        })
        return applySolarAnomalyFlags(updated, overrides)
      })
    }, 10000)
    return () => clearInterval(timer)
  }, [weatherKey])

  const toggleDeviceStatus = (deviceId) => {
    let dbStatus = null

    setDevices((prevDevices) => {
      const overrides = adminOverridesRef.current
      const { factors, details } = buildOcclusionMaps(occlusionPanelsRef.current)
      const next = prevDevices.map((device) => {
        if (device.id !== deviceId || !device.switchable) return device
        const isOn = device.status === 'online' || device.status === 'warning'
        dbStatus = isOn ? 'offline' : 'normal'
        const jitter = ((device.id % 5) - 2) * 0.01
        const basePower = !isOn
          ? computeArrayOutputW(getTianjinDecimalHour(), weatherKey, SOLAR_RATED_W, jitter)
          : 0
        const factor = factors[device.id] !== undefined ? factors[device.id] : 1.0
        const newPower = !isOn ? parseFloat((basePower * factor).toFixed(1)) : 0
        return {
          ...device,
          status: isOn ? 'offline' : 'online',
          power: newPower,
          efficiency: !isOn ? parseFloat(((newPower / SOLAR_RATED_W) * 100).toFixed(1)) : 0,
          load: !isOn ? Math.round((newPower / SOLAR_RATED_W) * 100) : 0,
          occlusionInfo: !isOn ? (details[device.id] || null) : null,
        }
      })
      return applySolarAnomalyFlags(next, overrides)
    })

    // Persist the new on/off state to the database
    if (dbStatus) {
      fetch('/api/pv-state/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelId: deviceId, status: dbStatus }),
      }).catch(() => {})
    }
  }

  // 告警面板数据
  const solarAlerts = useMemo(() => {
    const onlineSolar = devices.filter(d => d.type === '光伏组件' && d.power > 0)
    if (onlineSolar.length === 0) return { alerts: [], avgPower: 0, threshold: 0 }
    const avgPower = onlineSolar.reduce((s, d) => s + d.power, 0) / onlineSolar.length
    const threshold = avgPower * 0.8
    const alerts = devices.filter(d => d.type === '光伏组件' && d.status === 'warning')
    return { alerts, avgPower: Math.round(avgPower), threshold: Math.round(threshold) }
  }, [devices])

  const deviceTypes = [
    { value: 'all', label: '全部设备', count: devices.length },
    { value: '光伏组件', label: '光伏组件', count: devices.filter(d => d.type === '光伏组件').length },
    { value: '储能', label: '储能', count: devices.filter(d => d.type === '储能').length },
  ]

  const filteredDevices = devices.filter(device => {
    const matchesType = filterType === 'all' || device.type === filterType
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回主页
              </Link>
              <Link href="/gallery" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                故障图库
              </Link>
              <Link href="/pv-vision" className="text-sm text-neutral-400 hover:text-primary transition-colors">
                图像识别
              </Link>
              <Link href="/admin" className="text-sm text-neutral-400 hover:text-warning transition-colors">
                后台管理
              </Link>
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-2xl font-display text-primary glow-text">设备管理中心</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-sm">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-neutral-400">天津滨海泰达科技发展中心</span>
                <span className="text-red-400 font-display ml-1">{envTemp}°C</span>
                <span className="text-neutral-500 ml-2 text-xs">
                  {WEATHER_LABELS[weatherKey] ?? weatherKey} · 东八区 · 实况天气
                </span>
              </div>
              <span className="text-sm text-neutral-400">
                在线设备: {devices.filter(d => d.status === 'online' || d.status === 'warning').length} / {devices.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-8 overflow-hidden rounded-2xl border border-primary/25 shadow-lg shadow-primary/5"
        >
          <div className="relative h-44 sm:h-52 md:h-56 w-full">
            <Image
              src={SOLAR_REAL_FIELD_IMAGE}
              alt="天津现场四块单晶 200W 光伏组件"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-6 sm:px-10 max-w-xl">
              <p className="text-xs uppercase tracking-widest text-primary/90 font-medium mb-1">现场实拍</p>
              <h2 className="text-xl sm:text-2xl font-display text-white drop-shadow-md">4×200W 单晶子阵</h2>
              <p className="mt-2 text-sm text-neutral-200/95 leading-relaxed">
                与设备列表中四路子阵一一对应，卡片背景为各块组件真实照片。
              </p>
            </div>
          </div>
        </motion.div>

        {/* 异常报警面板 */}
        <AnimatePresence>
          {solarAlerts.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-warning animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96L13.75 4a2 2 0 00-3.5 0L3.32 16.04A2 2 0 005.07 19z" />
                  </svg>
                  <h3 className="text-warning font-display text-lg">光伏阵列异常报警</h3>
                  <span className="text-xs text-neutral-400 ml-auto">
                    在线平均功率: {solarAlerts.avgPower}W | 报警阈值: {solarAlerts.threshold}W (80%)
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {solarAlerts.alerts.map(d => (
                    <div key={d.id} className="px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">
                      {d.name}: {d.power}W（低于阈值 {(solarAlerts.threshold - d.power).toFixed(2)}W）
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索设备..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary/50"
              />
              <svg className="absolute right-3 top-2.5 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              {deviceTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    filterType === type.value
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-primary/30'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
              导出报告
            </button>
            <button className="px-4 py-2 bg-success/20 text-success border border-success/30 rounded-lg hover:bg-success/30 transition-colors">
              添加设备
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDevices.map((device, index) => (
            <DeviceCard key={device.id} device={device} index={index} onToggle={toggleDeviceStatus} envTemp={envTemp} />
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg">没有找到匹配的设备</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 mb-8"
        >
          <h3 className="text-xl font-display text-primary mb-8 text-center">设施概览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-xl shadow-xl">
              <Image src="/image/oilstoragetank.jpg" alt="储油设施" width={400} height={300} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">储油设施</h4>
                <p className="text-sm text-neutral-300">大型储油罐群</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-xl shadow-xl">
              <Image src="/image/oilstoragetank2.png" alt="储运基地" width={400} height={300} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">储运基地</h4>
                <p className="text-sm text-neutral-300">现代化储运中心</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-xl shadow-xl">
              <Image src="/image/pipe.jpg" alt="输送管道" width={400} height={300} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">输送管道</h4>
                <p className="text-sm text-neutral-300">长输管道网络</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="relative overflow-hidden rounded-xl shadow-xl ring-1 ring-primary/20">
              <Image
                src={SOLAR_REAL_FIELD_IMAGE}
                alt="光伏子阵现场"
                width={400}
                height={300}
                className="w-full h-48 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-medium">光伏子阵</h4>
                <p className="text-sm text-neutral-300">4×200W 单晶 · 天津现场</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
