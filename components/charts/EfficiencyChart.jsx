'use client'

import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'

export default function EfficiencyChart({ data = [] }) {
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      top: '15%',
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
        const name = params[0].name
        const efficiency = params[0].value
        const power = params[1].value
        return `${name}<br/>效率: ${efficiency}%<br/>功率: ${power} kW`
      }
    },
    legend: {
      data: ['效率', '功率'],
      textStyle: {
        color: '#888'
      },
      top: '5%'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#00d4ff20'
        }
      },
      axisLabel: {
        color: '#888',
        fontSize: 12,
        rotate: 30
      }
    },
    yAxis: [{
      type: 'value',
      name: '效率 (%)',
      nameTextStyle: {
        color: '#888',
        fontSize: 12
      },
      position: 'left',
      axisLine: {
        lineStyle: {
          color: '#00ff88'
        }
      },
      axisLabel: {
        color: '#00ff88',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#00d4ff10'
        }
      }
    }, {
      type: 'value',
      name: '功率 (kW)',
      nameTextStyle: {
        color: '#888',
        fontSize: 12
      },
      position: 'right',
      axisLine: {
        lineStyle: {
          color: '#ffaa00'
        }
      },
      axisLabel: {
        color: '#ffaa00',
        fontSize: 12
      },
      splitLine: {
        show: false
      }
    }],
    series: [{
      name: '效率',
      type: 'bar',
      yAxisIndex: 0,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#00ff88'
          }, {
            offset: 1,
            color: '#00ff8840'
          }]
        },
        borderRadius: [4, 4, 0, 0]
      },
      data: data.map(item => item.efficiency)
    }, {
      name: '功率',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#ffaa00',
        shadowColor: '#ffaa00',
        shadowBlur: 10
      },
      itemStyle: {
        color: '#ffaa00',
        borderColor: '#fff',
        borderWidth: 2
      },
      data: data.map(item => item.power)
    }]
  }), [data])

  return (
    <div className="chart-container h-full">
      <h3 className="stat-label mb-4">逆变器效率对比</h3>
      <ReactECharts 
        option={option} 
        style={{ height: 'calc(100% - 40px)' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}