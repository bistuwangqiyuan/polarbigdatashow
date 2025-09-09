# 光伏电站智能监控中心

一个现代化的光伏电站数据可视化大屏系统，专为光伏电站运维中心设计，提供实时监控、数据分析和告警管理功能。

## 开发状态

✅ **项目已完成开发并通过所有功能测试**

### 完成情况
- ✅ 项目结构和文件组织 - 100% 完成
- ✅ 前端组件开发 - 100% 完成
- ✅ 数据服务实现 - 100% 完成
- ✅ 实时数据更新机制 - 100% 完成
- ✅ 图表可视化 - 100% 完成
- ✅ 响应式布局 - 100% 完成
- ✅ 动画效果 - 100% 完成
- ✅ 构建测试 - 通过
- ✅ 部署配置 - 完成

## 功能特点

### 核心功能
- **实时数据展示**：显示光伏电站的实时发电功率、累计发电量、收益和CO₂减排量
- **设备状态监控**：实时监控逆变器运行状态、温度、效率等关键参数
- **数据可视化**：使用ECharts实现发电趋势图、效率对比图、电站分布图等
- **告警管理**：实时显示系统告警信息，支持不同级别的告警展示
- **自动数据更新**：支持WebSocket和轮询两种方式实现数据实时更新

### 技术特点
- **响应式设计**：完美适配大屏幕显示，支持不同尺寸的监控大屏
- **动画效果**：使用Framer Motion实现流畅的过渡和动画效果
- **工业化UI**：采用科技蓝配色方案，黑色背景配合发光效果，营造专业的工业化氛围
- **模块化架构**：组件化设计，方便扩展和维护

## 技术栈

- **前端框架**：Next.js 15.5.2 + React 18.3.1
- **UI样式**：TailwindCSS 4.0
- **图表库**：ECharts 5.4.3 + echarts-for-react
- **动画库**：Framer Motion 11.0
- **数据库**：Supabase (PostgreSQL)
- **实时通信**：Supabase Realtime + Socket.io
- **部署平台**：Netlify

## 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- Supabase 账号（用于数据存储）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd solar-dashboard
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **配置环境变量**
创建 `.env.local` 文件并添加以下配置：
```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务角色密钥
```

**注意**：项目已包含示例环境变量，可直接使用进行测试。

4. **初始化数据库**
在Supabase控制台执行 `lib/supabase-init.sql` 中的SQL脚本来创建必要的数据表。

或运行设置脚本查看详细说明：
```bash
node scripts/setup-database.js
```

5. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看大屏效果。

### 测试功能

运行功能测试：
```bash
node scripts/quick-test.js  # 快速测试Web功能
node scripts/test-functionality.js  # 完整功能测试
```

## 项目结构

```
├── app/                      # Next.js 应用目录
│   ├── page.jsx             # 大屏主页面
│   └── layout.jsx           # 根布局
├── components/              # React组件
│   ├── dashboard/           # 大屏专用组件
│   │   ├── DashboardLayout.jsx    # 大屏布局
│   │   ├── DashboardGrid.jsx      # 网格系统
│   │   ├── StatCard.jsx           # 数据卡片
│   │   ├── DeviceStatus.jsx       # 设备状态
│   │   └── AlertPanel.jsx         # 告警面板
│   └── charts/             # 图表组件
│       ├── PowerTrendChart.jsx    # 发电趋势图
│       ├── EfficiencyChart.jsx    # 效率对比图
│       └── StationMap.jsx         # 电站分布图
├── hooks/                   # 自定义Hooks
│   └── useRealtimeData.js  # 实时数据Hook
├── lib/                     # 工具库
│   ├── supabase.js         # Supabase客户端
│   ├── dataService.js      # 数据服务
│   └── supabase-init.sql   # 数据库初始化脚本
├── styles/                  # 样式文件
│   └── globals.css         # 全局样式
└── public/                  # 静态资源
```

## 数据源配置

### Supabase配置
1. 登录Supabase控制台
2. 创建新项目或使用现有项目
3. 在SQL编辑器中执行 `lib/supabase-init.sql` 脚本
4. 启用Realtime功能（已在脚本中配置）
5. 复制项目URL和密钥到环境变量

### 数据表结构
- `solar_stations`：光伏电站基础信息
- `power_generation_realtime`：实时发电数据
- `power_generation_summary`：累计统计数据
- `inverters`：逆变器状态数据
- `alerts`：告警信息

### 模拟数据
系统内置了模拟数据生成功能，会自动每10秒生成一次模拟数据用于演示。在生产环境中，请替换为真实的数据接口。

## 部署指南

### Netlify部署

1. **连接Git仓库**
   - 登录Netlify控制台
   - 点击"New site from Git"
   - 选择你的Git仓库

2. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **设置环境变量**
   在Netlify控制台的Site settings > Environment variables中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **部署**
   推送代码到Git仓库，Netlify会自动构建和部署。

### 自定义域名
在Netlify控制台的Domain settings中可以配置自定义域名。

## 自定义开发

### 添加新的数据卡片
1. 在 `components/dashboard/` 创建新组件
2. 使用 `StatCard` 组件作为基础
3. 在主页面中引入并配置网格位置

### 添加新的图表
1. 在 `components/charts/` 创建新的图表组件
2. 使用 `ReactECharts` 配置图表选项
3. 在 `useRealtimeData` Hook中添加数据获取逻辑

### 修改样式主题
1. 编辑 `styles/globals.css` 中的CSS变量
2. 主要颜色变量：
   - `--color-primary`：主色调（科技蓝）
   - `--color-success`：成功色（绿色）
   - `--color-warning`：警告色（橙色）
   - `--color-danger`：危险色（红色）

## 性能优化

- 使用React.memo优化组件重渲染
- ECharts图表使用canvas渲染器
- 数据更新采用增量更新策略
- 图片和静态资源使用CDN加速

## 测试结果

### 功能测试 ✅
- ✅ Web服务器运行正常
- ✅ 所有页面组件加载成功
- ✅ 实时数据展示功能正常
- ✅ 图表渲染正常
- ✅ 动画效果流畅
- ✅ API端点响应正常

### 构建测试 ✅
- ✅ 依赖安装成功
- ✅ 项目构建成功
- ✅ 无编译错误
- ✅ 生产构建优化完成

### 部署就绪检查 ✅
- ✅ 所有必要文件存在
- ✅ Netlify配置正确
- ✅ 环境变量配置完整
- ✅ 依赖包版本正确

## 注意事项

1. **大屏适配**：系统设计基于1920x1080分辨率，其他分辨率会自动适配
2. **浏览器兼容**：推荐使用Chrome、Edge等现代浏览器
3. **数据安全**：生产环境请妥善保管数据库密钥，不要暴露在客户端代码中
4. **性能监控**：建议配置Netlify Analytics监控系统性能
5. **数据库初始化**：首次使用需要在Supabase控制台执行初始化脚本
6. **模拟数据**：系统会自动生成模拟数据用于演示，生产环境请替换为真实数据接口

## 许可证

MIT License

## 支持与反馈

如有问题或建议，请提交Issue或Pull Request。