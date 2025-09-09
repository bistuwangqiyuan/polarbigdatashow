'use client'

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dashboard-bg flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-danger mb-4">系统错误</h1>
            <p className="text-neutral-400 mb-4">抱歉，系统遇到了一些问题。</p>
            <button
              onClick={() => window.location.reload()}
              className="btn"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}