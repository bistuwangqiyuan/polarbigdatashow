'use client'

import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

export default function PowerTrendChart({ data = [] }) {
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
        const time = params[0].axisValue
        const power = params[0].value
        return `${time}<br/>功率: ${power} kW`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: '#00d4ff20'
        }
      },
      axisLabel: {
        color: '#888',
        fontSize: 12
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#00d4ff10'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '功率 (kW)',
      nameTextStyle: {
        color: '#888',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#00d4ff20'
        }
      },
      axisLabel: {
        color: '#888',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#00d4ff10'
        }
      }
    },
    series: [{
      name: '发电功率',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [{
            offset: 0,
            color: '#00d4ff'
          }, {
            offset: 1,
            color: '#0066cc'
          }]
        },
        shadowColor: '#00d4ff',
        shadowBlur: 10
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#00d4ff40'
          }, {
            offset: 1,
            color: '#00d4ff10'
          }]
        }
      },
      data: data.map(item => item.value)
    }]
  }), [data])

  return (
    <div className="chart-container h-full">
      <h3 className="stat-label mb-4">24小时发电趋势</h3>
      <ReactECharts 
        option={option} 
        style={{ height: 'calc(100% - 40px)' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}