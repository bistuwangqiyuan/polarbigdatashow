# 部署指南

## Netlify 部署步骤

### 1. 准备工作
- ✅ 确保代码已提交到 Git 仓库
- ✅ 确保所有测试通过 (`npm run test`)
- ✅ 确保构建成功 (`npm run build`)

### 2. 在 Netlify 上部署

#### 方法一：通过 Git 部署（推荐）
1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 连接你的 Git 仓库（GitHub/GitLab/Bitbucket）
4. 选择要部署的仓库和分支
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

#### 方法二：直接拖拽部署
1. 本地构建项目：`npm run build`
2. 将 `.next` 文件夹拖拽到 Netlify 部署区域

### 3. 配置环境变量
在 Netlify 控制台的 "Site settings" → "Environment variables" 中添加：
```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
```

### 4. 配置域名（可选）
1. 在 "Domain settings" 中配置自定义域名
2. 配置 SSL 证书（Netlify 提供免费 SSL）

### 5. 启用自动部署
- 推送到主分支的代码会自动触发部署
- 可以配置部署预览功能查看 PR 的效果

## 部署前检查清单

运行部署检查脚本：
```bash
npm run check:deploy
```

确保以下项目全部通过：
- [ ] 环境变量配置正确
- [ ] 所有必要文件存在
- [ ] 依赖包安装完整
- [ ] 构建测试通过
- [ ] 功能测试通过

## 部署后验证

1. 访问部署的网站
2. 检查以下功能：
   - [ ] 页面正常加载
   - [ ] 数据展示正常
   - [ ] 图表渲染正常
   - [ ] 动画效果正常
   - [ ] 响应式布局正常

## 常见问题

### 1. 构建失败
- 检查 Node.js 版本是否为 18+
- 检查环境变量是否正确配置
- 查看构建日志定位具体错误

### 2. 页面显示异常
- 检查浏览器控制台错误
- 确认 Supabase 连接正常
- 检查网络请求是否正常

### 3. 数据不更新
- 确认 Supabase 实时订阅已启用
- 检查 API 密钥权限
- 查看浏览器控制台的 WebSocket 连接状态

## 性能优化建议

1. 启用 Netlify 的缓存功能
2. 配置适当的缓存头
3. 使用 Netlify Analytics 监控性能
4. 考虑使用 Netlify Edge Functions 优化数据获取

## 监控和维护

1. 设置 Netlify 构建通知
2. 定期检查构建日志
3. 监控网站可用性
4. 定期更新依赖包