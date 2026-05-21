'use client'

import { useState } from 'react'
import { Key, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { getApiKeys, saveApiKeys, type ApiKeySet } from '@/lib/apiKeys'

const KEY_DEFS: { key: keyof ApiKeySet; label: string; placeholder: string; link?: string }[] = [
  {
    key: 'pagespeed',
    label: 'Google PageSpeed API Key',
    placeholder: 'AIzaSy...',
    link: 'https://developers.google.com/speed/docs/insights/v5/get-started',
  },
  {
    key: 'betterstack',
    label: 'Better Stack Uptime API Key',
    placeholder: 'bst_...',
    link: 'https://betterstack.com/docs/uptime/api/',
  },
  {
    key: 'netlify',
    label: 'Netlify Personal Access Token',
    placeholder: 'nfp_...',
    link: 'https://app.netlify.com/user/applications/personal',
  },
  {
    key: 'github',
    label: 'GitHub Personal Access Token',
    placeholder: 'ghp_...',
    link: 'https://github.com/settings/tokens',
  },
]

export default function ApiKeyManager({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<ApiKeySet>(getApiKeys())
  const [visible, setVisible] = useState<Partial<Record<keyof ApiKeySet, boolean>>>({})
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveApiKeys(keys)
    setSaved(true)
    setTimeout(() => onClose(), 1200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-cyber-dark border border-cyber-border rounded-xl p-6 w-full max-w-lg animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-purple-500/20">
              <Key className="w-5 h-5 text-neon-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">API Keys</h2>
              <p className="text-xs text-gray-500">Keys are stored locally in your browser</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-cyber-gray transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {KEY_DEFS.map(({ key, label, placeholder, link }) => (
            <div key={key}>
              <label className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>{label}</span>
                {link && (
                  <a href={link} target="_blank" rel="noopener noreferrer"
                     className="text-neon-purple-500 hover:underline">
                    Get key
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type={visible[key] ? 'text' : 'password'}
                  value={keys[key]}
                  onChange={e => setKeys({ ...keys, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 pr-10 bg-cyber-black border border-cyber-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple-500 font-mono"
                />
                <button
                  onClick={() => setVisible({ ...visible, [key]: !visible[key] })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {visible[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-cyber-gray border border-cyber-border flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyber-yellow shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">
            Keys are saved to your browser&apos;s localStorage. They are sent as HTTP headers to this app&apos;s API routes and never exposed client-side.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neon-purple-500 text-white hover:bg-neon-purple-600 transition-colors"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Keys'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-cyber-border text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
