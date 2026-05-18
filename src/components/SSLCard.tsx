'use client'

import { Shield, ShieldCheck, ShieldAlert, Clock, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { SSLInfo } from '@/lib/ssl'
import ConfigStatusBadge from './ConfigStatusBadge'

interface SSLCardProps {
  hostname: string
}

export default function SSLCard({ hostname }: SSLCardProps) {
  const [sslInfo, setSslInfo] = useState<SSLInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingLiveData, setUsingLiveData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSSL() {
      try {
        setLoading(true)
        const response = await fetch(`/api/ssl?hostname=${encodeURIComponent(hostname)}`)
        const data = await response.json()

        if (data.error && !data.hostname) {
          setUsingLiveData(false)
          setError(data.error)
        } else {
          setSslInfo(data)
          setUsingLiveData(true)
        }
      } catch {
        setUsingLiveData(false)
        setError('Failed to fetch SSL data')
      } finally {
        setLoading(false)
      }
    }

    fetchSSL()
  }, [hostname])

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 animate-pulse">
        <div className="h-5 w-24 bg-gray-800 rounded mb-3" />
        <div className="h-8 w-32 bg-gray-800 rounded" />
      </div>
    )
  }

  if (!sslInfo) {
    return null
  }

  const getStatusIcon = () => {
    if (sslInfo.error) return <ShieldAlert className="w-5 h-5 text-yellow-400" />
    if (sslInfo.daysRemaining <= 0) return <ShieldAlert className="w-5 h-5 text-red-400" />
    if (sslInfo.daysRemaining <= 14) return <ShieldAlert className="w-5 h-5 text-yellow-400" />
    return <ShieldCheck className="w-5 h-5 text-green-400" />
  }

  const getStatusColor = () => {
    if (sslInfo.error) return 'text-yellow-400'
    if (sslInfo.daysRemaining <= 0) return 'text-red-400'
    if (sslInfo.daysRemaining <= 14) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getExpiryLabel = () => {
    if (sslInfo.error) return 'Check failed'
    if (sslInfo.daysRemaining <= 0) return 'Expired'
    if (sslInfo.daysRemaining <= 14) return `${sslInfo.daysRemaining} days left`
    return `${sslInfo.daysRemaining} days`
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-300">SSL Certificate</h3>
        </div>
        <ConfigStatusBadge live={usingLiveData} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-lg font-bold ${getStatusColor()}`}>
            {getExpiryLabel()}
          </span>
        </div>

        {sslInfo.issuer && (
          <div className="text-xs text-gray-500">
            Issuer: {sslInfo.issuer}
          </div>
        )}

        {sslInfo.validFrom && sslInfo.validTo && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {new Date(sslInfo.validFrom).toLocaleDateString()} → {new Date(sslInfo.validTo).toLocaleDateString()}
          </div>
        )}

        {sslInfo.protocol && (
          <div className="text-xs text-gray-500">
            Protocol: {sslInfo.protocol}
          </div>
        )}

        {sslInfo.error && (
          <div className="text-xs text-yellow-500/70 mt-1">
            {sslInfo.error}
          </div>
        )}

        <a
          href={`https://${hostname}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1"
        >
          <ExternalLink className="w-3 h-3" />
          Visit site
        </a>
      </div>
    </div>
  )
}
