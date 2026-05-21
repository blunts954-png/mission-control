import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Your 9 sites configuration
const SITES_CONFIG = [
  {
    id: 'site-coai-bakersfield',
    name: 'COAI Bakersfield',
    url: 'coaibakersfield.com'
  },
  {
    id: 'site-phils-cheesesteaks',
    name: "Phil's Cheesesteaks & More",
    url: 'phils-cheesesteaks-and-more.com',
    githubRepo: 'blunts954-png/phillycheesesteak',
    netlifyId: '5a51b258-ff08-4aea-9dbc-d0dfea340c0e'
  },
  {
    id: 'site-edwin-ward',
    name: 'Edwin Ward Consulting',
    url: 'edwinwardconsulting.com',
    githubRepo: 'blunts954-png/edwin',
    netlifyId: 'eebbde7c-0d52-4a08-86c4-8fbcdeabd101'
  },
  {
    id: 'site-dffb-senior',
    name: 'DFFB Senior Living',
    url: 'dffbseniorliving.com',
    githubRepo: 'blunts954-png/dffb',
    netlifyId: '41483bef-df11-4fe8-b9f9-446f570b5986'
  },
  {
    id: 'site-coai-builds',
    name: 'COAI Builds',
    url: 'coaibuilds.com'
  },
  {
    id: 'site-tandmbak',
    name: 'T&M Bakery',
    url: 'tandmbak.com'
  },
  {
    id: 'site-william-dean',
    name: 'William Dean Real Photography',
    url: 'williamdeanrealphotography.com'
  },
  {
    id: 'site-poison-well',
    name: 'Poison Well Records',
    url: 'poisonwellrecords.com'
  },
  {
    id: 'site-homegrow-money',
    name: 'HomeGrow Money',
    url: 'homegrowmoney.com'
  }
]

interface SiteStatus {
  id: string
  name: string
  url: string
  githubRepo?: string
  netlifyId?: string
  status: 'online' | 'offline' | 'degraded' | 'loading'
  uptime: number
  responseTime: number
  performance: number
  lastDeployStatus?: 'success' | 'failed' | 'building'
  lastDeployTime?: string
  securityIssues: number
  lastChecked: string
}

// Check if a site is online by making an HTTP request
async function checkSiteStatus(url: string): Promise<{ online: boolean; responseTime: number }> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`https://${url}`, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'COAI-CommandCenter/1.0'
      }
    })

    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime

    return {
      online: response.ok || response.status < 500,
      responseTime
    }
  } catch (error) {
    return {
      online: false,
      responseTime: Date.now() - startTime
    }
  }
}

// Fetch Better Stack uptime data
async function fetchBetterStackData(): Promise<Map<string, { uptime: number; responseTime: number }>> {
  const apiKey = process.env.BETTER_STACK_UPTIME_API_KEY
  const dataMap = new Map<string, { uptime: number; responseTime: number }>()

  if (!apiKey) {
    return dataMap
  }

  try {
    const response = await fetch('https://uptime.betterstack.com/api/v2/monitors', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      return dataMap
    }

    const data = await response.json()
    const monitors = data.data || []

    for (const monitor of monitors) {
      const url = monitor.attributes.url
        ?.replace('https://', '')
        .replace('http://', '')
        .replace(/\/$/, '')

      if (url) {
        // Fetch SLA data for this monitor
        try {
          const slaResponse = await fetch(
            `https://uptime.betterstack.com/api/v2/monitors/${monitor.id}/sla`,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          )

          if (slaResponse.ok) {
            const slaData = await slaResponse.json()
            dataMap.set(url, {
              uptime: slaData.data?.attributes?.availability || 100,
              responseTime: slaData.data?.attributes?.average_response_time || 0
            })
          }
        } catch (e) {
          dataMap.set(url, { uptime: 100, responseTime: 0 })
        }
      }
    }
  } catch (error) {
    console.error('Better Stack API error:', error)
  }

  return dataMap
}

// Fetch Netlify deploy status
async function fetchNetlifyStatus(siteId: string): Promise<{ status: 'success' | 'failed' | 'building'; time: string } | null> {
  const apiKey = process.env.NETLIFY_API_TOKEN

  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys?per_page=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      return null
    }

    const deploys = await response.json()
    if (deploys.length > 0) {
      const latestDeploy = deploys[0]
      return {
        status: latestDeploy.state === 'ready' ? 'success' :
                latestDeploy.state === 'building' ? 'building' : 'failed',
        time: latestDeploy.created_at
      }
    }
  } catch (error) {
    console.error('Netlify API error:', error)
  }

  return null
}

// Main API handler
export async function GET(request: NextRequest) {
  try {
    const userSitesParam = request.nextUrl.searchParams.get('sites')
    let userSites: { id: string; name: string; url: string; githubRepo?: string; netlifyId?: string }[] = []
    if (userSitesParam) {
      try { userSites = JSON.parse(decodeURIComponent(userSitesParam)) } catch {}
    }

    const allSites = [...SITES_CONFIG, ...userSites.filter(u => !SITES_CONFIG.find(s => s.url === u.url))]

    // Fetch Better Stack data in parallel with site checks
    const [betterStackData, ...siteChecks] = await Promise.all([
      fetchBetterStackData(),
      ...allSites.map(site => checkSiteStatus(site.url))
    ])

    // Fetch Netlify deploy status for all sites
    const netlifyStatuses = await Promise.all(
      allSites.map(site => site.netlifyId ? fetchNetlifyStatus(site.netlifyId) : Promise.resolve(null))
    )

    // Build response
    const sites: SiteStatus[] = allSites.map((site, index) => {
      const siteCheck = siteChecks[index]
      const betterStackInfo = betterStackData.get(site.url)
      const netlifyStatus = netlifyStatuses[index]

      // Determine status
      let status: SiteStatus['status'] = 'loading'
      if (siteCheck.online) {
        status = siteCheck.responseTime > 3000 ? 'degraded' : 'online'
      } else {
        status = 'offline'
      }

      // Use Better Stack data if available, otherwise use direct check
      const uptime = betterStackInfo?.uptime || (siteCheck.online ? 100 : 0)
      const responseTime = betterStackInfo?.responseTime || siteCheck.responseTime

      // Calculate a simple performance score based on response time
      let performance = 100
      if (responseTime > 500) performance = 90
      if (responseTime > 1000) performance = 80
      if (responseTime > 2000) performance = 70
      if (responseTime > 3000) performance = 60
      if (responseTime > 5000) performance = 50

      return {
        id: site.id,
        name: site.name,
        url: site.url,
        githubRepo: site.githubRepo,
        netlifyId: site.netlifyId,
        status,
        uptime: Math.round(uptime * 10) / 10,
        responseTime: Math.round(responseTime),
        performance,
        lastDeployStatus: netlifyStatus?.status,
        lastDeployTime: netlifyStatus?.time,
        securityIssues: 0,
        lastChecked: new Date().toISOString()
      }
    })

    return NextResponse.json({
      sites,
      timestamp: new Date().toISOString(),
      totalSites: sites.length,
      onlineCount: sites.filter(s => s.status === 'online').length
    })
  } catch (error) {
    console.error('Failed to fetch sites status:', error)

    return NextResponse.json(
      { error: 'Failed to fetch sites status' },
      { status: 500 }
    )
  }
}
