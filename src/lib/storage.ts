export interface StorageSnapshot {
  timestamp: string
  data: unknown
}

const STORAGE_PREFIX = 'mcc_'

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    const snapshot: StorageSnapshot = {
      timestamp: new Date().toISOString(),
      data
    }
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(snapshot))
  } catch (e) {
    console.warn('Storage save failed:', e)
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!raw) return null
    const snapshot: StorageSnapshot = JSON.parse(raw)
    return snapshot.data as T
  } catch {
    return null
  }
}

export function appendToHistory(key: string, value: number, maxLength = 30): number[] {
  if (typeof window === 'undefined') return [value]
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}hist_${key}`)
    const history: number[] = raw ? JSON.parse(raw) : []
    history.push(value)
    if (history.length > maxLength) history.shift()
    localStorage.setItem(`${STORAGE_PREFIX}hist_${key}`, JSON.stringify(history))
    return history
  } catch {
    return [value]
  }
}

export function getHistory(key: string): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}hist_${key}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearStorage(): void {
  if (typeof window === 'undefined') return
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX))
  keys.forEach(k => localStorage.removeItem(k))
}
