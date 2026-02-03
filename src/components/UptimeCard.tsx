'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Server,
  Wifi,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Globe
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface UptimeData {
  availability: number
  avgResponseTime: number
  lastIncident: string | null
  checksToday: number
  statusHistory: { date: string; status: 'up' | 'down' | 'degraded' }[]
  monitors: {
    id: string
    name: string
    url: string
    status: 'up' | 'down' | 'paused'
    responseTime: number
    lastChecked: string
  }[]
}

interface UptimeCardProps {
  data?: UptimeData
  betterStackApiKey?: string
}

const defaultData: UptimeData = {
  availability: 100,
  avgResponseTime: 280.3,
  lastIncident: null,
  checksToday: 1440,
  statusHistory: [
    { date: '2026-01-28', status: 'up' },
    { date: '2026-01-29', status: 'up' },
    { date: '2026-01-30', status: 'up' },
    { date: '2026-01-31', status: 'up' },
    { date: '2026-02-01', status: 'up' },
    { date: '2026-02-02', status: 'up' },
    { date: '2026-02-03', status: 'up' }
  ],
  monitors: [
    {
      id: 'mon-001',
      name: 'Main Website',
      url: 'chaoticallyorganizedai.com',
      status: 'up',
      responseTime: 245,
      lastChecked: '2026-02-03T15:30:00Z'
    },
    {
      id: 'mon-002',
      name: 'API Endpoint',
      url: 'api.chaoticallyorganizedai.com',
      status: 'up',
      responseTime: 312,
      lastChecked: '2026-02-03T15:30:00Z'
    },
    {
      id: 'mon-003',
      name: 'Dashboard',
      url: 'dashboard.chaoticallyorganizedai.com',
      status: 'up',
      responseTime: 284,
      lastChecked: '2026-02-03T15:30:00Z'
    }
  ]
}

const getStatusColor = (status: 'up' | 'down' | 'degraded' | 'paused') => {
  switch (status) {
    case 'up':
      return 'bg-electric-green-500'
    case 'down':
      return 'bg-cyber-red'
    case 'degraded':
      return 'bg-cyber-yellow'
    case 'paused':
      return 'bg-gray-500'
  }
}

const getStatusText = (status: 'up' | 'down' | 'paused') => {
  switch (status) {
    case 'up':
      return { text: 'Operational', color: 'text-electric-green-500' }
    case 'down':
      return { text: 'Down', color: 'text-cyber-red' }
    case 'paused':
      return { text: 'Paused', color: 'text-gray-500' }
  }
}

export default function UptimeCard({ data = defaultData }: UptimeCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // In production, this would call the Better Stack API
    // await fetchBetterStackData(betterStackApiKey)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLastRefresh(new Date())
    setIsRefreshing(false)
  }

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const isFullUptime = data.availability === 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`cyber-card ${
        isFullUptime ? 'border-electric-green-500/30 shadow-neon-green' : ''
      }`}
    >
      {/* Header */}
      <div className="cyber-card-header">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isFullUptime
              ? 'bg-electric-green-500/20 text-electric-green-500'
              : 'bg-cyber-yellow/20 text-cyber-yellow'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="cyber-card-title">
              Uptime Monitor
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Better Stack Integration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-cyber-gray border border-cyber-border
                     hover:border-neon-purple-500/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Availability */}
        <div className={`cyber-stat relative overflow-hidden ${
          isFullUptime ? 'border-electric-green-500/30' : ''
        }`}>
          {isFullUptime && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-electric-green-500/5 to-transparent"
            />
          )}
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className={`text-3xl font-bold font-mono ${
                isFullUptime ? 'text-electric-green-500' : 'text-cyber-yellow'
              }`}>
                {data.availability}%
              </span>
              {isFullUptime ? (
                <CheckCircle2 className="w-6 h-6 text-electric-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-cyber-yellow" />
              )}
            </div>
            <p className="cyber-stat-label">Availability</p>
          </div>
        </div>

        {/* Response Time */}
        <div className="cyber-stat">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-mono text-neon-purple-500">
              {data.avgResponseTime}
              <span className="text-sm text-gray-500 ml-1">ms</span>
            </span>
            <Clock className="w-6 h-6 text-neon-purple-500/50" />
          </div>
          <p className="cyber-stat-label">Avg Response</p>
        </div>
      </div>

      {/* Status History */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Last 7 Days
          </span>
          <span className="text-xs text-gray-500">
            {data.checksToday.toLocaleString()} checks today
          </span>
        </div>
        <div className="flex gap-1">
          {data.statusHistory.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`flex-1 h-8 rounded ${getStatusColor(day.status)}`}
              title={`${day.date}: ${day.status.toUpperCase()}`}
            />
          ))}
        </div>
      </div>

      {/* Monitors List */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Active Monitors
        </h4>
        <div className="space-y-2">
          {data.monitors.map((monitor, index) => {
            const status = getStatusText(monitor.status)
            return (
              <motion.div
                key={monitor.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-cyber-gray rounded-lg border border-cyber-border
                         hover:border-cyber-border/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(monitor.status)} ${
                    monitor.status === 'up' ? 'animate-pulse' : ''
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {monitor.name}
                      </span>
                      <span className={`text-xs ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe className="w-3 h-3" />
                      {monitor.url}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-neon-purple-500">
                    {monitor.responseTime}ms
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(monitor.lastChecked).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Last Refresh */}
      <div className="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between text-xs text-gray-500">
        <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
        <a
          href="https://betterstack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-neon-purple-500 hover:text-neon-purple-400 transition-colors"
        >
          Powered by Better Stack
          <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  )
}
