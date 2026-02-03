'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import {
  Globe,
  Activity,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Server
} from 'lucide-react'

export interface SiteStatus {
  id: string
  name: string
  url: string
  githubRepo?: string
  netlifyId?: string
  status: 'online' | 'offline' | 'degraded' | 'loading'
  uptime: number
  responseTime: number
  performance: number
  lastDeployStatus?: 'success' | 'failed' | 'building'
  lastDeployTime?: string
  securityIssues: number
  lastChecked: string
}

interface AllSitesOverviewProps {
  onSiteClick?: (siteId: string) => void
}

export default function AllSitesOverview({ onSiteClick }: AllSitesOverviewProps) {
  const [sites, setSites] = useState<SiteStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchAllSitesData = useCallback(async () => {
    try {
      setIsRefreshing(true)

      const response = await fetch('/api/sites/status')

      if (!response.ok) {
        throw new Error('Failed to fetch sites data')
      }

      const data = await response.json()
      setSites(data.sites)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch sites data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAllSitesData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAllSitesData, 30000)
    return () => clearInterval(interval)
  }, [fetchAllSitesData])

  const getStatusColor = (status: SiteStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-electric-green-500'
      case 'offline':
        return 'bg-cyber-red'
      case 'degraded':
        return 'bg-cyber-yellow'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: SiteStatus['status']) => {
    switch (status) {
      case 'online':
        return { text: 'Online', color: 'text-electric-green-500' }
      case 'offline':
        return { text: 'Offline', color: 'text-cyber-red' }
      case 'degraded':
        return { text: 'Degraded', color: 'text-cyber-yellow' }
      default:
        return { text: 'Checking...', color: 'text-gray-500' }
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-electric-green-500'
    if (score >= 80) return 'text-cyber-yellow'
    return 'text-neon-purple-500'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="cyber-card animate-pulse">
            <div className="h-32 bg-cyber-gray rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Sites Overview</h2>
          <p className="text-sm text-gray-500">
            Real-time status of all {sites.length} monitored websites
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAllSitesData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple-500/20
                     text-neon-purple-500 border border-neon-purple-500/30 text-sm font-medium
                     hover:bg-neon-purple-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </motion.button>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sites.map((site, index) => {
          const statusInfo = getStatusText(site.status)

          return (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSiteClick?.(site.id)}
              className={`cyber-card cursor-pointer hover:border-neon-purple-500/50 transition-all ${
                site.status === 'online' ? 'border-electric-green-500/20' : ''
              }`}
            >
              {/* Site Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(site.status)} ${
                    site.status === 'online' ? 'animate-pulse' : ''
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{site.name}</h3>
                    <a
                      href={`https://${site.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-neon-purple-500 transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      {site.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-mono rounded-full border ${
                  site.status === 'online'
                    ? 'bg-electric-green-500/20 text-electric-green-500 border-electric-green-500/30'
                    : site.status === 'offline'
                    ? 'bg-cyber-red/20 text-cyber-red border-cyber-red/30'
                    : 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30'
                }`}>
                  {statusInfo.text}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {/* Uptime */}
                <div className="bg-cyber-gray rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-electric-green-500" />
                  </div>
                  <div className={`text-lg font-bold font-mono ${
                    site.uptime === 100 ? 'text-electric-green-500' : 'text-cyber-yellow'
                  }`}>
                    {site.uptime}%
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Uptime</div>
                </div>

                {/* Response Time */}
                <div className="bg-cyber-gray rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-neon-purple-500" />
                  </div>
                  <div className="text-lg font-bold font-mono text-neon-purple-500">
                    {site.responseTime}
                    <span className="text-[10px] text-gray-500">ms</span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Response</div>
                </div>

                {/* Performance */}
                <div className="bg-cyber-gray rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className={`w-3 h-3 ${getPerformanceColor(site.performance)}`} />
                  </div>
                  <div className={`text-lg font-bold font-mono ${getPerformanceColor(site.performance)}`}>
                    {site.performance}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Perf</div>
                </div>

                {/* Security */}
                <div className="bg-cyber-gray rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Shield className={`w-3 h-3 ${
                      site.securityIssues === 0 ? 'text-electric-green-500' : 'text-cyber-red'
                    }`} />
                  </div>
                  <div className={`text-lg font-bold font-mono ${
                    site.securityIssues === 0 ? 'text-electric-green-500' : 'text-cyber-red'
                  }`}>
                    {site.securityIssues}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Issues</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-cyber-border">
                {/* GitHub */}
                {site.githubRepo && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <GitBranch className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{site.githubRepo.split('/')[1]}</span>
                  </div>
                )}

                {/* Deploy Status */}
                {site.lastDeployStatus && (
                  <div className="flex items-center gap-1 text-xs">
                    {site.lastDeployStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-electric-green-500" />
                        <span className="text-electric-green-500">Deployed</span>
                      </>
                    ) : site.lastDeployStatus === 'building' ? (
                      <>
                        <RefreshCw className="w-3 h-3 text-cyber-yellow animate-spin" />
                        <span className="text-cyber-yellow">Building</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-cyber-red" />
                        <span className="text-cyber-red">Failed</span>
                      </>
                    )}
                  </div>
                )}

                {/* Last Checked */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Server className="w-3 h-3" />
                  <span>Netlify</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="cyber-card text-center">
          <div className="text-3xl font-bold font-mono text-electric-green-500">
            {sites.filter(s => s.status === 'online').length}
          </div>
          <div className="text-xs text-gray-500 uppercase mt-1">Sites Online</div>
        </div>
        <div className="cyber-card text-center">
          <div className="text-3xl font-bold font-mono text-neon-purple-500">
            {sites.length > 0
              ? Math.round(sites.reduce((sum, s) => sum + s.uptime, 0) / sites.length * 10) / 10
              : 0}%
          </div>
          <div className="text-xs text-gray-500 uppercase mt-1">Avg Uptime</div>
        </div>
        <div className="cyber-card text-center">
          <div className="text-3xl font-bold font-mono text-neon-purple-500">
            {sites.length > 0
              ? Math.round(sites.reduce((sum, s) => sum + s.responseTime, 0) / sites.length)
              : 0}
            <span className="text-sm text-gray-500">ms</span>
          </div>
          <div className="text-xs text-gray-500 uppercase mt-1">Avg Response</div>
        </div>
        <div className="cyber-card text-center">
          <div className={`text-3xl font-bold font-mono ${
            sites.reduce((sum, s) => sum + s.securityIssues, 0) === 0
              ? 'text-electric-green-500'
              : 'text-cyber-red'
          }`}>
            {sites.reduce((sum, s) => sum + s.securityIssues, 0)}
          </div>
          <div className="text-xs text-gray-500 uppercase mt-1">Total Issues</div>
        </div>
      </div>
    </div>
  )
}
