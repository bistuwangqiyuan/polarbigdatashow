'use client'

import ReactECharts from 'echarts-for-react'
import { useMemo, useEffect, useState } from 'react'
import * as echarts from 'echarts'

export default function StationMap({ stations = [] }) {
  const [mapRegistered, setMapRegistered] = useState(false)
  
  // 如果没有传入电站数据，使用默认数据
  const defaultStations = [
    { name: '北京站', longitude: 116.231204, latitude: 40.22066, capacity: 50, todayGeneration: 120, status: 'active' },
    { name: '上海站', longitude: 121.544379, latitude: 31.221517, capacity: 80, todayGeneration: 180, status: 'active' },
    { name: '深圳站', longitude: 113.930765, latitude: 22.531544, capacity: 65, todayGeneration: 150, status: 'active' },
    { name: '广州站', longitude: 113.364710, latitude: 23.125178, capacity: 45, todayGeneration: 100, status: 'active' },
    { name: '成都站', longitude: 104.065735, latitude: 30.572269, capacity: 55, todayGeneration: 130, status: 'active' },
    { name: '西安站', longitude: 108.939847, latitude: 34.341574, capacity: 40, todayGeneration: 95, status: 'active' },
    { name: '武汉站', longitude: 114.305392, latitude: 30.592849, capacity: 60, todayGeneration: 140, status: 'active' },
    { name: '南京站', longitude: 118.796877, latitude: 32.060255, capacity: 70, todayGeneration: 160, status: 'active' }
  ]
  
  const displayStations = stations.length > 0 ? stations : defaultStations
  
  // 加载并注册中国地图
  useEffect(() => {
    fetch('/china.json')
      .then(response => response.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson)
        setMapRegistered(true)
      })
      .catch(error => {
        console.error('Failed to load China map:', error)
        setMapRegistered(true) // 即使失败也继续显示备用方案
      })
  }, [])
  
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
        const { name, value } = params.data
        return `${name}<br/>装机容量: ${value[2]} MW<br/>今日发电: ${value[3]} MWh`
      }
    },
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.2,
      center: [105, 35],
      itemStyle: {
        areaColor: '#0a0a0a',
        borderColor: '#00d4ff20',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          areaColor: '#00d4ff10',
          borderColor: '#00d4ff',
          borderWidth: 2
        }
      }
    },
    series: [{
      type: 'scatter',
      coordinateSystem: 'geo',
      symbolSize: (val) => Math.sqrt(val[2]) * 5,
      itemStyle: {
        color: '#00d4ff',
        shadowBlur: 20,
        shadowColor: '#00d4ff'
      },
      emphasis: {
        itemStyle: {
          color: '#00ff88',
          shadowBlur: 30,
          shadowColor: '#00ff88'
        }
      },
      data: displayStations.map(station => ({
        name: station.name,
        value: [
          station.longitude,
          station.latitude,
          station.capacity,
          station.todayGeneration
        ]
      }))
    }, {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      rippleEffect: {
        brushType: 'stroke',
        scale: 5,
        period: 4
      },
      symbolSize: (val) => Math.sqrt(val[2]) * 3,
      itemStyle: {
        color: '#00ff88',
        shadowBlur: 10,
        shadowColor: '#00ff88'
      },
      data: displayStations.filter(s => s.status === 'active').map(station => ({
        name: station.name,
        value: [
          station.longitude,
          station.latitude,
          station.capacity,
          station.todayGeneration
        ]
      }))
    }]
  }), [displayStations])

  // 如果地图未加载完成，使用简化的散点图
  const simplifiedOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    xAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 100
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 100
    },
    series: [{
      type: 'scatter',
      symbolSize: (val) => val[2] * 2,
      itemStyle: {
        color: '#00d4ff',
        shadowBlur: 20,
        shadowColor: '#00d4ff'
      },
      emphasis: {
        itemStyle: {
          color: '#00ff88',
          shadowBlur: 30,
          shadowColor: '#00ff88'
        }
      },
      data: [
        { name: '北京站', value: [50, 70, 25, 120] },
        { name: '上海站', value: [80, 40, 40, 180] },
        { name: '深圳站', value: [75, 20, 32, 150] }
      ],
      animationDelay: (idx) => idx * 100
    }, {
      type: 'effectScatter',
      rippleEffect: {
        brushType: 'stroke',
        scale: 3,
        period: 4
      },
      symbolSize: (val) => val[2] * 1.5,
      itemStyle: {
        color: '#00ff88',
        shadowBlur: 10,
        shadowColor: '#00ff88'
      },
      data: [
        { name: '北京站', value: [50, 70, 25, 120] },
        { name: '上海站', value: [80, 40, 40, 180] },
        { name: '深圳站', value: [75, 20, 32, 150] }
      ],
      animationDelay: (idx) => idx * 100 + 500
    }]
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chart-container h-full">
      <h3 className="stat-label mb-4">电站分布</h3>
      <ReactECharts 
        option={mapRegistered ? option : simplifiedOption} 
        style={{ height: 'calc(100% - 40px)' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}