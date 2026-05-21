'use client'

import { useEffect, type ReactNode } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function ClientGuard({ children }: { children: ReactNode }) {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (typeof window !== 'undefined' && 'reportError' in navigator) {
        ;(navigator as any).reportError(event.error || event.message)
      }
    }
    const onRejection = (event: PromiseRejectionEvent) => {
      if (typeof window !== 'undefined' && 'reportError' in navigator) {
        ;(navigator as any).reportError(event.reason)
      }
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return <ErrorBoundary>{children}</ErrorBoundary>
}