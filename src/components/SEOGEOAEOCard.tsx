'use client'

import { apiFetch } from '@/lib/apiClient'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Globe,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  MapPin,
  Users,
  Eye,
  Target,
  Sparkles,
  FileText,
  Link2,
  Image,
  Smartphone,
  Zap,
  Copy
} from 'lucide-react'
import type { LighthouseResult } from '@/lib/pagespeed'
import ConfigStatusBadge from './ConfigStatusBadge'
import { useToast } from '@/lib/toastContext'

interface SEOData {
  score: number
  issues: SEOIssue[]
  metrics: {
    titleTag: { status: 'good' | 'warning' | 'error'; value: string }
    metaDescription: { status: 'good' | 'warning' | 'error'; value: string }
    h1Tags: { status: 'good' | 'warning' | 'error'; count: number }
    imageAlts: { status: 'good' | 'warning' | 'error'; missing: number; total: number }
    internalLinks: number
    externalLinks: number
    wordCount: number
    loadTime: number
    mobileReady: boolean
    httpsEnabled: boolean
    robotsTxt: boolean
    sitemap: boolean
  }
}

interface GEOData {
  score: number
  locations: { country: string; percentage: number; city?: string }[]
  languages: { code: string; name: string; percentage: number }[]
  localSEO: {
    googleBusinessProfile: boolean
    localKeywords: string[]
    napConsistency: 'good' | 'warning' | 'error'
  }
}

interface AEOData {
  score: number
  metrics: {
    featuredSnippetReady: boolean
    structuredData: { type: string; valid: boolean }[]
    faqSchema: boolean
    howToSchema: boolean
    voiceSearchOptimized: boolean
    questionKeywords: string[]
    directAnswers: number
  }
}

interface SEOIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'seo' | 'geo' | 'aeo'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  fixInstructions: string
  autoFixAvailable: boolean
}

interface SEOGEOAEOCardProps {
  siteId: string
  siteUrl: string
}

export default function SEOGEOAEOCard({ siteId, siteUrl }: SEOGEOAEOCardProps) {
  const [activeTab, setActiveTab] = useState<'seo' | 'geo' | 'aeo'>('seo')
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [geoData, setGeoData] = useState<GEOData | null>(null)
  const [aeoData, setAeoData] = useState<AEOData | null>(null)
  const [lighthouseData, setLighthouseData] = useState<LighthouseResult | null>(null)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [usingLiveData, setUsingLiveData] = useState(false)
  const { addToast } = useToast()

  const autoFixCode = (issue: SEOIssue) => {
    const fixes: Record<string, string> = {
      'Missing meta description': '<meta name="description" content="Your compelling 150-160 char description here" />',
      'Missing or empty H1 tag': '<h1>Your Primary Page Headline</h1>',
      'Multiple H1 tags': '<!-- Keep only one H1 per page -->\n<!-- Change extra H1s to H2 -->\n<h2>Section Title</h2>',
      'Missing title tag': '<title>Primary Keyword - Site Name | Tagline</title>',
      'Missing image alt attributes': '<img src="photo.jpg" alt="Descriptive text of image content" />',
      'Page has no canonical tag': '<link rel="canonical" href="https://yoursite.com/this-page/" />',
      'Missing or empty Open Graph tags': '<meta property="og:title" content="..." />\n<meta property="og:description" content="..." />\n<meta property="og:image" content="..." />',
      'Page not mobile friendly': '/* Add viewport meta */\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n/* Use responsive CSS */\n@media (max-width: 768px) { ... }',
    }
    const key = Object.keys(fixes).find(k => issue.title.toLowerCase().includes(k.toLowerCase()))
    return key ? fixes[key] : null
  }

  const handleAutoFix = (issue: SEOIssue) => {
    const code = autoFixCode(issue)
    if (code) {
      navigator.clipboard.writeText(code)
      addToast(`Fix copied for: ${issue.title}`, 'success')
    } else {
      addToast(`Manual fix needed: ${issue.fixInstructions}`, 'info')
    }
  }

  const fetchData = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      const [seoResponse, lhResponse] = await Promise.all([
        apiFetch(`/api/analytics/seo?siteId=${siteId}&url=${siteUrl}`),
        apiFetch(`/api/lighthouse?url=${encodeURIComponent(siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))}&strategy=mobile`)
      ])

      if (seoResponse.ok) {
        const data = await seoResponse.json()
        setSeoData(data.seo)
        setGeoData(data.geo)
        setAeoData(data.aeo)
      }

      if (lhResponse.ok) {
        const lhData: LighthouseResult = await lhResponse.json()
        setLighthouseData(lhData)
        if (lhData.categories.performance.score > 0 || lhData.categories.seo.score > 0) {
          setUsingLiveData(true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }, [siteId, siteUrl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-electric-green-500'
    if (score >= 60) return 'text-cyber-yellow'
    return 'text-cyber-red'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-electric-green-500'
    if (score >= 60) return 'bg-cyber-yellow'
    return 'bg-cyber-red'
  }

  const allIssues = [
    ...(seoData?.issues || []),
  ].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 }
    return impactOrder[a.impact] - impactOrder[b.impact]
  })

  const lhSeoScore = lighthouseData?.categories.seo.score

  if (isLoading) {
    return (
      <div className="cyber-card animate-pulse">
        <div className="h-64 bg-cyber-gray rounded" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card"
    >
      {/* Header */}
      <div className="cyber-card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-purple-500/20 text-neon-purple-500">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="cyber-card-title">SEO / GEO / AEO Analytics</h3>
            <p className="text-xs text-gray-500 mt-0.5">Search optimization insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfigStatusBadge live={usingLiveData} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple-500/20
                     text-neon-purple-500 border border-neon-purple-500/30 text-sm font-medium
                     hover:bg-neon-purple-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Analyze
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'seo', label: 'SEO', icon: Search, score: lhSeoScore ?? seoData?.score ?? 0 },
          { id: 'geo', label: 'GEO', icon: Globe, score: geoData?.score || 0 },
          { id: 'aeo', label: 'AEO', icon: MessageSquare, score: aeoData?.score || 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'seo' | 'geo' | 'aeo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                      text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-neon-purple-500 text-white'
                          : 'bg-cyber-gray text-gray-400 hover:text-white border border-cyber-border'
                      }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`text-xs font-mono ${
              activeTab === tab.id ? 'text-white/80' : getScoreColor(tab.score)
            }`}>
              {tab.score}
            </span>
          </button>
        ))}
      </div>

      {/* Lighthouse SEO Score Bar */}
      {lhSeoScore !== undefined && lhSeoScore > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-cyber-gray border border-cyber-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Lighthouse SEO Score</span>
            <span className={`text-sm font-mono font-bold ${getScoreColor(lhSeoScore)}`}>{lhSeoScore}</span>
          </div>
          <div className="h-1.5 bg-cyber-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lhSeoScore}%` }}
              className={`h-full ${getScoreBg(lhSeoScore)}`}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'seo' && seoData && (
          <SEOContent data={seoData} />
        )}
        {activeTab === 'geo' && geoData && (
          <GEOContent data={geoData} />
        )}
        {activeTab === 'aeo' && aeoData && (
          <AEOContent data={aeoData} />
        )}
      </div>

      {/* Issues List */}
      {allIssues.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cyber-border">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Issues to Fix ({allIssues.length})
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {allIssues.slice(0, 5).map((issue) => (
              <motion.div
                key={issue.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  expandedIssue === issue.id
                    ? 'bg-cyber-gray border-neon-purple-500/50'
                    : 'bg-cyber-gray/50 border-cyber-border hover:border-cyber-border/80'
                }`}
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      issue.impact === 'high'
                        ? 'bg-cyber-red/20 text-cyber-red'
                        : issue.impact === 'medium'
                        ? 'bg-cyber-yellow/20 text-cyber-yellow'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {issue.impact.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">{issue.title}</div>
                      <div className="text-xs text-gray-500">{issue.description}</div>
                    </div>
                  </div>
                  {issue.autoFixAvailable && (
                    <span className="px-2 py-0.5 text-[10px] bg-electric-green-500/20 text-electric-green-500 rounded">
                      Auto-fix
                    </span>
                  )}
                </div>

                {expandedIssue === issue.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-cyber-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-neon-purple-500" />
                      <span className="text-xs font-medium text-neon-purple-500 uppercase">How to Fix</span>
                    </div>
                    <p className="text-sm text-gray-300">{issue.fixInstructions}</p>
                    {issue.autoFixAvailable && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAutoFix(issue) }}
                        className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-electric-green-500/20
                                       text-electric-green-500 border border-electric-green-500/30
                                       hover:bg-electric-green-500/30 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Apply Auto-Fix
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function SEOContent({ data }: { data: SEOData }) {
  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className={`text-4xl font-bold font-mono ${
          data.score >= 80 ? 'text-electric-green-500' :
          data.score >= 60 ? 'text-cyber-yellow' : 'text-cyber-red'
        }`}>
          {data.score}
        </div>
        <div className="flex-1">
          <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              className={`h-full ${
                data.score >= 80 ? 'bg-electric-green-500' :
                data.score >= 60 ? 'bg-cyber-yellow' : 'bg-cyber-red'
              }`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">SEO Score</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricItem
          icon={FileText}
          label="Title Tag"
          status={data.metrics.titleTag.status}
        />
        <MetricItem
          icon={FileText}
          label="Meta Desc"
          status={data.metrics.metaDescription.status}
        />
        <MetricItem
          icon={Image}
          label="Image Alts"
          status={data.metrics.imageAlts.status}
          value={`${data.metrics.imageAlts.total - data.metrics.imageAlts.missing}/${data.metrics.imageAlts.total}`}
        />
        <MetricItem
          icon={Smartphone}
          label="Mobile"
          status={data.metrics.mobileReady ? 'good' : 'error'}
        />
        <MetricItem
          icon={Link2}
          label="Internal Links"
          value={data.metrics.internalLinks.toString()}
          status="good"
        />
        <MetricItem
          icon={ExternalLink}
          label="External Links"
          value={data.metrics.externalLinks.toString()}
          status="good"
        />
        <MetricItem
          icon={Zap}
          label="Load Time"
          value={`${data.metrics.loadTime}s`}
          status={data.metrics.loadTime < 3 ? 'good' : data.metrics.loadTime < 5 ? 'warning' : 'error'}
        />
        <MetricItem
          icon={CheckCircle2}
          label="HTTPS"
          status={data.metrics.httpsEnabled ? 'good' : 'error'}
        />
      </div>
    </div>
  )
}

function GEOContent({ data }: { data: GEOData }) {
  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className={`text-4xl font-bold font-mono ${
          data.score >= 80 ? 'text-electric-green-500' :
          data.score >= 60 ? 'text-cyber-yellow' : 'text-cyber-red'
        }`}>
          {data.score}
        </div>
        <div className="flex-1">
          <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              className={`h-full ${
                data.score >= 80 ? 'bg-electric-green-500' :
                data.score >= 60 ? 'bg-cyber-yellow' : 'bg-cyber-red'
              }`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">GEO Score (Local SEO)</p>
        </div>
      </div>

      {/* Top Locations */}
      <div className="bg-cyber-gray rounded-lg p-3 border border-cyber-border">
        <h5 className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Top Visitor Locations
        </h5>
        <div className="space-y-2">
          {data.locations.slice(0, 3).map((loc, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-white">{loc.country}</span>
              <span className="text-sm font-mono text-neon-purple-500">{loc.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Local SEO Status */}
      <div className="grid grid-cols-2 gap-2">
        <MetricItem
          icon={Globe}
          label="Google Business"
          status={data.localSEO.googleBusinessProfile ? 'good' : 'warning'}
        />
        <MetricItem
          icon={Target}
          label="NAP Consistency"
          status={data.localSEO.napConsistency}
        />
      </div>
    </div>
  )
}

function AEOContent({ data }: { data: AEOData }) {
  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className={`text-4xl font-bold font-mono ${
          data.score >= 80 ? 'text-electric-green-500' :
          data.score >= 60 ? 'text-cyber-yellow' : 'text-cyber-red'
        }`}>
          {data.score}
        </div>
        <div className="flex-1">
          <div className="h-2 bg-cyber-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.score}%` }}
              className={`h-full ${
                data.score >= 80 ? 'bg-electric-green-500' :
                data.score >= 60 ? 'bg-cyber-yellow' : 'bg-cyber-red'
              }`}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">AEO Score (Answer Engine)</p>
        </div>
      </div>

      {/* AEO Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricItem
          icon={Sparkles}
          label="Featured Snippet"
          status={data.metrics.featuredSnippetReady ? 'good' : 'warning'}
        />
        <MetricItem
          icon={MessageSquare}
          label="Voice Search"
          status={data.metrics.voiceSearchOptimized ? 'good' : 'warning'}
        />
        <MetricItem
          icon={FileText}
          label="FAQ Schema"
          status={data.metrics.faqSchema ? 'good' : 'warning'}
        />
        <MetricItem
          icon={FileText}
          label="HowTo Schema"
          status={data.metrics.howToSchema ? 'good' : 'warning'}
        />
      </div>

      {/* Question Keywords */}
      {data.metrics.questionKeywords.length > 0 && (
        <div className="bg-cyber-gray rounded-lg p-3 border border-cyber-border">
          <h5 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Question Keywords Optimized
          </h5>
          <div className="flex flex-wrap gap-1">
            {data.metrics.questionKeywords.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-neon-purple-500/20 text-neon-purple-500 rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricItem({
  icon: Icon,
  label,
  status,
  value
}: {
  icon: React.ElementType
  label: string
  status: 'good' | 'warning' | 'error'
  value?: string
}) {
  const statusColors = {
    good: 'text-electric-green-500 bg-electric-green-500/10 border-electric-green-500/30',
    warning: 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/30',
    error: 'text-cyber-red bg-cyber-red/10 border-cyber-red/30'
  }

  return (
    <div className={`p-2 rounded-lg border ${statusColors[status]}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        <span className="text-xs truncate">{label}</span>
      </div>
      {value && <div className="text-sm font-mono mt-1">{value}</div>}
    </div>
  )
}
