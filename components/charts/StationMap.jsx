'use client'

import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

export default function StationMap({ stations = [] }) {
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
      data: stations.map(station => ({
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
      data: stations.filter(s => s.status === 'active').map(station => ({
        name: station.name,
        value: [
          station.longitude,
          station.latitude,
          station.capacity,
          station.todayGeneration
        ]
      }))
    }]
  }), [stations])

  // 注意：实际使用时需要引入中国地图数据
  // 这里简化处理，使用散点图代替
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
        option={simplifiedOption} 
        style={{ height: 'calc(100% - 40px)' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}