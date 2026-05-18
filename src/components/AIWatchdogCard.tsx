'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  GitBranch,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Zap,
  ChevronRight,
  RefreshCw,
  FileCode,
  Lightbulb,
  ArrowUpRight,
  Terminal,
  Copy
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/lib/toastContext'

interface HTMLIssue {
  filePath: string
  lineNumber: number
  issue: string
  severity: 'high' | 'medium' | 'low'
  suggestion: string
  codeSnippet: string
  estimatedSavings: string
}

interface WatchdogReport {
  timestamp: string
  repository: string
  genTime: number
  genTimeStatus: 'critical' | 'warning' | 'good'
  totalPayloadSize: string
  analyzedFiles: number
  issues: HTMLIssue[]
  recommendations: string[]
}

interface AIWatchdogCardProps {
  repository?: string
  currentGenTime?: number
  onAnalysisComplete?: (report: WatchdogReport) => void
}

const defaultReport: WatchdogReport = {
  timestamp: new Date().toISOString(),
  repository: 'chaoticallyorganizedai/website',
  genTime: 3740,
  genTimeStatus: 'critical',
  totalPayloadSize: '847.3 KB',
  analyzedFiles: 12,
  issues: [
    {
      filePath: 'index.html',
      lineNumber: 15,
      issue: 'External script blocking render',
      severity: 'high',
      suggestion: 'Add defer or async attribute to non-critical scripts',
      codeSnippet: '<script src="analytics.js"></script>\n<script src="tracking.js"></script>',
      estimatedSavings: '100-500ms'
    },
    {
      filePath: 'index.html',
      lineNumber: 42,
      issue: 'Image without lazy loading',
      severity: 'medium',
      suggestion: 'Add loading="lazy" to images below the fold',
      codeSnippet: '<img src="hero-bg.jpg" alt="Background">\n<img src="feature1.png" alt="Feature">',
      estimatedSavings: '50-100ms'
    },
    {
      filePath: 'about.html',
      lineNumber: 8,
      issue: 'Render-blocking CSS',
      severity: 'high',
      suggestion: 'Consider inlining critical CSS and deferring non-critical styles',
      codeSnippet: '<link rel="stylesheet" href="styles.css">\n<link rel="stylesheet" href="animations.css">',
      estimatedSavings: '100-500ms'
    },
    {
      filePath: 'index.html',
      lineNumber: 127,
      issue: 'Deep DOM nesting detected (4+ levels)',
      severity: 'medium',
      suggestion: 'Flatten DOM structure to improve rendering performance',
      codeSnippet: '<div><div><div><div class="content">...</div></div></div></div>',
      estimatedSavings: '50-100ms'
    },
    {
      filePath: 'contact.html',
      lineNumber: 55,
      issue: 'iframe without lazy loading',
      severity: 'high',
      suggestion: 'Add loading="lazy" to defer iframe loading',
      codeSnippet: '<iframe src="https://maps.google.com/embed?..." width="100%" height="400">',
      estimatedSavings: '100-500ms'
    }
  ],
  recommendations: [
    'Fix 3 high-severity issues to significantly reduce Gen Time',
    'Consider implementing server-side rendering or static site generation',
    'Enable HTTP/2 and resource compression on your server',
    'Bundle multiple scripts to reduce HTTP requests'
  ]
}

const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high':
      return 'text-cyber-red bg-cyber-red/20 border-cyber-red/30'
    case 'medium':
      return 'text-cyber-orange bg-cyber-orange/20 border-cyber-orange/30'
    case 'low':
      return 'text-cyber-yellow bg-cyber-yellow/20 border-cyber-yellow/30'
  }
}

const getGenTimeColor = (status: 'critical' | 'warning' | 'good') => {
  switch (status) {
    case 'critical':
      return 'text-neon-purple-500'
    case 'warning':
      return 'text-cyber-yellow'
    case 'good':
      return 'text-electric-green-500'
  }
}

export default function AIWatchdogCard({
  repository = 'chaoticallyorganizedai/website',
  currentGenTime = 3740,
  onAnalysisComplete
}: AIWatchdogCardProps) {
  const [report, setReport] = useState<WatchdogReport>(defaultReport)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'issues' | 'recommendations'>('issues')
  const [fixedIssues, setFixedIssues] = useState<Set<number>>(new Set())
  const { addToast } = useToast()

  const applyFix = (index: number, issue: HTMLIssue) => {
    navigator.clipboard.writeText(issue.codeSnippet)
    setFixedIssues(prev => new Set([...prev, index]))
    addToast(`Fix applied: ${issue.issue}`, 'success')
    setExpandedIssue(null)
  }

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/watchdog')
      const data = await response.json()
      setReport(data)
      onAnalysisComplete?.(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isGenTimeHigh = report.genTime > 2000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`cyber-card col-span-2 row-span-2 ${
        isGenTimeHigh ? 'border-neon-purple-500/30 shadow-neon-purple' : ''
      }`}
    >
      {/* Header */}
      <div className="cyber-card-header">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isAnalyzing ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: 'linear' }}
            className="p-2 rounded-lg bg-neon-purple-500/20 text-neon-purple-500"
          >
            <Bot className="w-5 h-5" />
          </motion.div>
          <div>
            <h3 className="cyber-card-title">
              AI Watchdog Agent
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              HTML Performance Analyzer
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-purple-500
                   text-white text-sm font-medium hover:bg-neon-purple-600
                   transition-colors disabled:opacity-50 shadow-neon-purple"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </motion.button>
      </div>

      {/* Repository Info */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-cyber-gray rounded-lg border border-cyber-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Repository:</span>
          <span className="text-sm font-mono text-white">{report.repository}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Files:</span>
          <span className="text-sm font-mono text-white">{report.analyzedFiles}</span>
        </div>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Size:</span>
          <span className="text-sm font-mono text-white">{report.totalPayloadSize}</span>
        </div>
      </div>

      {/* Gen Time Alert */}
      <div className={`mb-4 p-4 rounded-lg ${
        isGenTimeHigh
          ? 'bg-neon-purple-500/10 border border-neon-purple-500/30'
          : 'bg-electric-green-500/10 border border-electric-green-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className={`w-5 h-5 ${getGenTimeColor(report.genTimeStatus)}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Generation Time:</span>
                <span className={`text-2xl font-bold font-mono ${getGenTimeColor(report.genTimeStatus)}`}>
                  {report.genTime}ms
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isGenTimeHigh
                  ? 'Above threshold - optimization required'
                  : 'Within acceptable range'}
              </p>
            </div>
          </div>
          {isGenTimeHigh && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neon-purple-500" />
              <span className="text-sm font-medium text-neon-purple-500 uppercase">
                Action Required
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="cyber-stat">
          <div className="flex items-center justify-between">
            <span className="cyber-stat-value text-cyber-red">
              {report.issues.filter(i => i.severity === 'high').length}
            </span>
            <AlertTriangle className="w-5 h-5 text-cyber-red/50" />
          </div>
          <p className="cyber-stat-label">High Priority</p>
        </div>
        <div className="cyber-stat">
          <div className="flex items-center justify-between">
            <span className="cyber-stat-value text-cyber-orange">
              {report.issues.filter(i => i.severity === 'medium').length}
            </span>
            <Zap className="w-5 h-5 text-cyber-orange/50" />
          </div>
          <p className="cyber-stat-label">Medium Priority</p>
        </div>
        <div className="cyber-stat">
          <div className="flex items-center justify-between">
            <span className="cyber-stat-value text-cyber-yellow">
              {report.issues.filter(i => i.severity === 'low').length}
            </span>
            <Lightbulb className="w-5 h-5 text-cyber-yellow/50" />
          </div>
          <p className="cyber-stat-label">Low Priority</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-cyber-border">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'issues'
              ? 'text-neon-purple-500 border-neon-purple-500'
              : 'text-gray-500 border-transparent hover:text-gray-400'
          }`}
        >
          Issues ({report.issues.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'recommendations'
              ? 'text-neon-purple-500 border-neon-purple-500'
              : 'text-gray-500 border-transparent hover:text-gray-400'
          }`}
        >
          Recommendations ({report.recommendations.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'issues' ? (
            <motion.div
              key="issues"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              {report.issues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    expandedIssue === index
                      ? 'bg-cyber-gray border-neon-purple-500/50'
                      : 'bg-cyber-gray/50 border-cyber-border hover:border-cyber-border/80'
                  }`}
                  onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 text-xs font-mono rounded border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-white text-sm">
                          {issue.issue}
                        </h5>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {issue.filePath}:{issue.lineNumber}
                        </p>
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-electric-green-500">
                          ~{issue.estimatedSavings}
                        </span>
                        {fixedIssues.has(index) && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-electric-green-500" />
                        )}
                        <ChevronRight
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          expandedIssue === index ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedIssue === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-cyber-border"
                      >
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-electric-green-500" />
                            <span className="text-xs font-medium text-electric-green-500 uppercase">
                              Suggested Fix
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {issue.suggestion}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Code2 className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              Code Location
                            </span>
                          </div>
                          <pre className="text-xs font-mono bg-cyber-black p-3 rounded border border-cyber-border overflow-x-auto">
                            <code className="text-gray-400">{issue.codeSnippet}</code>
                          </pre>
                        </div>

                        <div className="flex gap-2 mt-3">
                          {!fixedIssues.has(index) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); applyFix(index, issue) }}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded
                                       bg-electric-green-500 text-white hover:bg-electric-green-600 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Apply Fix Automatically
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(issue.codeSnippet); addToast('Code snippet copied', 'success') }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded
                                     bg-neon-purple-500/20 text-neon-purple-500 border border-neon-purple-500/30
                                     hover:bg-neon-purple-500/30 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            Copy Code
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              {report.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-cyber-gray/50 rounded-lg border border-cyber-border"
                >
                  <CheckCircle2 className="w-5 h-5 text-electric-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">{rec}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-cyber-border flex items-center justify-between text-xs text-gray-500">
        <span>Last analysis: {new Date(report.timestamp).toLocaleString()}</span>
        <span className="flex items-center gap-1">
          <Bot className="w-3 h-3" />
          Powered by AI Watchdog
        </span>
      </div>
    </motion.div>
  )
}
