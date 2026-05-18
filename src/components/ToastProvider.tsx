'use client'

import { useState, useCallback } from 'react'
import { ToastContext } from '@/lib/toastContext'

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `t-${Date.now()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-2xl text-sm font-medium animate-slide-up border ${
            t.type === 'success' ? 'bg-electric-green-500/90 text-white border-electric-green-400' :
            t.type === 'error' ? 'bg-cyber-red/90 text-white border-cyber-red' :
            'bg-neon-purple-500/90 text-white border-neon-purple-400'
          }`}>{t.message}</div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </ToastContext.Provider>
  )
}
