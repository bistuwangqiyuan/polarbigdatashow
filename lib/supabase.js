import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// 检查是否使用了占位符配置
export const isSupabaseConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key'

// 创建单一的 Supabase 客户端实例
let supabaseClient = null
let supabaseAdminClient = null

// 创建模拟客户端 - 用于未配置环境或服务端渲染
function createMockClient() {
  const mockResponse = { data: null, error: null }
  const mockFunction = () => Promise.resolve(mockResponse)
  
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'from') {
        return () => new Proxy({}, {
          get() {
            return mockFunction
          }
        })
      }
      if (prop === 'channel') {
        return () => ({
          on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
          subscribe: () => ({ unsubscribe: () => {} })
        })
      }
      return mockFunction
    }
  })
}

// 安全的客户端创建函数
function safeCreateClient(url, key, options = {}) {
  try {
    // 检查环境变量是否有效
    if (url === 'https://placeholder.supabase.co' || key === 'placeholder-key') {
      return createMockClient()
    }
    
    return createClient(url, key, options)
  } catch (error) {
    console.warn('Failed to create Supabase client:', error.message)
    return createMockClient()
  }
}

// 获取客户端 - 懒加载
export function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = safeCreateClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }
  return supabaseClient
}

// 获取管理员客户端 - 懒加载
export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
    supabaseAdminClient = safeCreateClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }
  return supabaseAdminClient
}

// 导出懒加载的客户端获取器
export const supabase = getSupabase()
export const supabaseAdmin = getSupabaseAdmin()