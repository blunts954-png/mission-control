'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  MousePointer,
  ArrowUpRight,
  Globe,
  Smartphone,
  Monitor,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  bounceRate: number
  pageViews: number
  uniqueVisitors: number
  avgSessionDuration: string
  topPages: { path: string; views: number }[]
  deviceBreakdown: { desktop: number; mobile: number; tablet: number }
  trafficSources: { source: string; percentage: number }[]
}

interface AnalyticsOverviewProps {
  siteId?: string
  data?: AnalyticsData
}

const defaultData: AnalyticsData = {
  bounceRate: 87.5,
  pageViews: 24853,
  uniqueVisitors: 8421,
  avgSessionDuration: '2m 34s',
  topPages: [
    { path: '/', views: 8923 },
    { path: '/dashboard', views: 4521 },
    { path: '/analytics', views: 3287 },
    { path: '/settings', views: 2104 },
    { path: '/reports', views: 1832 }
  ],
  deviceBreakdown: { desktop: 62, mobile: 31, tablet: 7 },
  trafficSources: [
    { source: 'Direct', percentage: 45 },
    { source: 'Organic Search', percentage: 28 },
    { source: 'Social', percentage: 15 },
    { source: 'Referral', percentage: 12 }
  ]
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  highlight = false
}: {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: 'up' | 'down'
  trendValue?: string
  highlight?: boolean
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`cyber-stat relative overflow-hidden ${
      highlight ? 'border-neon-purple-500/50 shadow-neon-purple' : ''
    }`}
  >
    {highlight && (
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple-500/5 to-transparent" />
    )}
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${highlight ? 'text-neon-purple-500' : 'text-gray-500'}`} />
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-electric-green-500' : 'text-cyber-red'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <div className={`cyber-stat-value ${highlight ? 'text-neon-purple-500' : 'text-white'}`}>
        {value}
      </div>
      <p className="cyber-stat-label">{label}</p>
    </div>
  </motion.div>
)

export default function AnalyticsOverview({ siteId, data = defaultData }: AnalyticsOverviewProps) {
  const isBounceRateHigh = data.bounceRate > 70

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="cyber-card col-span-2"
    >
      {/* Header */}
      <div className="cyber-card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-purple-500/20 text-neon-purple-500">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="cyber-card-title">
              Analytics Overview
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time visitor insights
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-neon-purple-500 hover:text-neon-purple-400 transition-colors">
          View Full Report
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={MousePointer}
          label="Bounce Rate"
          value={`${data.bounceRate}%`}
          trend="down"
          trendValue="-2.3%"
          highlight={isBounceRateHigh}
        />
        <StatCard
          icon={Eye}
          label="Page Views"
          value={data.pageViews.toLocaleString()}
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          icon={Users}
          label="Unique Visitors"
          value={data.uniqueVisitors.toLocaleString()}
          trend="up"
          trendValue="+8.2%"
        />
        <StatCard
          icon={Clock}
          label="Avg. Session"
          value={data.avgSessionDuration}
          trend="down"
          trendValue="-15s"
        />
      </div>

      {/* Bounce Rate Alert */}
      {isBounceRateHigh && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-lg bg-neon-purple-500/10 border border-neon-purple-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neon-purple-500/20">
              <Activity className="w-5 h-5 text-neon-purple-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neon-purple-500 mb-1">
                High Bounce Rate Detected
              </h4>
              <p className="text-xs text-gray-400">
                Your bounce rate of <span className="text-neon-purple-500 font-mono font-bold">{data.bounceRate}%</span> is
                above the recommended threshold of 70%. Consider optimizing page load times,
                improving content relevance, and enhancing call-to-action visibility.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="bg-cyber-gray rounded-lg p-4 border border-cyber-border">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Top Pages
          </h4>
          <div className="space-y-2">
            {data.topPages.map((page, index) => (
              <motion.div
                key={page.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 w-4">
                    {index + 1}.
                  </span>
                  <span className="text-sm text-white font-mono truncate max-w-[150px]">
                    {page.path}
                  </span>
                </div>
                <span className="text-sm text-neon-purple-500 font-mono">
                  {page.views.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Device & Traffic Breakdown */}
        <div className="space-y-4">
          {/* Device Breakdown */}
          <div className="bg-cyber-gray rounded-lg p-4 border border-cyber-border">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Device Breakdown
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-neon-purple-500" />
                <span className="text-xs text-gray-400">Desktop</span>
                <span className="text-sm font-mono text-white">{data.deviceBreakdown.desktop}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-electric-green-500" />
                <span className="text-xs text-gray-400">Mobile</span>
                <span className="text-sm font-mono text-white">{data.deviceBreakdown.mobile}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyber-yellow" />
                <span className="text-xs text-gray-400">Tablet</span>
                <span className="text-sm font-mono text-white">{data.deviceBreakdown.tablet}%</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-2 bg-cyber-border rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.deviceBreakdown.desktop}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-neon-purple-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.deviceBreakdown.mobile}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                className="h-full bg-electric-green-500"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.deviceBreakdown.tablet}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="h-full bg-cyber-yellow"
              />
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-cyber-gray rounded-lg p-4 border border-cyber-border">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              Traffic Sources
            </h4>
            <div className="space-y-2">
              {data.trafficSources.map((source, index) => (
                <div key={source.source} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-24 truncate">{source.source}</span>
                  <div className="flex-1 h-2 bg-cyber-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${source.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-neon-purple-500 to-neon-purple-600"
                    />
                  </div>
                  <span className="text-xs font-mono text-white w-10 text-right">
                    {source.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
