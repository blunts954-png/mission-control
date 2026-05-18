'use client'

import { createContext, useContext } from 'react'

interface ToastMsg { id: string; message: string; type: 'success' | 'error' | 'info' }
interface ToastCtx { addToast: (message: string, type?: ToastMsg['type']) => void }

export const ToastContext = createContext<ToastCtx>({ addToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export type { ToastMsg, ToastCtx }
