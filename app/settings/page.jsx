'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    // 通用设置
    siteName: '南庄坪风光储充微电网',
    refreshInterval: 10,
    language: 'zh-CN',
    theme: 'dark',
    
    // 告警设置
    enableAlerts: true,
    alertEmail: 'admin@example.com',
    alertThresholds: {
      power: 80,
      temperature: 45,
      efficiency: 85
    },
    
    // 数据设置
    dataRetention: 365,
    exportFormat: 'xlsx',
    autoBackup: true,
    backupInterval: 7,
    
    // 显示设置
    showAnimations: true,
    chartRefreshRate: 5,
    decimalPlaces: 2,
    timeFormat: '24h'
  })

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: '通用设置', icon: '⚙️' },
    { id: 'alerts', label: '告警配置', icon: '🔔' },
    { id: 'data', label: '数据管理', icon: '📊' },
    { id: 'display', label: '显示设置', icon: '🖥️' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'about', label: '关于系统', icon: 'ℹ️' }
  ]

  return (
    <div className="min-h-screen dashboard-bg">
      {/* 顶部导航 */}
      <header className="border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
                ← 返回主页
              </Link>
              <h1 className="text-2xl font-display text-primary glow-text">系统设置</h1>
            </div>
            <button className="px-4 py-2 bg-success/20 text-success border border-success/30 rounded-lg hover:bg-success/30 transition-colors">
              保存更改
            </button>
          </div>
        </div>
      </header>

      <main className="flex h-[calc(100vh-80px)]">
        {/* 侧边栏 */}
        <div className="w-64 border-r border-neutral-800 bg-neutral-900/30">
          <nav className="p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-all duration-300
                  flex items-center gap-3
                  ${activeTab === tab.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* 通用设置 */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-primary mb-6">通用设置</h2>
              
              <div className="stat-card space-y-6">
                <div>
                  <label className="block text-neutral-400 mb-2">站点名称</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">数据刷新间隔（秒）</label>
                  <input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => setSettings({...settings, refreshInterval: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">系统语言</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">界面主题</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={settings.theme === 'dark'}
                        onChange={(e) => setSettings({...settings, theme: e.target.value})}
                        className="text-primary"
                      />
                      <span className="text-neutral-300">深色主题</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={settings.theme === 'light'}
                        onChange={(e) => setSettings({...settings, theme: e.target.value})}
                        className="text-primary"
                      />
                      <span className="text-neutral-300">浅色主题</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 告警配置 */}
          {activeTab === 'alerts' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-primary mb-6">告警配置</h2>
              
              <div className="stat-card space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300">启用告警通知</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableAlerts}
                      onChange={(e) => setSettings({...settings, enableAlerts: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">告警接收邮箱</label>
                  <input
                    type="email"
                    value={settings.alertEmail}
                    onChange={(e) => setSettings({...settings, alertEmail: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-neutral-300 font-medium">告警阈值设置</h3>
                  
                  <div>
                    <label className="block text-neutral-400 mb-2">功率告警阈值 (%)</label>
                    <input
                      type="number"
                      value={settings.alertThresholds?.power || 80}
                      onChange={(e) => handleSettingChange('alertThresholds', 'power', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-2">温度告警阈值 (°C)</label>
                    <input
                      type="number"
                      value={settings.alertThresholds?.temperature || 45}
                      onChange={(e) => handleSettingChange('alertThresholds', 'temperature', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-2">效率告警阈值 (%)</label>
                    <input
                      type="number"
                      value={settings.alertThresholds?.efficiency || 85}
                      onChange={(e) => handleSettingChange('alertThresholds', 'efficiency', parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 数据管理 */}
          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-primary mb-6">数据管理</h2>
              
              <div className="stat-card space-y-6">
                <div>
                  <label className="block text-neutral-400 mb-2">数据保留时长（天）</label>
                  <input
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">导出格式</label>
                  <select
                    value={settings.exportFormat}
                    onChange={(e) => setSettings({...settings, exportFormat: e.target.value})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  >
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                    <option value="json">JSON (.json)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-neutral-300">自动备份</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoBackup}
                      onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">备份间隔（天）</label>
                  <input
                    type="number"
                    value={settings.backupInterval}
                    onChange={(e) => setSettings({...settings, backupInterval: parseInt(e.target.value)})}
                    disabled={!settings.autoBackup}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
                    立即备份
                  </button>
                  <button className="px-4 py-2 bg-warning/20 text-warning border border-warning/30 rounded-lg hover:bg-warning/30 transition-colors">
                    清理旧数据
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 关于系统 */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-primary mb-6">关于系统</h2>
              
              <div className="stat-card space-y-6">
                <div className="text-center py-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-primary mb-2">南庄坪风光储充微电网</h3>
                  <p className="text-neutral-400">智能监控管理系统 v2.0.0</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-neutral-500 mb-1">系统版本</p>
                    <p className="text-neutral-300">2.0.0 (Build 20250110)</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">发布日期</p>
                    <p className="text-neutral-300">2025年1月10日</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">开发团队</p>
                    <p className="text-neutral-300">新能源技术研发中心</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">技术支持</p>
                    <p className="text-neutral-300">support@example.com</p>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-6">
                  <h4 className="text-neutral-300 font-medium mb-3">主要功能</h4>
                  <ul className="space-y-2 text-neutral-400">
                    <li>• 实时监控光伏、风力、储能系统运行状态</li>
                    <li>• 智能告警和故障诊断</li>
                    <li>• 发电量统计和效益分析</li>
                    <li>• 设备管理和维护计划</li>
                    <li>• 历史数据查询和报表导出</li>
                  </ul>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
                    检查更新
                  </button>
                  <button className="px-4 py-2 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors">
                    查看日志
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}