'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { apiFetch } from '@/lib/apiClient'
import { useState, useEffect, useCallback } from 'react'
import {
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Play,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
  Shield,
  Gauge,
  Search,
  Code2,
  FileCode,
  Wrench
} from 'lucide-react'
import { useToast } from '@/lib/toastContext'

interface Issue {
  id: string
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'code'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  fix: {
    type: 'auto' | 'manual' | 'code'
    instructions: string
    codeSnippet?: string
    filePath?: string
    lineNumber?: number
    estimatedTime: string
  }
  aiSuggestion?: string
}

interface AIFixRecommendationsProps {
  siteId: string
  siteName: string
  siteUrl: string
}

export default function AIFixRecommendations({ siteId, siteName, siteUrl }: AIFixRecommendationsProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set())
  const { addToast } = useToast()

  const handleApplyAutoFix = (issue: Issue) => {
    if (issue.fix.codeSnippet) {
      navigator.clipboard.writeText(issue.fix.codeSnippet)
    }
    setFixedIssues(prev => new Set([...prev, issue.id]))
    addToast(`Auto-fix applied: ${issue.title}`, 'success')
  }

  const fetchIssues = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      const response = await apiFetch(`/api/ai/analyze?siteId=${siteId}&url=${siteUrl}`)
      if (response.ok) {
        const data = await response.json()
        setIssues(data.issues)
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setIsLoading(false)
      setIsAnalyzing(false)
    }
  }, [siteId, siteUrl])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const getCategoryIcon = (category: Issue['category']) => {
    switch (category) {
      case 'performance': return Gauge
      case 'security': return Shield
      case 'seo': return Search
      case 'accessibility': return Zap
      case 'code': return Code2
    }
  }

  const getSeverityColor = (severity: Issue['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-cyber-red/20 text-cyber-red border-cyber-red/30'
      case 'high': return 'bg-cyber-orange/20 text-cyber-orange border-cyber-orange/30'
      case 'medium': return 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30'
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true
    return issue.severity === filter
  })

  const criticalCount = issues.filter(i => i.severity === 'critical').length
  const highCount = issues.filter(i => i.severity === 'high').length

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
          <motion.div
            animate={{ rotate: isAnalyzing ? 360 : 0 }}
            transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: 'linear' }}
            className="p-2 rounded-lg bg-gradient-to-br from-neon-purple-500/20 to-electric-green-500/20 text-neon-purple-500"
          >
            <Bot className="w-5 h-5" />
          </motion.div>
          <div>
            <h3 className="cyber-card-title flex items-center gap-2">
              AI Fix Recommendations
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-neon-purple-500/20 text-neon-purple-500">
                POWERED BY AI
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Intelligent issue detection and fix suggestions
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchIssues}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple-500
                   text-white text-sm font-medium hover:bg-neon-purple-600
                   transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-cyber-gray rounded-lg p-2 text-center border border-cyber-border">
          <div className="text-xl font-bold font-mono text-white">{issues.length}</div>
          <div className="text-[10px] text-gray-500 uppercase">Total Issues</div>
        </div>
        <div className="bg-cyber-gray rounded-lg p-2 text-center border border-cyber-red/30">
          <div className="text-xl font-bold font-mono text-cyber-red">{criticalCount}</div>
          <div className="text-[10px] text-gray-500 uppercase">Critical</div>
        </div>
        <div className="bg-cyber-gray rounded-lg p-2 text-center border border-cyber-orange/30">
          <div className="text-xl font-bold font-mono text-cyber-orange">{highCount}</div>
          <div className="text-[10px] text-gray-500 uppercase">High</div>
        </div>
        <div className="bg-cyber-gray rounded-lg p-2 text-center border border-electric-green-500/30">
          <div className="text-xl font-bold font-mono text-electric-green-500">
            {issues.filter(i => i.fix.type === 'auto').length}
          </div>
          <div className="text-[10px] text-gray-500 uppercase">Auto-Fixable</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['all', 'critical', 'high', 'medium'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-neon-purple-500 text-white'
                : 'bg-cyber-gray text-gray-400 hover:text-white border border-cyber-border'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {filteredIssues.map((issue, index) => {
            const CategoryIcon = getCategoryIcon(issue.category)

            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  expandedIssue === issue.id
                    ? 'bg-cyber-gray border-neon-purple-500/50'
                    : 'bg-cyber-gray/50 border-cyber-border hover:border-cyber-border/80'
                }`}
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              >
                {/* Issue Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded border ${getSeverityColor(issue.severity)}`}>
                      <CategoryIcon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyber-border text-gray-400">
                          {issue.category.toUpperCase()}
                        </span>
                        {issue.fix.type === 'auto' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-electric-green-500/20 text-electric-green-500">
                            AUTO-FIX
                          </span>
                        )}
                      </div>
                      <h5 className="font-medium text-white text-sm">{issue.title}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{issue.description}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
                      expandedIssue === issue.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedIssue === issue.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-cyber-border"
                    >
                      {/* Impact */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3 text-cyber-yellow" />
                          <span className="text-xs font-medium text-cyber-yellow uppercase">Impact</span>
                        </div>
                        <p className="text-sm text-gray-300">{issue.impact}</p>
                      </div>

                      {/* AI Suggestion */}
                      {issue.aiSuggestion && (
                        <div className="mb-3 p-3 rounded-lg bg-neon-purple-500/10 border border-neon-purple-500/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-neon-purple-500" />
                            <span className="text-xs font-medium text-neon-purple-500 uppercase">AI Recommendation</span>
                          </div>
                          <p className="text-sm text-gray-300">{issue.aiSuggestion}</p>
                        </div>
                      )}

                      {/* Fix Instructions */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Wrench className="w-3 h-3 text-electric-green-500" />
                          <span className="text-xs font-medium text-electric-green-500 uppercase">How to Fix</span>
                          <span className="text-xs text-gray-500">({issue.fix.estimatedTime})</span>
                        </div>
                        <p className="text-sm text-gray-300">{issue.fix.instructions}</p>
                      </div>

                      {/* Code Snippet */}
                      {issue.fix.codeSnippet && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <FileCode className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {issue.fix.filePath}
                                {issue.fix.lineNumber && `:${issue.fix.lineNumber}`}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopyCode(issue.fix.codeSnippet!, issue.id)
                              }}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-neon-purple-500 transition-colors"
                            >
                              {copiedCode === issue.id ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-electric-green-500" />
                                  <span className="text-electric-green-500">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-xs font-mono bg-cyber-black p-3 rounded border border-cyber-border overflow-x-auto">
                            <code className="text-gray-300">{issue.fix.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {issue.fix.type === 'auto' && !fixedIssues.has(issue.id) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApplyAutoFix(issue) }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded
                                     bg-electric-green-500 text-white hover:bg-electric-green-600 transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            Apply Auto-Fix
                          </button>
                        )}
                        {fixedIssues.has(issue.id) && (
                          <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-electric-green-500/20 text-electric-green-500">
                            <CheckCircle2 className="w-3 h-3" />
                            Fixed
                          </span>
                        )}
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded
                                   bg-neon-purple-500/20 text-neon-purple-500 border border-neon-purple-500/30
                                   hover:bg-neon-purple-500/30 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Learn More
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredIssues.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-electric-green-500 mx-auto mb-3" />
            <p className="text-gray-400">No issues found in this category!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between text-xs text-gray-500">
        <span>Powered by Chaotically Organized AI</span>
        <span className="flex items-center gap-1">
          <Bot className="w-3 h-3" />
          AI Analysis Engine
        </span>
      </div>
    </motion.div>
  )
}
