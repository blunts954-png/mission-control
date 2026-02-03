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

// Your 4 websites - Chaotically Organized AI Command Center
export const defaultSites: SiteConfig[] = [
  {
    id: 'site-coai-main',
    name: 'Chaotically Organized AI',
    url: 'https://chaoticallyorganizedai.com',
    githubRepo: 'blunts954-png/chaoticallyorganizedai-website',
    netlifyId: '922987db-6746-4513-b3a4-a7059e7141f5',
    metrics: {
      uptime: 100,
      performance: 72,
      responseTime: 280.3,
      bounceRate: 87.5,
      genTime: 3740,
      malwareIssues: 3,
      lastScan: '2026-02-03T06:00:00Z'
    }
  },
  {
    id: 'site-phils-cheesesteaks',
    name: "Phil's Cheesesteaks & More",
    url: 'https://phils-cheesesteaks-and-more.com',
    githubRepo: 'blunts954-png/phillycheesesteak',
    netlifyId: '5a51b258-ff08-4aea-9dbc-d0dfea340c0e',
    metrics: {
      uptime: 100,
      performance: 85,
      responseTime: 245.0,
      bounceRate: 45.2,
      genTime: 1850,
      malwareIssues: 0,
      lastScan: '2026-02-03T06:00:00Z'
    }
  },
  {
    id: 'site-edwin-ward',
    name: 'Edwin Ward Consulting',
    url: 'https://edwinwardconsulting.com',
    githubRepo: 'blunts954-png/edwin',
    netlifyId: 'eebbde7c-0d52-4a08-86c4-8fbcdeabd101',
    metrics: {
      uptime: 100,
      performance: 88,
      responseTime: 198.5,
      bounceRate: 38.7,
      genTime: 1420,
      malwareIssues: 0,
      lastScan: '2026-02-03T06:00:00Z'
    }
  },
  {
    id: 'site-dffb-senior',
    name: 'DFFB Senior Living',
    url: 'https://dffbseniorliving.com',
    githubRepo: 'blunts954-png/dffb',
    netlifyId: '41483bef-df11-4fe8-b9f9-446f570b5986',
    metrics: {
      uptime: 100,
      performance: 82,
      responseTime: 265.0,
      bounceRate: 52.3,
      genTime: 2100,
      malwareIssues: 0,
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
