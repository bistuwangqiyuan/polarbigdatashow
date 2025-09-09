const fetch = require('node-fetch')

async function quickTest() {
  console.log('=== 快速功能测试 ===\n')
  
  // 1. 测试Web服务器
  console.log('1. 测试 Web 服务器...')
  try {
    const response = await fetch('http://localhost:3000')
    const html = await response.text()
    
    if (response.ok && html.includes('光伏电站')) {
      console.log('✅ Web服务器正常，页面加载成功')
      console.log('   - 页面标题包含"光伏电站"')
      console.log('   - 状态码:', response.status)
    } else {
      console.log('❌ Web服务器响应异常')
    }
  } catch (err) {
    console.log('❌ 无法连接到Web服务器')
    console.log('   请确保已运行: npm run dev')
  }
  
  // 2. 检查页面组件
  console.log('\n2. 检查页面组件...')
  try {
    const response = await fetch('http://localhost:3000')
    const html = await response.text()
    
    const components = [
      { name: '实时功率', keyword: '实时功率' },
      { name: '今日发电量', keyword: '今日发电量' },
      { name: '今日收益', keyword: '今日收益' },
      { name: 'CO₂减排量', keyword: 'CO₂减排量' },
      { name: '24小时发电趋势', keyword: '24小时发电趋势' },
      { name: '逆变器状态', keyword: '逆变器状态' },
      { name: '系统告警', keyword: '系统告警' }
    ]
    
    let allFound = true
    components.forEach(comp => {
      if (html.includes(comp.keyword)) {
        console.log(`   ✅ ${comp.name} 组件存在`)
      } else {
        console.log(`   ❌ ${comp.name} 组件未找到`)
        allFound = false
      }
    })
    
    if (allFound) {
      console.log('\n✅ 所有核心组件都已加载')
    }
  } catch (err) {
    console.log('❌ 检查组件失败:', err.message)
  }
  
  // 3. 测试API端点
  console.log('\n3. 测试 API 端点...')
  try {
    const response = await fetch('http://localhost:3000/api/init-data', {
      method: 'GET'
    })
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API端点正常响应')
      console.log('   响应:', data.message)
    } else {
      console.log('❌ API端点响应异常')
    }
  } catch (err) {
    console.log('❌ API测试失败:', err.message)
  }
  
  console.log('\n=== 测试完成 ===')
  console.log('\n提示：')
  console.log('1. 页面应该显示模拟数据（即使数据库未连接）')
  console.log('2. 图表应该正常渲染')
  console.log('3. 动画效果应该正常工作')
  console.log('4. 访问 http://localhost:3000 查看完整效果')
}

quickTest().catch(console.error)