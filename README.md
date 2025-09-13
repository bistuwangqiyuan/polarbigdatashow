# 南庄坪风光储充微电网智能监控中心

一个高端大气的风光储充微电网数据可视化大屏系统，采用3D展示技术和现代化UI设计，专为新能源微电网运维中心设计，提供实时监控、数据分析、设备管理和智能告警功能。

## 开发状态

✅ **项目已完成界面升级和功能增强** (最后更新: 2025-01-13)

### 完成情况
- ✅ 高端界面设计 - 100% 完成（3D展示、渐变、光效）
- ✅ 中央3D展示区 - 100% 完成（光伏、风机、储能、充电桩模型）
- ✅ 辅助页面开发 - 100% 完成（设备管理、数据分析、历史趋势、系统设置）
- ✅ 数据服务实现 - 100% 完成
- ✅ 实时数据更新机制 - 100% 完成 (支持Supabase Realtime订阅)
- ✅ 图表可视化 - 100% 完成 (使用ECharts实现)
- ✅ 响应式布局 - 100% 完成
- ✅ 动画效果 - 100% 完成 (使用Framer Motion)
- ✅ 测试数据导入 - 100% 完成
- ✅ 构建测试 - 通过 (9.1秒构建成功)
- ✅ 部署配置 - 完成 (Netlify配置就绪)

## 功能特点

### 核心功能
- **3D中央展示**：创新的3D可视化展示光伏、风机、储能设备和充电桩，实时显示能量流动
- **实时数据监控**：昨日/今日电量对比、电池储量、风光储充数据统计、累计收益展示
- **设备管理中心**：全面的设备列表、状态监控、性能指标、故障诊断和维护提醒
- **数据分析平台**：发电量趋势、效率分析、能源构成、负荷热力图等多维度数据分析
- **历史数据查询**：长期趋势分析、同比环比增长、历史记录导出、数据统计报表
- **系统设置管理**：灵活的告警配置、数据管理、显示设置和用户权限管理

### 界面特色
- **高端视觉设计**：深色科技感背景、渐变效果、发光边框、霓虹文字效果
- **3D动画效果**：设备3D模型展示、能量流动动画、数据连接线动效
- **响应式布局**：完美适配1920x1080及以上分辨率的大屏显示
- **平滑过渡动画**：使用Framer Motion实现流畅的页面切换和组件动画
- **实时数据更新**：WebSocket实时推送，数据变化时有视觉反馈

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

### 测试数据
系统已包含完整的测试数据集，包括：
- 4个电站（2个光伏电站 + 2个风电场）
- 7个逆变器设备（含离线设备）
- 实时发电数据和历史统计数据
- 储能系统和充电桩数据
- 不同级别的告警信息

使用以下命令初始化测试数据：
```bash
node scripts/init-test-data.js
```

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

### 功能测试 ✅ (2025-01-13)
- ✅ 主页面3D展示中心正常
- ✅ 设备管理页面功能完整
- ✅ 数据分析页面图表正常
- ✅ 历史趋势查询功能正常
- ✅ 系统设置页面功能完整
- ✅ API端点响应正常
- ✅ 实时数据更新正常
- ✅ 动画效果流畅

### 构建测试 ✅ (2025-01-13)
- ✅ 依赖安装成功
- ✅ 项目构建成功 (9.1秒)
- ✅ 无编译错误
- ✅ 生产构建优化完成
- ✅ 静态页面生成成功 (9/9)

### 界面升级 ✅ (2025-01-13)
- ✅ 中央3D展示区域实现
- ✅ 高端视觉效果添加
- ✅ 导航菜单集成
- ✅ 所有辅助页面开发完成
- ✅ 响应式布局优化

### 部署就绪检查 ✅ (2025-01-10)
- ✅ 所有必要文件存在
- ✅ Netlify配置正确
- ✅ 环境变量配置完整
- ✅ 依赖包版本正确
- ✅ 所有核心组件都已实现

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