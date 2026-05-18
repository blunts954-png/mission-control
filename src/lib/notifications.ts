'use client'

import { saveToStorage, loadFromStorage } from './storage'

export interface Notification {
  id: string
  type: 'downtime' | 'ssl_expiry' | 'score_drop' | 'deploy_fail' | 'info'
  siteName: string
  siteUrl: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: string
  read: boolean
}

const NOTIFICATIONS_KEY = 'notifications'
const MAX_NOTIFICATIONS = 50

export function getNotifications(): Notification[] {
  return loadFromStorage<Notification[]>(NOTIFICATIONS_KEY) || []
}

export function addNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  if (typeof window === 'undefined') return
  const existing = getNotifications()
  const newNotif: Notification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false
  }
  existing.unshift(newNotif)
  if (existing.length > MAX_NOTIFICATIONS) existing.length = MAX_NOTIFICATIONS
  saveToStorage(NOTIFICATIONS_KEY, existing)
}

export function markAsRead(id: string): void {
  const notifs = getNotifications()
  const n = notifs.find(n => n.id === id)
  if (n) n.read = true
  saveToStorage(NOTIFICATIONS_KEY, notifs)
}

export function markAllAsRead(): void {
  const notifs = getNotifications()
  notifs.forEach(n => n.read = true)
  saveToStorage(NOTIFICATIONS_KEY, notifs)
}

export function clearNotifications(): void {
  saveToStorage(NOTIFICATIONS_KEY, [])
}

export function unreadCount(): number {
  return getNotifications().filter(n => !n.read).length
}

export function sendBrowserNotification(title: string, body: string): void {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' })
      }
    })
  }
}

export function checkAndNotify(siteName: string, siteUrl: string, status: string, responseTime: number): void {
  if (status === 'offline') {
    addNotification({
      type: 'downtime',
      siteName,
      siteUrl,
      message: `${siteName} is offline!`,
      severity: 'critical'
    })
    sendBrowserNotification(`🚨 Site Down: ${siteName}`, `${siteName} is not responding.`)
    return
  }

  if (status === 'degraded') {
    addNotification({
      type: 'score_drop',
      siteName,
      siteUrl,
      message: `${siteName} is responding slowly (${responseTime}ms)`,
      severity: 'warning'
    })
  }
}

export function notifySSLCert(siteName: string, siteUrl: string, daysRemaining: number): void {
  if (daysRemaining <= 0) {
    addNotification({
      type: 'ssl_expiry',
      siteName,
      siteUrl,
      message: `SSL certificate for ${siteName} has expired!`,
      severity: 'critical'
    })
    sendBrowserNotification(`⚠️ SSL Expired: ${siteName}`, `SSL certificate has expired!`)
  } else if (daysRemaining <= 7) {
    addNotification({
      type: 'ssl_expiry',
      siteName,
      siteUrl,
      message: `SSL certificate for ${siteName} expires in ${daysRemaining} days`,
      severity: 'warning'
    })
    sendBrowserNotification(`⚠️ SSL Expiring: ${siteName}`, `Certificate expires in ${daysRemaining} days.`)
  } else if (daysRemaining <= 14) {
    addNotification({
      type: 'ssl_expiry',
      siteName,
      siteUrl,
      message: `SSL certificate for ${siteName} expires in ${daysRemaining} days`,
      severity: 'info'
    })
  }
}
