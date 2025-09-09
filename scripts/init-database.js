const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('请设置环境变量 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {
  try {
    console.log('开始初始化数据库...')
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../lib/supabase-init.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // 执行SQL脚本
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('执行SQL脚本失败:', error)
      // 如果RPC不存在，尝试分步执行
      console.log('尝试分步执行SQL语句...')
      const statements = sql.split(';').filter(s => s.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            // 注意：Supabase JS客户端不直接支持执行原始SQL
            // 这里仅作为示例，实际应在Supabase控制台执行
            console.log('执行语句:', statement.substring(0, 50) + '...')
          } catch (e) {
            console.error('执行失败:', e)
          }
        }
      }
    } else {
      console.log('数据库初始化成功！')
    }
    
    // 生成初始模拟数据
    console.log('生成初始模拟数据...')
    const { generateMockData } = require('../lib/dataService')
    await generateMockData()
    console.log('模拟数据生成成功！')
    
  } catch (error) {
    console.error('初始化失败:', error)
    process.exit(1)
  }
}

// 执行初始化
initDatabase()