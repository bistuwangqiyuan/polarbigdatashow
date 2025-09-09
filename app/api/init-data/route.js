import { NextResponse } from 'next/server'
import { generateMockData } from '../../../lib/dataService'

export async function POST() {
  try {
    await generateMockData()
    return NextResponse.json({ 
      success: true, 
      message: '模拟数据生成成功' 
    })
  } catch (error) {
    console.error('Error generating mock data:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: '请使用POST方法初始化数据' 
  })
}