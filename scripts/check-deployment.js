// 部署前检查脚本
const fs = require('fs')
const path = require('path')

console.log('🔍 检查部署配置...\n')

// 检查环境变量文件
const envPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  console.log('✅ 环境变量文件存在')
} else {
  console.log('⚠️  警告：.env.local 文件不存在，请确保在部署平台设置了环境变量')
}

// 检查必要的文件
const requiredFiles = [
  'package.json',
  'next.config.js',
  'netlify.toml',
  'app/layout.jsx',
  'app/page.jsx'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`)
  } else {
    console.log(`❌ ${file} 缺失`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('\n✅ 所有必要文件都存在，可以进行部署！')
} else {
  console.log('\n❌ 有文件缺失，请检查后再部署。')
  process.exit(1)
}

// 读取package.json检查依赖
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
const requiredDeps = ['next', 'react', 'react-dom', 'echarts', '@supabase/supabase-js']

console.log('\n📦 检查依赖包...')
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`)
  } else {
    console.log(`❌ ${dep} 未安装`)
  }
})

console.log('\n🚀 部署检查完成！')