'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown, Settings, Check } from 'lucide-react'
import { SiteConfig } from '@/lib/siteConfig'

interface SiteSelectorProps {
  sites: SiteConfig[]
  activeSite: SiteConfig
  onSelectSite: (site: SiteConfig) => void
  onManageSites: () => void
}

export default function SiteSelector({
  sites,
  activeSite,
  onSelectSite,
  onManageSites
}: SiteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-cyber-gray rounded-lg border border-cyber-border
                 hover:border-neon-purple-500/50 transition-all min-w-[250px]"
      >
        <Globe className="w-4 h-4 text-neon-purple-500" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white truncate max-w-[150px]">
            {activeSite.name}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[150px]">
            {activeSite.url.replace('https://', '')}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-cyber-dark border border-cyber-border
                     rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    onSelectSite(site)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-cyber-gray
                           transition-colors border-b border-cyber-border last:border-0 ${
                             site.id === activeSite.id ? 'bg-neon-purple-500/10' : ''
                           }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    site.metrics?.uptime === 100
                      ? 'bg-electric-green-500'
                      : site.metrics?.uptime && site.metrics.uptime >= 99
                      ? 'bg-cyber-yellow'
                      : 'bg-cyber-red'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">{site.name}</div>
                    <div className="text-xs text-gray-500">
                      {site.url.replace('https://', '')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {site.metrics && (
                      <span className={`text-xs font-mono ${
                        site.metrics.performance >= 80
                          ? 'text-electric-green-500'
                          : 'text-neon-purple-500'
                      }`}>
                        {site.metrics.performance}/100
                      </span>
                    )}
                    {site.id === activeSite.id && (
                      <Check className="w-4 h-4 text-neon-purple-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Manage Sites Button */}
            <button
              onClick={() => {
                onManageSites()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3
                       bg-cyber-gray hover:bg-cyber-border transition-colors
                       border-t border-cyber-border"
            >
              <Settings className="w-4 h-4 text-neon-purple-500" />
              <span className="text-sm text-neon-purple-500 font-medium">
                Manage Sites ({sites.length}/10)
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
