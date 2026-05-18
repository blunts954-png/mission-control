'use client'

import { Bell, BellDot, X, CheckCheck, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { getNotifications, markAllAsRead, markAsRead, clearNotifications, unreadCount, type Notification } from '@/lib/notifications'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const refresh = () => {
    setNotifications(getNotifications())
    setCount(unreadCount())
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const severityColor: Record<string, string> = {
    critical: 'border-l-cyber-red',
    warning: 'border-l-cyber-yellow',
    info: 'border-l-neon-purple-500'
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg bg-cyber-gray border border-cyber-border text-gray-400 hover:text-white hover:border-neon-purple-500/50 transition-all"
      >
        {count > 0 ? <BellDot className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-cyber-red rounded-full">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm font-medium text-white">Notifications</span>
            <div className="flex items-center gap-2">
              <button onClick={() => { markAllAsRead(); refresh() }} className="text-xs text-gray-400 hover:text-white transition-colors" title="Mark all read">
                <CheckCheck className="w-4 h-4" />
              </button>
              <button onClick={() => { clearNotifications(); refresh() }} className="text-xs text-gray-400 hover:text-white transition-colors" title="Clear all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-l-2 ${severityColor[n.severity]} ${n.read ? 'opacity-60' : ''} hover:bg-gray-800/50 cursor-pointer transition-colors`}
                  onClick={() => { markAsRead(n.id); refresh() }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{n.message}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {new Date(n.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(n.id); refresh() }}
                      className="ml-2 text-gray-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
