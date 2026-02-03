'use client'

import { motion } from 'framer-motion'
import {
  Cpu,
  Activity,
  Bell,
  Settings,
  User,
  Search,
  ChevronDown,
  Zap
} from 'lucide-react'
import SecurityMalwareCard from '@/components/SecurityMalwareCard'
import AnalyticsOverview from '@/components/AnalyticsOverview'
import PerformanceCard from '@/components/PerformanceCard'
import UptimeCard from '@/components/UptimeCard'
import AIWatchdogCard from '@/components/AIWatchdogCard'

export default function Dashboard() {
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

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyber-gray rounded-lg border border-cyber-border w-96">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search modules, metrics, or issues..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <kbd className="px-2 py-0.5 text-xs font-mono text-gray-500 bg-cyber-border rounded">
                ⌘K
              </kbd>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-green-500/10 border border-electric-green-500/30">
                <span className="w-2 h-2 rounded-full bg-electric-green-500 animate-pulse" />
                <span className="text-xs font-medium text-electric-green-500">All Systems Operational</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-cyber-gray transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyber-red" />
              </button>

              {/* Settings */}
              <button className="p-2 rounded-lg hover:bg-cyber-gray transition-colors">
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
              <QuickStat
                icon={Activity}
                label="Uptime"
                value="100%"
                color="text-electric-green-500"
              />
              <QuickStat
                icon={Zap}
                label="Performance"
                value="72/100"
                color="text-neon-purple-500"
              />
              <QuickStat
                icon={Activity}
                label="Response"
                value="280.3ms"
                color="text-neon-purple-500"
              />
              <QuickStat
                icon={Activity}
                label="Bounce Rate"
                value="87.5%"
                color="text-neon-purple-500"
              />
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor security, performance, analytics, and AI-powered insights in real-time
          </p>
        </div>

        {/* High-Density Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-min">
          {/* Security & Malware Card - Takes 2 columns, 2 rows */}
          <div className="lg:col-span-2 lg:row-span-2">
            <SecurityMalwareCard />
          </div>

          {/* Uptime Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            <UptimeCard />
          </div>

          {/* AI Watchdog Card - Takes 2 columns, 2 rows */}
          <div className="lg:col-span-2 lg:row-span-2">
            <AIWatchdogCard />
          </div>

          {/* Performance Card - Takes 2 columns */}
          <div className="lg:col-span-2 xl:col-span-4">
            <PerformanceCard />
          </div>

          {/* Analytics Overview - Takes full width on large, 4 cols on xl */}
          <div className="lg:col-span-4 xl:col-span-6">
            <AnalyticsOverview />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-cyber-border">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Chaotically Organized AI Command Center v1.0.0</span>
              <span>|</span>
              <span>Cyber-Noir Theme</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-neon-purple-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-neon-purple-500 transition-colors">API Status</a>
              <a href="#" className="hover:text-neon-purple-500 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </main>
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
