'use client'

import { apiFetch } from '@/lib/apiClient'
import { motion } from 'framer-motion'
import {
  Gauge,
  Zap,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import type { LighthouseResult } from '@/lib/pagespeed'
import TrendChart from './TrendChart'
import ConfigStatusBadge from './ConfigStatusBadge'
import { useToast } from '@/lib/toastContext'
import { saveToStorage, loadFromStorage, appendToHistory, getHistory } from '@/lib/storage'

interface PerformanceCardProps {
  siteId?: string
  url?: string
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-electric-green-500'
  if (score >= 50) return 'text-cyber-yellow'
  return 'text-cyber-red'
}

const getStrokeColor = (score: number) => {
  if (score >= 90) return '#22C55E'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

const vitalsRating = (value: number, displayValue: string, rating: string) => {
  const statusColors: Record<string, string> = {
    good: 'text-electric-green-500',
    'needs-improvement': 'text-cyber-yellow',
    poor: 'text-cyber-red'
  }
  return { color: statusColors[rating] || 'text-gray-400', display: displayValue }
}

const ScoreRing = ({ score, size = 120 }: { score: number; size?: number }) => {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2a2a2a" strokeWidth="8" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className={`text-3xl font-bold font-mono ${getScoreColor(score)}`}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Score</span>
      </div>
    </div>
  )
}

const MetricItem = ({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType
  label: string
  value: string
  color?: string
}) => (
  <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
    <span className={`text-sm font-mono ${color || 'text-white'}`}>{value}</span>
  </div>
)

export default function PerformanceCard({ siteId, url }: PerformanceCardProps) {
  const [lighthouseData, setLighthouseData] = useState<LighthouseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingLiveData, setUsingLiveData] = useState(false)
  const [auditing, setAuditing] = useState(false)
  const [history, setHistory] = useState<number[]>([])
  const [showOpportunities, setShowOpportunities] = useState(false)
  const [shownFx, setShownFx] = useState<string | null>(null)
  const { addToast } = useToast()

  const applyFix = (title: string, code: string) => {
    navigator.clipboard.writeText(code)
    addToast(`Fix copied for: ${title}`, 'success')
    setShownFx(title)
    setTimeout(() => setShownFx(null), 2000)
  }

  const fetchData = useCallback(async (force = false) => {
    if (!url) {
      setLoading(false)
      return
    }
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    try {
      setLoading(true)
      const response = await apiFetch(`/api/lighthouse?url=${encodeURIComponent(cleanUrl)}&strategy=mobile${force ? `&t=${Date.now()}` : ''}`)
      const data: LighthouseResult = await response.json()
      setLighthouseData(data)

      if (data.error && data.error.includes('API key')) {
        setUsingLiveData(false)
      } else if (data.categories.performance.score > 0) {
        setUsingLiveData(true)
        const perfHistory = appendToHistory(`perf_${cleanUrl}`, data.categories.performance.score)
        setHistory(perfHistory)
      } else {
        setUsingLiveData(false)
      }
    } catch {
      setUsingLiveData(false)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (!url) return
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const cached = loadFromStorage<LighthouseResult>(`lighthouse_${cleanUrl}`)
    const savedHistory = getHistory(`perf_${cleanUrl}`)
    setHistory(savedHistory)

    if (cached) {
      setLighthouseData(cached)
      if (cached.categories.performance.score > 0) setUsingLiveData(true)
      setLoading(false)
    }
    fetchData()
  }, [url, fetchData])

  const metrics = lighthouseData?.categories

  if (loading) {
    return (
      <div className="cyber-card col-span-2 animate-pulse">
        <div className="p-4 space-y-4">
          <div className="h-6 w-40 bg-gray-800 rounded" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="cyber-card col-span-2">
        <div className="cyber-card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="cyber-card-title">Performance Metrics</h3>
          </div>
        </div>
        <div className="p-4 text-center text-gray-500">No data — add a site URL</div>
      </div>
    )
  }

  const perfScore = metrics.performance.score
  const isUnderThreshold = perfScore < 80

  const v = (key: 'lcp' | 'fcp' | 'cls' | 'tbt') => {
    if (!lighthouseData?.coreWebVitals) return { display: 'N/A', color: 'text-gray-500' }
    const v = lighthouseData.coreWebVitals[key]
    return vitalsRating(v.value, v.displayValue, v.rating)
  }

  const handleAudit = async () => {
    setAuditing(true)
    await fetchData(true)
    setAuditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`cyber-card col-span-2 ${isUnderThreshold ? 'border-neon-purple-500/30 shadow-neon-purple' : ''}`}
    >
      <div className="cyber-card-header">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isUnderThreshold ? 'bg-neon-purple-500/20 text-neon-purple-500' : 'bg-electric-green-500/20 text-electric-green-500'}`}>
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="cyber-card-title">Performance Metrics</h3>
            <p className="text-xs text-gray-500 mt-0.5">Lighthouse v{lighthouseData?.lighthouseVersion || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfigStatusBadge live={usingLiveData} />
          <button
            onClick={handleAudit}
            disabled={auditing}
            className="flex items-center gap-1 text-xs text-neon-purple-500 hover:text-neon-purple-400 disabled:opacity-50 transition-colors"
          >
            {auditing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
            {auditing ? 'Running...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {lighthouseData?.error && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400">{lighthouseData.error}</span>
          </div>
        </div>
      )}

      {isUnderThreshold && !lighthouseData?.error && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-neon-purple-500/10 border border-neon-purple-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-neon-purple-500" />
            <span className="text-sm text-neon-purple-500 font-medium">Performance score is below 80 — optimization recommended</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 p-4">
        <div className="flex flex-col items-center justify-center">
          <ScoreRing score={perfScore} />
          {history.length >= 2 && (
            <div className="mt-3 flex items-center gap-2">
              <TrendChart data={history} width={72} height={24} />
              <span className="text-xs text-gray-500">{history.length} scans</span>
            </div>
          )}
        </div>

        <div className="bg-cyber-gray rounded-lg p-4 border border-cyber-border">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Core Web Vitals
          </h4>
          <div className="space-y-1">
            <MetricItem icon={Clock} label="FCP" value={v('fcp').display} color={v('fcp').color} />
            <MetricItem icon={Clock} label="LCP" value={v('lcp').display} color={v('lcp').color} />
            <MetricItem icon={Zap} label="CLS" value={`${v('cls').display}`} color={v('cls').color} />
            <MetricItem icon={Zap} label="TBT" value={v('tbt').display} color={v('tbt').color} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="cyber-stat">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold font-mono ${getScoreColor(metrics.accessibility.score)}`}>{metrics.accessibility.score}</span>
              <span className="text-xs text-gray-500">A11Y</span>
            </div>
            <p className="cyber-stat-label">Accessibility</p>
          </div>
          <div className="cyber-stat">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold font-mono ${getScoreColor(metrics.bestPractices.score)}`}>{metrics.bestPractices.score}</span>
              <span className="text-xs text-gray-500">BP</span>
            </div>
            <p className="cyber-stat-label">Best Practices</p>
          </div>
          <div className="cyber-stat">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold font-mono ${getScoreColor(metrics.seo.score)}`}>{metrics.seo.score}</span>
              <span className="text-xs text-gray-500">SEO</span>
            </div>
            <p className="cyber-stat-label">Search Optimization</p>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      {lighthouseData?.opportunities && lighthouseData.opportunities.length > 0 && (
        <div className="mx-4 mb-4">
          <button
            onClick={() => setShowOpportunities(!showOpportunities)}
            className="flex items-center gap-2 text-xs text-neon-purple-500 hover:text-neon-purple-400 transition-colors mb-2"
          >
            <Zap className="w-3 h-3" />
            <span>Lighthouse Opportunities ({lighthouseData.opportunities.length})</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showOpportunities ? 'rotate-180' : ''}`} />
          </button>
          {showOpportunities && (
            <div className="space-y-2">
              {lighthouseData.opportunities.map((opp, i) => {
                const fixCodes: Record<string, string> = {
                  'Enable text compression': '# Apache: Add to .htaccess\n<IfModule mod_deflate.c>\n  AddOutputFilterByType DEFLATE text/html text/css text/javascript\n</IfModule>',
                  'Serve images in next-gen formats': '# Convert images to WebP\n# Using cwebp:\ncwebp -q 80 input.jpg -o output.webp',
                  'Remove render-blocking resources': '<script src="main.js" defer></script>\n<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">',
                  'Properly size images': '<img src="photo.jpg" width="800" height="600" loading="lazy" />',
                  'Defer offscreen images': '<img src="hero.jpg" alt="..." loading="lazy" />\n<img src="gallery/1.jpg" alt="..." loading="lazy" />',
                  'Minimize main-thread work': '// Split long tasks\nsetTimeout(() => {\n  heavyComputation()\n}, 0)',
                  'Reduce JavaScript execution time': '// Code splitting with dynamic import\nconst module = await import("./heavy.js")',
                  'Preconnect to required origins': '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="dns-prefetch" href="https://fonts.googleapis.com">',
                  'Reduce unused CSS': '// Use PurgeCSS in build\n// npx purgecss --css styles.css --content index.html --output cleaned.css',
                  'Reduce unused JavaScript': '// Tree-shake your bundle\n// webpack: optimization.usedExports = true',
                  'Efficient cache policy': '# Cache static assets for 1 year\n<FilesMatch "\.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf)$">\n  Header set Cache-Control "max-age=31536000, public"\n</FilesMatch>',
                  'Minimize CSS': '// Use cssnano in build pipeline\n// npm install cssnano --save-dev',
                  'Minimize JavaScript': '// Use terser for minification\n// npm install terser --save-dev',
                }
                const code = Object.entries(fixCodes).find(([k]) =>
                  opp.title.toLowerCase().includes(k.toLowerCase())
                )?.[1] || `// Fix: ${opp.title}\n// ${opp.description.replace(/<[^>]*>/g, '')}`
                return (
                  <div key={i} className="p-2 bg-cyber-gray/50 rounded border border-cyber-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white">{opp.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-electric-green-500">~{opp.estimatedSavings}</span>
                        <button
                          onClick={() => applyFix(opp.title, code)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-electric-green-500/20 text-electric-green-500 hover:bg-electric-green-500/30 transition-colors"
                        >
                          {shownFx === opp.title ? 'Copied!' : 'Copy Fix'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-cyber-border rounded-full overflow-hidden">
                        <div className="h-full bg-neon-purple-500 rounded-full" style={{ width: `${opp.score}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{Math.round(opp.score)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
