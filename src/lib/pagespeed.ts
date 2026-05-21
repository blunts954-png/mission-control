interface LighthouseCategory {
  score: number
  title: string
  description?: string
}

interface CoreWebVital {
  value: number
  displayValue: string
  rating: 'good' | 'needs-improvement' | 'poor'
  percentile?: number
}

export interface LighthouseResult {
  url: string
  strategy: 'mobile' | 'desktop'
  fetchTime: string
  lighthouseVersion: string
  categories: {
    performance: LighthouseCategory
    accessibility: LighthouseCategory
    bestPractices: LighthouseCategory
    seo: LighthouseCategory
  }
  coreWebVitals: {
    lcp: CoreWebVital
    inp?: CoreWebVital
    cls: CoreWebVital
    fcp: CoreWebVital
    tbt: CoreWebVital
  }
  opportunities: {
    title: string
    description: string
    score: number
    estimatedSavings: string
  }[]
  diagnostics: {
    title: string
    description: string
    score: number
  }[]
  error?: string
}

const API_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

function extractNumericValue(str: string): number {
  const match = str.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

function ratingFromValue(value: number, thresholds: { good: number; poor: number }): CoreWebVital['rating'] {
  if (value <= thresholds.good) return 'good'
  if (value >= thresholds.poor) return 'poor'
  return 'needs-improvement'
}

export async function fetchLighthouse(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<LighthouseResult> {
  const apiKey = process.env.PAGESPEED_API_KEY

  if (!apiKey) {
    return {
      url,
      strategy,
      fetchTime: new Date().toISOString(),
      lighthouseVersion: '0.0',
      categories: {
        performance: { score: 0, title: 'Performance' },
        accessibility: { score: 0, title: 'Accessibility' },
        bestPractices: { score: 0, title: 'Best Practices' },
        seo: { score: 0, title: 'SEO' }
      },
      coreWebVitals: {
        lcp: { value: 0, displayValue: 'N/A', rating: 'poor' },
        cls: { value: 0, displayValue: 'N/A', rating: 'poor' },
        fcp: { value: 0, displayValue: 'N/A', rating: 'poor' },
        tbt: { value: 0, displayValue: 'N/A', rating: 'poor' }
      },
      opportunities: [],
      diagnostics: [],
      error: 'API key not configured. Set PAGESPEED_API_KEY in your environment.'
    }
  }

  try {
    const params = new URLSearchParams({
      url: url.startsWith('http') ? url : `https://${url}`,
      key: apiKey,
      strategy,
      category: ['performance', 'accessibility', 'best-practices', 'seo'].join(',')
    })

    const response = await fetch(`${API_BASE}?${params}`, {
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      const errText = await response.text()
      return {
        url, strategy,
        fetchTime: new Date().toISOString(),
        lighthouseVersion: '0.0',
        categories: {
          performance: { score: 0, title: 'Performance' },
          accessibility: { score: 0, title: 'Accessibility' },
          bestPractices: { score: 0, title: 'Best Practices' },
          seo: { score: 0, title: 'SEO' }
        },
        coreWebVitals: {
          lcp: { value: 0, displayValue: 'N/A', rating: 'poor' },
          cls: { value: 0, displayValue: 'N/A', rating: 'poor' },
          fcp: { value: 0, displayValue: 'N/A', rating: 'poor' },
          tbt: { value: 0, displayValue: 'N/A', rating: 'poor' }
        },
        opportunities: [],
        diagnostics: [],
        error: `PageSpeed API error: ${response.status} ${errText}`
      }
    }

    const data = await response.json()
    const lhr = data.lighthouseResult

    const clsValue = lhr.audits?.['cumulative-layout-shift']?.numericValue ?? 0
    const lcpValue = lhr.audits?.['largest-contentful-paint']?.numericValue ?? 0
    const fcpValue = lhr.audits?.['first-contentful-paint']?.numericValue ?? 0
    const tbtValue = lhr.audits?.['total-blocking-time']?.numericValue ?? 0
    const siValue = lhr.audits?.['speed-index']?.numericValue ?? 0

    return {
      url,
      strategy,
      fetchTime: data.lighthouseResult?.fetchTime || new Date().toISOString(),
      lighthouseVersion: data.lighthouseResult?.lighthouseVersion || 'unknown',
      categories: {
        performance: {
          score: Math.round((lhr?.categories?.performance?.score ?? 0) * 100),
          title: 'Performance'
        },
        accessibility: {
          score: Math.round((lhr?.categories?.accessibility?.score ?? 0) * 100),
          title: 'Accessibility'
        },
        bestPractices: {
          score: Math.round((lhr?.categories?.['best-practices']?.score ?? 0) * 100),
          title: 'Best Practices'
        },
        seo: {
          score: Math.round((lhr?.categories?.seo?.score ?? 0) * 100),
          title: 'SEO'
        }
      },
      coreWebVitals: {
        lcp: {
          value: Math.round(lcpValue * 10) / 10,
          displayValue: lhr.audits?.['largest-contentful-paint']?.displayValue || `${lcpValue.toFixed(1)} s`,
          rating: ratingFromValue(lcpValue, { good: 2.5, poor: 4.0 })
        },
        inp: lhr.audits?.['interaction-to-next-paint'] ? {
          value: Math.round(lhr.audits['interaction-to-next-paint'].numericValue * 10) / 10,
          displayValue: lhr.audits['interaction-to-next-paint'].displayValue,
          rating: ratingFromValue(lhr.audits['interaction-to-next-paint'].numericValue, { good: 200, poor: 500 })
        } : undefined,
        cls: {
          value: Math.round(clsValue * 1000) / 1000,
          displayValue: lhr.audits?.['cumulative-layout-shift']?.displayValue || `${clsValue.toFixed(3)}`,
          rating: ratingFromValue(clsValue, { good: 0.1, poor: 0.25 })
        },
        fcp: {
          value: Math.round(fcpValue * 10) / 10,
          displayValue: lhr.audits?.['first-contentful-paint']?.displayValue || `${fcpValue.toFixed(1)} s`,
          rating: ratingFromValue(fcpValue, { good: 1.8, poor: 3.0 })
        },
        tbt: {
          value: Math.round(tbtValue),
          displayValue: lhr.audits?.['total-blocking-time']?.displayValue || `${Math.round(tbtValue)} ms`,
          rating: ratingFromValue(tbtValue, { good: 200, poor: 600 })
        }
      },
      opportunities: Object.values(lhr?.audits ?? {})
        .filter((a: any) => a.details?.type === 'opportunity' && a.score !== null)
        .slice(0, 10)
        .map((a: any) => ({
          title: a.title,
          description: a.description,
          score: (a.score ?? 0) * 100,
          estimatedSavings: a.numericValue ? `${Math.round(a.numericValue / 1000)}s` : 'Unknown'
        })),
      diagnostics: Object.values(lhr?.audits ?? {})
        .filter((a: any) => a.details?.type === 'diagnostic' && a.score !== null)
        .slice(0, 10)
        .map((a: any) => ({
          title: a.title,
          description: a.description,
          score: (a.score ?? 0) * 100
        }))
    }
  } catch (error) {
    return {
      url, strategy,
      fetchTime: new Date().toISOString(),
      lighthouseVersion: '0.0',
      categories: {
        performance: { score: 0, title: 'Performance' },
        accessibility: { score: 0, title: 'Accessibility' },
        bestPractices: { score: 0, title: 'Best Practices' },
        seo: { score: 0, title: 'SEO' }
      },
      coreWebVitals: {
        lcp: { value: 0, displayValue: 'N/A', rating: 'poor' },
        cls: { value: 0, displayValue: 'N/A', rating: 'poor' },
        fcp: { value: 0, displayValue: 'N/A', rating: 'poor' },
        tbt: { value: 0, displayValue: 'N/A', rating: 'poor' }
      },
      opportunities: [],
      diagnostics: [],
      error: `Failed to fetch PageSpeed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
