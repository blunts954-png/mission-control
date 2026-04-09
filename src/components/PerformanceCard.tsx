'use client'

import { motion } from 'framer-motion'
import {
  Gauge,
  Zap,
  Image,
  FileCode,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'

interface PerformanceMetrics {
  overallScore: number
  loadTime: string
  firstContentfulPaint: string
  largestContentfulPaint: string
  cumulativeLayoutShift: number
  timeToInteractive: string
  imageOptimization: {
    score: number
    totalImages: number
    optimizedImages: number
    potentialSavings: string
    issues: string[]
  }
  cacheHitRate: number
  compressionRatio: string
}

interface PerformanceCardProps {
  siteId?: string
  metrics?: PerformanceMetrics
}

const defaultMetrics: PerformanceMetrics = {
  overallScore: 72,
  loadTime: '2.8s',
  firstContentfulPaint: '1.2s',
  largestContentfulPaint: '2.4s',
  cumulativeLayoutShift: 0.12,
  timeToInteractive: '3.1s',
  imageOptimization: {
    score: 65,
    totalImages: 47,
    optimizedImages: 31,
    potentialSavings: '2.3 MB',
    issues: [
      'Serve images in next-gen formats (WebP, AVIF)',
      'Properly size images for viewport',
      'Enable lazy loading for below-fold images'
    ]
  },
  cacheHitRate: 84,
  compressionRatio: '68%'
}

const getScoreColor = (score: number, threshold: number = 80) => {
  if (score >= 90) return 'text-electric-green-500'
  if (score >= threshold) return 'text-cyber-yellow'
  return 'text-neon-purple-500' // Highlight in purple if under threshold
}

const getScoreBgColor = (score: number, threshold: number = 80) => {
  if (score >= 90) return 'bg-electric-green-500'
  if (score >= threshold) return 'bg-cyber-yellow'
  return 'bg-neon-purple-500' // Highlight in purple if under threshold
}

const ScoreRing = ({ score, size = 120 }: { score: number; size?: number }) => {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const isUnderThreshold = score < 80

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isUnderThreshold ? '#A855F7' : score >= 90 ? '#22C55E' : '#eab308'}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={isUnderThreshold ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' : ''}
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
  status
}: {
  icon: React.ElementType
  label: string
  value: string
  status?: 'good' | 'warning' | 'poor'
}) => {
  const statusColors = {
    good: 'text-electric-green-500',
    warning: 'text-cyber-yellow',
    poor: 'text-cyber-red'
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-cyber-border last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-mono ${status ? statusColors[status] : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

export default function PerformanceCard({ siteId, metrics = defaultMetrics }: PerformanceCardProps) {
  const isUnderThreshold = metrics.overallScore < 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`cyber-card col-span-2 ${
        isUnderThreshold ? 'border-neon-purple-500/30 shadow-neon-purple' : ''
      }`}
    >
      {/* Header */}
      <div className="cyber-card-header">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isUnderThreshold
              ? 'bg-neon-purple-500/20 text-neon-purple-500'
              : 'bg-electric-green-500/20 text-electric-green-500'
          }`}>
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="cyber-card-title">
              Performance Metrics
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Core Web Vitals & Optimization
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-neon-purple-500 hover:text-neon-purple-400 transition-colors">
          Run Audit
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Performance Alert */}
      {isUnderThreshold && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 rounded-lg bg-neon-purple-500/10 border border-neon-purple-500/30"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-neon-purple-500" />
            <span className="text-sm text-neon-purple-500 font-medium">
              Performance score is below 80 - optimization recommended
            </span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center">
          <ScoreRing score={metrics.overallScore} />
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-electric-green-500" />
            <span className="text-xs text-gray-400">+3 from last week</span>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="bg-cyber-gray rounded-lg p-4 border border-cyber-border">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Core Web Vitals
          </h4>
          <div className="space-y-1">
            <MetricItem
              icon={Clock}
              label="Load Time"
              value={metrics.loadTime}
              status="warning"
            />
            <MetricItem
              icon={FileCode}
              label="FCP"
              value={metrics.firstContentfulPaint}
              status="good"
            />
            <MetricItem
              icon={FileCode}
              label="LCP"
              value={metrics.largestContentfulPaint}
              status="warning"
            />
            <MetricItem
              icon={FileCode}
              label="CLS"
              value={metrics.cumulativeLayoutShift.toString()}
              status="warning"
            />
            <MetricItem
              icon={Clock}
              label="TTI"
              value={metrics.timeToInteractive}
              status="poor"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="cyber-stat">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-electric-green-500">
                {metrics.cacheHitRate}%
              </span>
              <HardDrive className="w-4 h-4 text-gray-500" />
            </div>
            <p className="cyber-stat-label">Cache Hit Rate</p>
          </div>
          <div className="cyber-stat">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-neon-purple-500">
                {metrics.compressionRatio}
              </span>
              <Zap className="w-4 h-4 text-gray-500" />
            </div>
            <p className="cyber-stat-label">Compression</p>
          </div>
        </div>
      </div>

      {/* Image Optimization Section */}
      <div className="mt-6 pt-4 border-t border-cyber-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Image className="w-4 h-4" />
            Image Optimization
          </h4>
          <span className={`px-2 py-1 text-xs font-mono rounded-full ${
            metrics.imageOptimization.score < 80
              ? 'bg-neon-purple-500/20 text-neon-purple-500 border border-neon-purple-500/30'
              : 'bg-electric-green-500/20 text-electric-green-500 border border-electric-green-500/30'
          }`}>
            {metrics.imageOptimization.score}/100
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-cyber-gray rounded-lg p-3 border border-cyber-border text-center">
            <div className="text-xl font-bold font-mono text-white">
              {metrics.imageOptimization.totalImages}
            </div>
            <p className="text-xs text-gray-500">Total Images</p>
          </div>
          <div className="bg-cyber-gray rounded-lg p-3 border border-cyber-border text-center">
            <div className="text-xl font-bold font-mono text-electric-green-500">
              {metrics.imageOptimization.optimizedImages}
            </div>
            <p className="text-xs text-gray-500">Optimized</p>
          </div>
          <div className="bg-cyber-gray rounded-lg p-3 border border-cyber-border text-center">
            <div className="text-xl font-bold font-mono text-cyber-red">
              {metrics.imageOptimization.totalImages - metrics.imageOptimization.optimizedImages}
            </div>
            <p className="text-xs text-gray-500">Needs Work</p>
          </div>
          <div className="bg-cyber-gray rounded-lg p-3 border border-cyber-border text-center">
            <div className="text-xl font-bold font-mono text-neon-purple-500">
              {metrics.imageOptimization.potentialSavings}
            </div>
            <p className="text-xs text-gray-500">Potential Save</p>
          </div>
        </div>

        {/* Optimization Issues */}
        <div className="space-y-2">
          {metrics.imageOptimization.issues.map((issue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-2 p-2 rounded bg-cyber-gray/50 border border-cyber-border"
            >
              <AlertCircle className="w-4 h-4 text-neon-purple-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-400">{issue}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
