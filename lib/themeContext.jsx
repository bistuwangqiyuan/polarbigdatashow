'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const themes = {
  dark: {
    id: 'dark',
    name: '黑色风格',
    primary: '#00d4ff',
    secondary: '#00ff88',
    background: '#000000',
    cardBg: 'rgba(31, 41, 55, 0.5)',
    textPrimary: '#e5e7eb',
    textSecondary: '#9ca3af',
    borderColor: 'rgba(0, 212, 255, 0.3)'
  },
  blue: {
    id: 'blue',
    name: '蓝色风格',
    primary: '#3b82f6',
    secondary: '#60a5fa',
    background: '#0f172a',
    cardBg: 'rgba(30, 58, 138, 0.3)',
    textPrimary: '#e0e7ff',
    textSecondary: '#a5b4fc',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  white: {
    id: 'white',
    name: '白色风格',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    background: '#f8fafc',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    borderColor: 'rgba(14, 165, 233, 0.3)'
  },
  green: {
    id: 'green',
    name: '绿色风格',
    primary: '#10b981',
    secondary: '#34d399',
    background: '#042f2e',
    cardBg: 'rgba(6, 78, 59, 0.4)',
    textPrimary: '#d1fae5',
    textSecondary: '#6ee7b7',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // 从localStorage读取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const applyTheme = (themeName) => {
    const themeConfig = themes[themeName] || themes.dark
    const root = document.documentElement

    // 应用CSS变量
    root.style.setProperty('--color-primary', themeConfig.primary)
    root.style.setProperty('--color-secondary', themeConfig.secondary)
    root.style.setProperty('--color-background', themeConfig.background)
    root.style.setProperty('--color-card-bg', themeConfig.cardBg)
    root.style.setProperty('--color-text-primary', themeConfig.textPrimary)
    root.style.setProperty('--color-text-secondary', themeConfig.textSecondary)
    root.style.setProperty('--color-border', themeConfig.borderColor)

    // 为白色主题添加特殊类
    if (themeName === 'white') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
