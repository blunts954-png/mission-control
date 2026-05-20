'use client'

import { useState, useEffect } from 'react'
import {
  Cpu,
  Activity,
  Settings,
  User,
  ChevronDown,
  Globe,
  Plus,
  X,
  LayoutDashboard,
  Layers
} from 'lucide-react'
import AllSitesOverview from '@/components/AllSitesOverview'
import NotificationBell from '@/components/NotificationBell'
import { SiteConfig, defaultSites, saveSites, loadSites, generateSiteId } from '@/lib/siteConfig'

// Lazy-loaded detail view cards
import dynamic from 'next/dynamic'
const SecurityMalwareCard = dynamic(() => import('@/components/SecurityMalwareCard'), { ssr: false })
const PerformanceCard = dynamic(() => import('@/components/PerformanceCard'), { ssr: false })
const UptimeCard = dynamic(() => import('@/components/UptimeCard'), { ssr: false })
const AIWatchdogCard = dynamic(() => import('@/components/AIWatchdogCard'), { ssr: false })
const SEOGEOAEOCard = dynamic(() => import('@/components/SEOGEOAEOCard'), { ssr: false })
const AIFixRecommendations = dynamic(() => import('@/components/AIFixRecommendations'), { ssr: false })
const AnalyticsOverview = dynamic(() => import('@/components/AnalyticsOverview'), { ssr: false })
const SSLCard = dynamic(() => import('@/components/SSLCard'), { ssr: false })

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
  const [sites, setSites] = useState<SiteConfig[]>([])
  const [selectedSite, setSelectedSite] = useState<SiteConfig | null>(null)
  const [showSiteManager, setShowSiteManager] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview')

  // Prevent hydration mismatch + load sites from localStorage
  useEffect(() => {
    setMounted(true)
    setSites(loadSites())
  }, [])

  const handleSiteClick = (siteId: string) => {
    const site = sites.find(s => s.id === siteId)
    if (site) {
      setSelectedSite(site)
      setViewMode('detail')
    }
  }

  const handleBackToOverview = () => {
    setSelectedSite(null)
    setViewMode('overview')
  }

  const handleSitesChange = (updated: SiteConfig[]) => {
    setSites(updated)
    saveSites(updated)
  }

  const mainContent = viewMode === 'overview' ? (
    <AllSitesOverview onSiteClick={handleSiteClick} userSites={sites} />
  ) : selectedSite ? (
    <div>
      {/* Back Button & Site Title */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBackToOverview}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyber-gray border border-cyber-border
                   text-gray-400 hover:text-white hover:border-neon-purple-500/50 transition-colors"
        >
          <Layers className="w-4 h-4" />
          Back to All Sites
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedSite.name}</h2>
          <p className="text-sm text-gray-500">{selectedSite.url}</p>
        </div>
      </div>

      {/* Detail Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-min">
        {/* Security & Malware Card */}
        <div className="lg:col-span-2 lg:row-span-2">
          <SecurityMalwareCard siteId={selectedSite.id} siteName={selectedSite.name} />
        </div>

        {/* Uptime Card */}
        <div className="lg:col-span-2">
          <UptimeCard
            siteId={selectedSite.id}
            siteName={selectedSite.name}
            siteUrl={selectedSite.url}
          />
        </div>

        {/* AI Watchdog Card */}
        <div className="lg:col-span-2 lg:row-span-2">
          <AIWatchdogCard
            repository={selectedSite.githubRepo}
            currentGenTime={selectedSite.metrics?.genTime || 2000}
          />
        </div>

        {/* Performance Card */}
        <div className="lg:col-span-2 xl:col-span-4">
          <PerformanceCard siteId={selectedSite.id} url={selectedSite.url} />
        </div>

        {/* Analytics Overview */}
        <div className="lg:col-span-3">
          <AnalyticsOverview siteId={selectedSite.id} />
        </div>

        {/* SSL Card */}
        <div className="lg:col-span-1">
          <SSLCard hostname={selectedSite.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} />
        </div>

        {/* SEO/GEO/AEO Analytics Card */}
        <div className="lg:col-span-3">
          <SEOGEOAEOCard
            siteId={selectedSite.id}
            siteUrl={selectedSite.url}
          />
        </div>

        {/* AI Fix Recommendations Card */}
        <div className="lg:col-span-3">
          <AIFixRecommendations
            siteId={selectedSite.id}
            siteName={selectedSite.name}
            siteUrl={selectedSite.url}
          />
        </div>
      </div>
    </div>
  ) : null

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-neon-purple-500 border-t-transparent animate-spin-slow" />
          <div className="text-neon-purple-500 text-xl font-mono">Loading Command Center...</div>
        </div>
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
              <div className="p-2 rounded-lg bg-gradient-cyber animate-spin-slow-20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Chaotically Organized AI
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-neon-purple-500/20 text-neon-purple-500 border border-neon-purple-500/30">
                    COMMAND CENTER
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Real-time monitoring for all your websites
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-cyber-gray rounded-lg p-1 border border-cyber-border">
              <button
                onClick={handleBackToOverview}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'overview'
                    ? 'bg-neon-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                All Sites
              </button>
              <button
                onClick={() => selectedSite && setViewMode('detail')}
                disabled={!selectedSite}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  viewMode === 'detail'
                    ? 'bg-neon-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Detail View
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Sites Count */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple-500/10 border border-neon-purple-500/30">
                <Globe className="w-4 h-4 text-neon-purple-500" />
                <span className="text-xs font-medium text-neon-purple-500">{sites.length} Sites</span>
              </div>

              {/* Notifications */}
              <NotificationBell />

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

      {/* Status Bar */}
      <div className="bg-cyber-dark border-b border-cyber-border">
        <div className="max-w-[1920px] mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-electric-green-500 animate-pulse" />
                <span className="text-xs text-electric-green-500 font-medium">Live Monitoring Active</span>
              </div>
              <span className="text-xs text-gray-500">|</span>
              <span className="text-xs text-gray-500">
                Monitoring {sites.length} websites across Netlify
              </span>
            </div>
            <div className="text-xs text-gray-500">
              <ClientTime />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {mainContent}

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-cyber-border">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Chaotically Organized AI Command Center v1.0.0</span>
              <span>|</span>
              <span>Production Ready</span>
              <span>|</span>
              <span>{sites.length} Sites Monitored</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-neon-purple-500 font-medium">Powered by Chaotically Organized AI</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Site Manager Modal */}
      {showSiteManager && (
        <SiteManagerModal
          sites={sites}
          onClose={() => setShowSiteManager(false)}
          onSitesChange={handleSitesChange}
        />
      )}
    </div>
  )
}

function SiteManagerModal({
  sites,
  onClose,
  onSitesChange
}: {
  sites: SiteConfig[]
  onClose: () => void
  onSitesChange: (sites: SiteConfig[]) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [netlifyId, setNetlifyId] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const SITES_LIMIT = 20

  const resetForm = () => {
    setName('')
    setUrl('')
    setGithubRepo('')
    setNetlifyId('')
    setErrors([])
    setEditingId(null)
    setAdding(false)
  }

  const startEdit = (site: SiteConfig) => {
    setEditingId(site.id)
    setName(site.name)
    setUrl(site.url)
    setGithubRepo(site.githubRepo || '')
    setNetlifyId(site.netlifyId || '')
    setAdding(false)
    setErrors([])
  }

  const validate = (): boolean => {
    const errs: string[] = []
    if (!name.trim()) errs.push('Site name is required')
    if (!url.trim()) errs.push('URL is required')
    else {
      try { new URL(url.startsWith('http') ? url : `https://${url}`) }
      catch { errs.push('Invalid URL format') }
    }
    if (githubRepo && !githubRepo.includes('/')) errs.push('GitHub repo must be owner/repo')
    setErrors(errs)
    return errs.length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const finalUrl = url.startsWith('http') ? url : `https://${url}`
    if (editingId) {
      onSitesChange(sites.map(s => s.id === editingId ? { ...s, name: name.trim(), url: finalUrl, githubRepo: githubRepo.trim() || undefined, netlifyId: netlifyId.trim() || undefined } : s))
    } else {
      onSitesChange([...sites, { id: generateSiteId(), name: name.trim(), url: finalUrl, githubRepo: githubRepo.trim() || undefined, netlifyId: netlifyId.trim() || undefined }])
    }
    resetForm()
  }

  const handleDelete = (id: string) => {
    onSitesChange(sites.filter(s => s.id !== id))
    setConfirmDelete(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-cyber-dark border border-cyber-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Site Manager</h2>
            <p className="text-xs text-gray-500 mt-1">{sites.length}/{SITES_LIMIT} sites monitored</p>
          </div>
          <div className="flex items-center gap-2">
            {!adding && !editingId && sites.length < SITES_LIMIT && (
              <button
                onClick={() => { setAdding(true); resetForm(); setAdding(true) }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-electric-green-500/20 text-electric-green-500 border border-electric-green-500/30 hover:bg-electric-green-500/30 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Site
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-cyber-gray transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
          {(adding || editingId) && (
          <div
            className="mb-6 p-4 bg-cyber-gray rounded-lg border border-cyber-border animate-slide-down"
          >
            <h3 className="text-sm font-medium text-white mb-4">{editingId ? 'Edit Site' : 'Add New Site'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 block mb-1">Site Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="My Website"
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple-500"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 block mb-1">URL *</label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">GitHub Repo (optional)</label>
                <input
                  value={githubRepo}
                  onChange={e => setGithubRepo(e.target.value)}
                  placeholder="owner/repo"
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Netlify Site ID (optional)</label>
                <input
                  value={netlifyId}
                  onChange={e => setNetlifyId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple-500"
                />
              </div>
            </div>

            {errors.length > 0 && (
              <div className="mt-3 p-2 rounded bg-cyber-red/10 border border-cyber-red/30">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-cyber-red">{e}</p>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-neon-purple-500 text-white hover:bg-neon-purple-600 transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add Site'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-cyber-border text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sites List */}
        <div className="space-y-2">
          {sites.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No sites added yet. Click "Add Site" to get started.
            </div>
          ) : (
            sites.map(site => (
              <div
                key={site.id}
                className="flex items-center justify-between p-3 bg-cyber-gray rounded-lg border border-cyber-border group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-electric-green-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{site.name}</div>
                    <div className="text-xs text-gray-500 truncate">{site.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {site.githubRepo && (
                    <span className="hidden md:inline px-2 py-0.5 text-[10px] bg-cyber-border rounded text-gray-400">{site.githubRepo.split('/')[1]}</span>
                  )}
                  {confirmDelete === site.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-cyber-red/20 text-cyber-red hover:bg-cyber-red/30 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-cyber-border text-gray-400 hover:text-white transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(site)}
                        className="p-1.5 rounded text-gray-500 hover:text-neon-purple-500 hover:bg-neon-purple-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(site.id)}
                        className="p-1.5 rounded text-gray-500 hover:text-cyber-red hover:bg-cyber-red/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
