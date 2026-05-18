/**
 * Site Configuration for Mission Control Center
 * Supports up to 20 websites with monitoring capabilities
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

// Your 9 websites - Mission Control Center
export const defaultSites: SiteConfig[] = [
  {
    id: 'site-coai-bakersfield',
    name: 'COAI Bakersfield',
    url: 'https://coaibakersfield.com',
    metrics: {
      uptime: 100,
      performance: 78,
      responseTime: 265,
      bounceRate: 65.0,
      genTime: 2200,
      malwareIssues: 0,
      lastScan: '2026-05-17T06:00:00Z'
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
  },
  {
    id: 'site-coai-builds',
    name: 'COAI Builds',
    url: 'https://coaibuilds.com',
    metrics: {
      uptime: 100,
      performance: 80,
      responseTime: 255,
      bounceRate: 58.0,
      genTime: 2000,
      malwareIssues: 0,
      lastScan: '2026-05-17T06:00:00Z'
    }
  },
  {
    id: 'site-tandmbak',
    name: 'T&M Bakery',
    url: 'https://tandmbak.com',
    metrics: {
      uptime: 100,
      performance: 75,
      responseTime: 300,
      bounceRate: 60.0,
      genTime: 2400,
      malwareIssues: 0,
      lastScan: '2026-05-17T06:00:00Z'
    }
  },
  {
    id: 'site-william-dean',
    name: 'William Dean Real Photography',
    url: 'https://williamdeanrealphotography.com',
    metrics: {
      uptime: 100,
      performance: 82,
      responseTime: 230,
      bounceRate: 50.0,
      genTime: 1800,
      malwareIssues: 0,
      lastScan: '2026-05-17T06:00:00Z'
    }
  },
  {
    id: 'site-poison-well',
    name: 'Poison Well Records',
    url: 'https://poisonwellrecords.com',
    metrics: {
      uptime: 100,
      performance: 76,
      responseTime: 280,
      bounceRate: 62.0,
      genTime: 2100,
      malwareIssues: 0,
      lastScan: '2026-05-17T06:00:00Z'
    }
  },
  {
    id: 'site-homegrow-money',
    name: 'HomeGrow Money',
    url: 'https://homegrowmoney.com',
    metrics: {
      uptime: 100,
      performance: 84,
      responseTime: 215,
      bounceRate: 48.0,
      genTime: 1600,
      malwareIssues: 0,
      lastScan: '2026-05-17T06:00:00Z'
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
