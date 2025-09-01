'use client'

import { useEffect, useState } from 'react'
import { Activity, Users, Database, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface SystemMetrics {
  activeUsers: number
  totalPosts: number
  scheduledPosts: number
  apiRequests: number
  averageResponseTime: number
  errorRate: number
  databaseHealth: 'healthy' | 'warning' | 'critical'
  uptime: number
}

interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  resolved: boolean
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalPosts: 0,
    scheduledPosts: 0,
    apiRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    databaseHealth: 'healthy',
    uptime: 99.9
  })

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      // In production, this would fetch from your monitoring API
      const mockMetrics: SystemMetrics = {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        totalPosts: Math.floor(Math.random() * 1000) + 500,
        scheduledPosts: Math.floor(Math.random() * 100) + 20,
        apiRequests: Math.floor(Math.random() * 5000) + 1000,
        averageResponseTime: Math.floor(Math.random() * 200) + 50,
        errorRate: Math.random() * 0.02, // 0-2%
        databaseHealth: Math.random() > 0.9 ? 'warning' : 'healthy',
        uptime: 99.9 - (Math.random() * 0.1)
      }

      setMetrics(mockMetrics)
      setIsLoading(false)

      // Generate alerts based on metrics
      generateAlerts(mockMetrics)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      setIsLoading(false)
    }
  }

  const generateAlerts = (currentMetrics: SystemMetrics) => {
    const newAlerts: Alert[] = []

    if (currentMetrics.errorRate > 0.01) {
      newAlerts.push({
        id: Date.now().toString(),
        type: 'error',
        message: `High error rate detected: ${(currentMetrics.errorRate * 100).toFixed(2)}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    if (currentMetrics.averageResponseTime > 500) {
      newAlerts.push({
        id: (Date.now() + 1).toString(),
        type: 'warning',
        message: `Slow response time: ${currentMetrics.averageResponseTime}ms`,
        timestamp: new Date(),
        resolved: false
      })
    }

    if (currentMetrics.databaseHealth === 'warning') {
      newAlerts.push({
        id: (Date.now() + 2).toString(),
        type: 'warning',
        message: 'Database performance issues detected',
        timestamp: new Date(),
        resolved: false
      })
    }

    setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)) // Keep last 10 alerts
  }

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ))
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Database className="w-5 h-5 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
          <div className="flex items-center gap-2">
            {getHealthIcon(metrics.databaseHealth)}
            <span className={`text-sm font-medium ${getHealthColor(metrics.databaseHealth)}`}>
              {metrics.databaseHealth.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Users */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-900">{metrics.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last hour</span>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Posts</p>
                <p className="text-2xl font-bold text-green-900">{metrics.totalPosts.toLocaleString()}</p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+5%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          {/* Scheduled Posts */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Scheduled Posts</p>
                <p className="text-2xl font-bold text-purple-900">{metrics.scheduledPosts}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>

          {/* API Requests */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">API Requests</p>
                <p className="text-2xl font-bold text-orange-900">{metrics.apiRequests.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-500 ml-1">from last hour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time & Error Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Average Response Time</span>
              </div>
              <span className={`text-lg font-bold ${metrics.averageResponseTime > 500 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.averageResponseTime}ms
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Error Rate</span>
              </div>
              <span className={`text-lg font-bold ${metrics.errorRate > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                {(metrics.errorRate * 100).toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Uptime</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {metrics.uptime.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500">No active alerts</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'border-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    alert.type === 'success' ? 'border-green-500 bg-green-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        alert.type === 'error' ? 'text-red-800' :
                        alert.type === 'warning' ? 'text-yellow-800' :
                        alert.type === 'success' ? 'text-green-800' :
                        'text-blue-800'
                      }`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Database className="w-4 h-4" />
            Database Health Check
          </button>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Activity className="w-4 h-4" />
            Performance Report
          </button>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Users className="w-4 h-4" />
            User Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

