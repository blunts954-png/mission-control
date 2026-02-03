'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Cpu,
  Activity,
  Bell,
  Settings,
  User,
  Search,
  ChevronDown,
  Zap,
  Globe,
  Plus,
  X
} from 'lucide-react'
import SecurityMalwareCard from '@/components/SecurityMalwareCard'
import AnalyticsOverview from '@/components/AnalyticsOverview'
import PerformanceCard from '@/components/PerformanceCard'
import UptimeCard from '@/components/UptimeCard'
import AIWatchdogCard from '@/components/AIWatchdogCard'
import SiteSelector from '@/components/SiteSelector'
import { SiteConfig, defaultSites } from '@/lib/siteConfig'

// Client-only time display to prevent hydration mismatch
function ClientTime() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    setTime(new Date().toLocaleString())
    const interval = setInterval(() => {
      setTime(new Date().toLocaleString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return <span>Loading...</span>
  return <span>{time}</span>
}

export default function Dashboard() {
  const [sites, setSites] = useState<SiteConfig[]>(defaultSites)
  const [activeSite, setActiveSite] = useState<SiteConfig>(defaultSites[0])
  const [showSiteManager, setShowSiteManager] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    // Load sites from localStorage
    const savedSites = localStorage.getItem('commandCenterSites')
    if (savedSites) {
      const parsed = JSON.parse(savedSites)
      setSites(parsed)
      setActiveSite(parsed[0])
    }
  }, [])

  const handleAddSite = (site: SiteConfig) => {
    if (sites.length >= 10) {
      alert('Maximum 10 sites allowed')
      return
    }
    const newSites = [...sites, site]
    setSites(newSites)
    localStorage.setItem('commandCenterSites', JSON.stringify(newSites))
  }

  const handleRemoveSite = (siteId: string) => {
    const newSites = sites.filter(s => s.id !== siteId)
    setSites(newSites)
    if (activeSite.id === siteId && newSites.length > 0) {
      setActiveSite(newSites[0])
    }
    localStorage.setItem('commandCenterSites', JSON.stringify(newSites))
  }

  const handleSelectSite = (site: SiteConfig) => {
    setActiveSite(site)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-neon-purple-500 text-xl font-mono">Loading Command Center...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cyber-dark/80 backdrop-blur-lg border-b border-cyber-border">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="p-2 rounded-lg bg-gradient-cyber"
              >
                <Cpu className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Chaotically Organized AI
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-neon-purple-500/20 text-neon-purple-500 border border-neon-purple-500/30">
                    COMMAND CENTER
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Real-time monitoring & AI-powered insights
                </p>
              </div>
            </div>

            {/* Site Selector */}
            <SiteSelector
              sites={sites}
              activeSite={activeSite}
              onSelectSite={handleSelectSite}
              onManageSites={() => setShowSiteManager(true)}
            />

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-green-500/10 border border-electric-green-500/30">
                <span className="w-2 h-2 rounded-full bg-electric-green-500 animate-pulse" />
                <span className="text-xs font-medium text-electric-green-500">All Systems Operational</span>
              </div>

              {/* Sites Count */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple-500/10 border border-neon-purple-500/30">
                <Globe className="w-4 h-4 text-neon-purple-500" />
                <span className="text-xs font-medium text-neon-purple-500">{sites.length}/10 Sites</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-cyber-gray transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyber-red" />
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSiteManager(true)}
                className="p-2 rounded-lg hover:bg-cyber-gray transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-400" />
              </button>

              {/* User Menu */}
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-cyber-gray transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-cyber flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="bg-cyber-dark border-b border-cyber-border">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-cyber-gray border border-cyber-border">
                <Globe className="w-4 h-4 text-neon-purple-500" />
                <span className="text-sm font-mono text-white">{activeSite.name}</span>
              </div>
              <QuickStat
                icon={Activity}
                label="Uptime"
                value={`${activeSite.metrics?.uptime || 100}%`}
                color="text-electric-green-500"
              />
              <QuickStat
                icon={Zap}
                label="Performance"
                value={`${activeSite.metrics?.performance || 72}/100`}
                color={activeSite.metrics?.performance && activeSite.metrics.performance >= 80 ? "text-electric-green-500" : "text-neon-purple-500"}
              />
              <QuickStat
                icon={Activity}
                label="Response"
                value={`${activeSite.metrics?.responseTime || 280.3}ms`}
                color="text-neon-purple-500"
              />
              <QuickStat
                icon={Activity}
                label="Bounce Rate"
                value={`${activeSite.metrics?.bounceRate || 87.5}%`}
                color="text-neon-purple-500"
              />
            </div>
            <div className="text-xs text-gray-500">
              Last updated: <ClientTime />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Dashboard Overview - {activeSite.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor security, performance, analytics, and AI-powered insights for {activeSite.url}
          </p>
        </div>

        {/* High-Density Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-min">
          {/* Security & Malware Card - Takes 2 columns, 2 rows */}
          <div className="lg:col-span-2 lg:row-span-2">
            <SecurityMalwareCard siteId={activeSite.id} siteName={activeSite.name} />
          </div>

          {/* Uptime Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            <UptimeCard
              siteId={activeSite.id}
              siteName={activeSite.name}
              siteUrl={activeSite.url}
            />
          </div>

          {/* AI Watchdog Card - Takes 2 columns, 2 rows */}
          <div className="lg:col-span-2 lg:row-span-2">
            <AIWatchdogCard
              repository={activeSite.githubRepo}
              currentGenTime={activeSite.metrics?.genTime || 3740}
            />
          </div>

          {/* Performance Card - Takes 2 columns */}
          <div className="lg:col-span-2 xl:col-span-4">
            <PerformanceCard siteId={activeSite.id} />
          </div>

          {/* Analytics Overview - Takes full width on large, 4 cols on xl */}
          <div className="lg:col-span-4 xl:col-span-6">
            <AnalyticsOverview siteId={activeSite.id} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-cyber-border">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Chaotically Organized AI Command Center v1.0.0</span>
              <span>|</span>
              <span>Cyber-Noir Theme</span>
              <span>|</span>
              <span>{sites.length} Sites Monitored</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-neon-purple-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-neon-purple-500 transition-colors">API Status</a>
              <a href="#" className="hover:text-neon-purple-500 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Site Manager Modal */}
      {showSiteManager && (
        <SiteManagerModal
          sites={sites}
          onClose={() => setShowSiteManager(false)}
          onAddSite={handleAddSite}
          onRemoveSite={handleRemoveSite}
        />
      )}
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-gray-500">{label}:</span>
      <span className={`text-sm font-mono font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function SiteManagerModal({
  sites,
  onClose,
  onAddSite,
  onRemoveSite
}: {
  sites: SiteConfig[]
  onClose: () => void
  onAddSite: (site: SiteConfig) => void
  onRemoveSite: (siteId: string) => void
}) {
  const [newSite, setNewSite] = useState({
    name: '',
    url: '',
    githubRepo: '',
    netlifyId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSite.name || !newSite.url) return

    onAddSite({
      id: `site-${Date.now()}`,
      name: newSite.name,
      url: newSite.url,
      githubRepo: newSite.githubRepo || undefined,
      netlifyId: newSite.netlifyId || undefined,
      metrics: {
        uptime: 100,
        performance: 72,
        responseTime: 280.3,
        bounceRate: 50,
        genTime: 2000
      }
    })

    setNewSite({ name: '', url: '', githubRepo: '', netlifyId: '' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-cyber-dark border border-cyber-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Manage Sites ({sites.length}/10)</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cyber-gray transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Add New Site Form */}
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-cyber-gray rounded-lg border border-cyber-border">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Add New Site
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Site Name *</label>
              <input
                type="text"
                value={newSite.name}
                onChange={e => setNewSite({ ...newSite, name: e.target.value })}
                placeholder="My Awesome Site"
                className="w-full px-3 py-2 bg-cyber-black border border-cyber-border rounded-lg
                         text-white text-sm focus:outline-none focus:border-neon-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL *</label>
              <input
                type="url"
                value={newSite.url}
                onChange={e => setNewSite({ ...newSite, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-cyber-black border border-cyber-border rounded-lg
                         text-white text-sm focus:outline-none focus:border-neon-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">GitHub Repo (owner/repo)</label>
              <input
                type="text"
                value={newSite.githubRepo}
                onChange={e => setNewSite({ ...newSite, githubRepo: e.target.value })}
                placeholder="username/repository"
                className="w-full px-3 py-2 bg-cyber-black border border-cyber-border rounded-lg
                         text-white text-sm focus:outline-none focus:border-neon-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Netlify Site ID</label>
              <input
                type="text"
                value={newSite.netlifyId}
                onChange={e => setNewSite({ ...newSite, netlifyId: e.target.value })}
                placeholder="abc123-def456"
                className="w-full px-3 py-2 bg-cyber-black border border-cyber-border rounded-lg
                         text-white text-sm focus:outline-none focus:border-neon-purple-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={sites.length >= 10}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-neon-purple-500 text-white
                     rounded-lg font-medium hover:bg-neon-purple-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        </form>

        {/* Sites List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Your Sites
          </h3>
          {sites.map(site => (
            <div
              key={site.id}
              className="flex items-center justify-between p-3 bg-cyber-gray rounded-lg border border-cyber-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-electric-green-500" />
                <div>
                  <div className="text-sm font-medium text-white">{site.name}</div>
                  <div className="text-xs text-gray-500">{site.url}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {site.githubRepo && (
                  <span className="px-2 py-1 text-xs bg-cyber-border rounded text-gray-400">
                    GitHub
                  </span>
                )}
                {site.netlifyId && (
                  <span className="px-2 py-1 text-xs bg-cyber-border rounded text-gray-400">
                    Netlify
                  </span>
                )}
                <button
                  onClick={() => onRemoveSite(site.id)}
                  className="p-1.5 rounded hover:bg-cyber-red/20 text-gray-500 hover:text-cyber-red transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
