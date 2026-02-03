/**
 * Site Configuration for Multi-Site Command Center
 * Supports up to 10 websites with Netlify and GitHub integration
 */

export interface SiteMetrics {
  uptime: number
  performance: number
  responseTime: number
  bounceRate: number
  genTime: number
  malwareIssues?: number
  lastScan?: string
}

export interface SiteConfig {
  id: string
  name: string
  url: string
  githubRepo?: string
  netlifyId?: string
  betterStackId?: string
  metrics?: SiteMetrics
}

// Default sites - your Chaotically Organized AI sites
export const defaultSites: SiteConfig[] = [
  {
    id: 'site-coai-main',
    name: 'Chaotically Organized AI',
    url: 'https://chaoticallyorganizedai.com',
    githubRepo: 'blunts954-png/chaoticallyorganizedai',
    netlifyId: '',
    metrics: {
      uptime: 100,
      performance: 72,
      responseTime: 280.3,
      bounceRate: 87.5,
      genTime: 3740,
      malwareIssues: 3,
      lastScan: '2026-02-03T06:00:00Z'
    }
  }
]

/**
 * Save sites to localStorage
 */
export function saveSites(sites: SiteConfig[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('commandCenterSites', JSON.stringify(sites))
  }
}

/**
 * Load sites from localStorage
 */
export function loadSites(): SiteConfig[] {
  if (typeof window === 'undefined') return defaultSites

  const saved = localStorage.getItem('commandCenterSites')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return defaultSites
    }
  }
  return defaultSites
}

/**
 * Validate site configuration
 */
export function validateSiteConfig(site: Partial<SiteConfig>): string[] {
  const errors: string[] = []

  if (!site.name || site.name.trim().length === 0) {
    errors.push('Site name is required')
  }

  if (!site.url || site.url.trim().length === 0) {
    errors.push('Site URL is required')
  } else {
    try {
      new URL(site.url)
    } catch {
      errors.push('Invalid URL format')
    }
  }

  if (site.githubRepo && !site.githubRepo.includes('/')) {
    errors.push('GitHub repo should be in format: owner/repository')
  }

  return errors
}

/**
 * Generate a unique site ID
 */
export function generateSiteId(): string {
  return `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
