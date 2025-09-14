'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '../../lib/themeContext'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showLogs, setShowLogs] = useState(false)
  const { theme, changeTheme, themes } = useTheme()
  const [settings, setSettings] = useState({
    // 通用设置
    siteName: '光伏能源关断管理系统',
    refreshInterval: 10,
    language: 'zh-CN',
    theme: theme || 'dark',
    
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

  // 同步主题初始值
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme
    }))
  }, [theme])

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
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={50}
                height={50}
                className="object-contain"
              />
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

          {/* 用户管理 */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-primary mb-6">用户管理</h2>
              
              <div className="stat-card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg text-neutral-300">系统用户列表</h3>
                  <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
                    + 添加用户
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">用户名</th>
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">姓名</th>
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">角色</th>
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">邮箱</th>
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">状态</th>
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">最后登录</th>
                        <th className="text-center py-3 px-4 text-neutral-400 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { username: 'admin', name: '系统管理员', role: '超级管理员', email: 'admin@example.com', status: '在线', lastLogin: '2025-09-14 10:30' },
                        { username: 'operator1', name: '张三', role: '运维人员', email: 'zhangsan@example.com', status: '在线', lastLogin: '2025-09-14 09:15' },
                        { username: 'operator2', name: '李四', role: '运维人员', email: 'lisi@example.com', status: '离线', lastLogin: '2025-09-13 18:20' },
                        { username: 'viewer1', name: '王五', role: '观察员', email: 'wangwu@example.com', status: '离线', lastLogin: '2025-09-12 14:45' },
                        { username: 'engineer1', name: '赵六', role: '工程师', email: 'zhaoliu@example.com', status: '在线', lastLogin: '2025-09-14 08:50' }
                      ].map((user, index) => (
                        <tr key={index} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-4 text-neutral-300">{user.username}</td>
                          <td className="py-3 px-4 text-neutral-300">{user.name}</td>
                          <td className="py-3 px-4">
                            <span className={`
                              px-2 py-1 rounded-full text-xs
                              ${user.role === '超级管理员' ? 'bg-danger/20 text-danger' : 
                                user.role === '工程师' ? 'bg-primary/20 text-primary' :
                                user.role === '运维人员' ? 'bg-success/20 text-success' :
                                'bg-neutral-700 text-neutral-300'}
                            `}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`
                              flex items-center gap-2
                              ${user.status === '在线' ? 'text-success' : 'text-neutral-500'}
                            `}>
                              <span className={`
                                w-2 h-2 rounded-full
                                ${user.status === '在线' ? 'bg-success' : 'bg-neutral-500'}
                              `}></span>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400 text-sm">{user.lastLogin}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button className="p-1.5 text-primary hover:bg-primary/20 rounded transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button className="p-1.5 text-danger hover:bg-danger/20 rounded transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <p className="text-neutral-400 text-sm">共 5 个用户</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700 transition-colors">上一页</button>
                    <button className="px-3 py-1 bg-primary/20 text-primary rounded">1</button>
                    <button className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700 transition-colors">下一页</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 显示设置 */}
          {activeTab === 'display' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-display text-primary mb-6">显示设置</h2>
              
              <div className="stat-card space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300">启用动画效果</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showAnimations}
                      onChange={(e) => setSettings({...settings, showAnimations: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">图表刷新频率（秒）</label>
                  <input
                    type="number"
                    value={settings.chartRefreshRate}
                    onChange={(e) => setSettings({...settings, chartRefreshRate: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">数据精度（小数位）</label>
                  <select
                    value={settings.decimalPlaces}
                    onChange={(e) => setSettings({...settings, decimalPlaces: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-neutral-900/50 border border-primary/30 rounded-lg text-neutral-200 focus:outline-none focus:border-primary/50"
                  >
                    <option value="0">0位小数</option>
                    <option value="1">1位小数</option>
                    <option value="2">2位小数</option>
                    <option value="3">3位小数</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-2">时间显示格式</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeFormat"
                        value="24h"
                        checked={settings.timeFormat === '24h'}
                        onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
                        className="text-primary"
                      />
                      <span className="text-neutral-300">24小时制</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="timeFormat"
                        value="12h"
                        checked={settings.timeFormat === '12h'}
                        onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
                        className="text-primary"
                      />
                      <span className="text-neutral-300">12小时制</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-4">颜色主题</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'dark', name: '黑色风格', primary: '#00d4ff', secondary: '#00ff88', bg: '#000000' },
                      { id: 'blue', name: '蓝色风格', primary: '#3b82f6', secondary: '#60a5fa', bg: '#1e3a8a' },
                      { id: 'white', name: '白色风格', primary: '#0ea5e9', secondary: '#06b6d4', bg: '#f8fafc' },
                      { id: 'green', name: '绿色风格', primary: '#10b981', secondary: '#34d399', bg: '#064e3b' }
                    ].map(themeItem => (
                      <label key={themeItem.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="colorTheme"
                          value={themeItem.id}
                          checked={theme === themeItem.id}
                          onChange={(e) => {
                            changeTheme(e.target.value);
                            setSettings({...settings, theme: e.target.value})
                          }}
                          className="sr-only"
                        />
                        <div className={`
                          p-4 rounded-lg border-2 transition-all
                          ${theme === themeItem.id ? 'border-primary' : 'border-neutral-700'}
                          hover:border-primary/50
                        `}>
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: themeItem.bg }}
                            >
                              <div 
                                className="w-6 h-6 rounded"
                                style={{ backgroundColor: themeItem.primary }}
                              />
                            </div>
                            <span className="text-neutral-300 font-medium">{themeItem.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <div 
                              className="w-8 h-3 rounded"
                              style={{ backgroundColor: themeItem.primary }}
                            />
                            <div 
                              className="w-8 h-3 rounded"
                              style={{ backgroundColor: themeItem.secondary }}
                            />
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
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
                  <h3 className="text-2xl font-display text-primary mb-2">光伏能源关断管理系统</h3>
                  <p className="text-neutral-400">智能路由关断管理系统 v2.0.0</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-neutral-500 mb-1">系统版本</p>
                    <p className="text-neutral-300">2.0.0 (Build 20250110)</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">发布日期</p>
                    <p className="text-neutral-300">2025年9月10日</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">开发团队</p>
                    <p className="text-neutral-300">国家管网研究总院新能源中心</p>
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
                  <button 
                    onClick={() => setShowLogs(true)}
                    className="px-4 py-2 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    查看日志
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* 日志弹窗 */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-primary/30 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display text-primary">系统运行日志</h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-neutral-400 hover:text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-black/50 rounded-lg p-4 h-[60vh] overflow-y-auto font-mono text-sm">
              <div className="space-y-1">
                <p className="text-neutral-400">[2025-09-14 10:45:32] <span className="text-success">INFO</span>: 系统启动成功</p>
                <p className="text-neutral-400">[2025-09-14 10:45:33] <span className="text-success">INFO</span>: 数据库连接已建立</p>
                <p className="text-neutral-400">[2025-09-14 10:45:34] <span className="text-success">INFO</span>: 光伏发电模块初始化完成</p>
                <p className="text-neutral-400">[2025-09-14 10:45:35] <span className="text-success">INFO</span>: 风力发电模块初始化完成</p>
                <p className="text-neutral-400">[2025-09-14 10:45:36] <span className="text-success">INFO</span>: 储能系统模块初始化完成</p>
                <p className="text-neutral-400">[2025-09-14 10:45:37] <span className="text-warning">WARN</span>: 逆变器INV-003响应延迟 (延迟: 156ms)</p>
                <p className="text-neutral-400">[2025-09-14 10:45:38] <span className="text-success">INFO</span>: 实时数据同步服务已启动</p>
                <p className="text-neutral-400">[2025-09-14 10:46:01] <span className="text-success">INFO</span>: 数据采集周期开始</p>
                <p className="text-neutral-400">[2025-09-14 10:46:02] <span className="text-success">INFO</span>: 光伏阵列数据采集完成 (2000kW)</p>
                <p className="text-neutral-400">[2025-09-14 10:46:03] <span className="text-success">INFO</span>: 风机数据采集完成 (2500kW)</p>
                <p className="text-neutral-400">[2025-09-14 10:46:04] <span className="text-success">INFO</span>: 储能系统数据采集完成 (SOC: 88%)</p>
                <p className="text-neutral-400">[2025-09-14 10:46:05] <span className="text-success">INFO</span>: 数据上传至云端完成</p>
                <p className="text-neutral-400">[2025-09-14 10:46:15] <span className="text-warning">WARN</span>: 光伏区2号组件温度偏高 (45.2°C)</p>
                <p className="text-neutral-400">[2025-09-14 10:46:30] <span className="text-success">INFO</span>: 执行自动清洁程序</p>
                <p className="text-neutral-400">[2025-09-14 10:46:45] <span className="text-success">INFO</span>: 清洁程序完成，效率提升2.3%</p>
                <p className="text-neutral-400">[2025-09-14 10:47:00] <span className="text-danger">ERROR</span>: 风机#2通信中断，尝试重连...</p>
                <p className="text-neutral-400">[2025-09-14 10:47:05] <span className="text-success">INFO</span>: 风机#2重连成功</p>
                <p className="text-neutral-400">[2025-09-14 10:47:30] <span className="text-success">INFO</span>: 系统健康检查通过</p>
                <p className="text-neutral-400">[2025-09-14 10:48:00] <span className="text-success">INFO</span>: 发电效率优化算法执行完成</p>
                <p className="text-neutral-400">[2025-09-14 10:48:15] <span className="text-success">INFO</span>: 储能系统开始充电 (充电功率: 500kW)</p>
                <p className="text-neutral-400">[2025-09-14 10:48:30] <span className="text-success">INFO</span>: 数据备份任务开始</p>
                <p className="text-neutral-400">[2025-09-14 10:48:45] <span className="text-success">INFO</span>: 数据备份完成 (大小: 2.3GB)</p>
                <p className="text-neutral-400">[2025-09-14 10:49:00] <span className="text-success">INFO</span>: 生成日报表</p>
                <p className="text-neutral-400">[2025-09-14 10:49:15] <span className="text-success">INFO</span>: 日报表已发送至管理员邮箱</p>
                <p className="text-neutral-400">[2025-09-14 10:49:30] <span className="text-warning">WARN</span>: 电网电压波动检测 (波动范围: ±2.5%)</p>
                <p className="text-neutral-400">[2025-09-14 10:49:45] <span className="text-success">INFO</span>: 启动电压稳定程序</p>
                <p className="text-neutral-400">[2025-09-14 10:50:00] <span className="text-success">INFO</span>: 电压已稳定</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-4">
              <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors">
                导出日志
              </button>
              <button className="px-4 py-2 bg-danger/20 text-danger border border-danger/30 rounded-lg hover:bg-danger/30 transition-colors">
                清空日志
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}