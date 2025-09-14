import { NextResponse } from 'next/server'
import { generateMockData } from '../../../lib/dataService'
import { isSupabaseConfigured } from '../../../lib/supabase'

export async function POST() {
  try {
    // 检查环境配置
    if (!isSupabaseConfigured) {
      return NextResponse.json({ 
        success: false, 
        message: '系统当前运行在演示模式下，无需初始化数据',
        mode: 'demo'
      })
    }

    await generateMockData()
    return NextResponse.json({ 
      success: true, 
      message: '模拟数据生成成功',
      mode: 'production'
    })
  } catch (error) {
    console.error('Error generating mock data:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: '数据生成失败，请检查环境配置'
    }, { status: 500 })
  }
}

export async function GET() {
  const mode = isSupabaseConfigured ? 'production' : 'demo'
  return NextResponse.json({ 
    message: '光伏能源关断管理系统 - 数据初始化端点',
    method: 'POST',
    mode: mode,
    configured: isSupabaseConfigured
  })
}