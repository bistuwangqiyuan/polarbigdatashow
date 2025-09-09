#!/usr/bin/env node

/**
 * Netlify 部署辅助脚本
 * 帮助检查部署前的准备工作
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Netlify 部署准备检查\n');

// 检查函数
function checkItem(name, check, fix = null) {
  try {
    const result = check();
    if (result) {
      console.log(`✅ ${name}`);
      return true;
    } else {
      console.log(`❌ ${name}`);
      if (fix) {
        console.log(`   提示: ${fix}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   错误: ${error.message}`);
    if (fix) {
      console.log(`   提示: ${fix}`);
    }
    return false;
  }
}

// 检查项目
const checks = [];

// 1. 检查 package.json
checks.push(checkItem(
  '检查 package.json',
  () => fs.existsSync(path.join(process.cwd(), 'package.json')),
  '确保在项目根目录运行此脚本'
));

// 2. 检查依赖安装
checks.push(checkItem(
  '检查依赖安装',
  () => fs.existsSync(path.join(process.cwd(), 'node_modules')),
  '运行: npm install 或 pnpm install'
));

// 3. 检查环境变量
checks.push(checkItem(
  '检查环境变量文件',
  () => fs.existsSync(path.join(process.cwd(), '.env.local')),
  '创建 .env.local 文件并添加 Supabase 配置'
));

// 4. 检查 netlify.toml
checks.push(checkItem(
  '检查 netlify.toml',
  () => fs.existsSync(path.join(process.cwd(), 'netlify.toml')),
  '确保 netlify.toml 文件存在'
));

// 5. 尝试构建
console.log('\n📦 测试构建...\n');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ 构建成功！');
  checks.push(true);
} catch (error) {
  console.log('\n❌ 构建失败');
  console.log('   请检查构建错误并修复');
  checks.push(false);
}

// 总结
console.log('\n' + '='.repeat(50));
const passed = checks.filter(c => c).length;
const total = checks.length;

if (passed === total) {
  console.log(`\n🎉 所有检查通过！(${passed}/${total})`);
  console.log('\n您的项目已准备好部署到 Netlify！');
  console.log('\n下一步：');
  console.log('1. 将代码推送到 Git 仓库');
  console.log('2. 在 Netlify 网站连接您的仓库');
  console.log('3. 配置环境变量');
  console.log('4. 点击部署！');
  console.log('\n详细步骤请查看 NETLIFY_DEPLOY_GUIDE.md');
} else {
  console.log(`\n⚠️  部分检查未通过 (${passed}/${total})`);
  console.log('\n请修复上述问题后再进行部署。');
}

// 显示环境变量模板
if (fs.existsSync('.env.local')) {
  console.log('\n📋 环境变量配置提醒：');
  console.log('请在 Netlify 控制台添加以下环境变量：');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
}

console.log('\n' + '='.repeat(50));