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


// 安全的客户端初始化 - 只在浏览器环境下初始化
function safeCreateClient(url, key, options = {}) {
  if (typeof window === 'undefined') {
    // 服务端返回一个空的代理对象
    return new Proxy({}, {
      get() { return () => Promise.resolve({ data: null, error: null }) }
    })
  }
  return createClient(url, key, options)
}

// 修改客户端创建函数使用安全版本
export function getSupabase() {
  if (!supabaseClient) {
    if (isSupabaseConfigured) {
      supabaseClient = safeCreateClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
    }
  }
  return supabaseClient
}

// 修改管理员客户端创建函数
export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    if (isSupabaseConfigured && serviceRoleKey !== 'placeholder-key') {
      supabaseAdminClient = safeCreateClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      })
    }
  }
  return supabaseAdminClient
}

// 导出兼容的接口
export const supabase = getSupabase()
export const supabaseAdmin = getSupabaseAdmin()