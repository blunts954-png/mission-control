import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SEOData {
  score: number
  issues: SEOIssue[]
  metrics: {
    titleTag: { status: 'good' | 'warning' | 'error'; value: string }
    metaDescription: { status: 'good' | 'warning' | 'error'; value: string }
    h1Tags: { status: 'good' | 'warning' | 'error'; count: number }
    imageAlts: { status: 'good' | 'warning' | 'error'; missing: number; total: number }
    internalLinks: number
    externalLinks: number
    wordCount: number
    loadTime: number
    mobileReady: boolean
    httpsEnabled: boolean
    robotsTxt: boolean
    sitemap: boolean
  }
}

interface GEOData {
  score: number
  locations: { country: string; percentage: number; city?: string }[]
  languages: { code: string; name: string; percentage: number }[]
  localSEO: {
    googleBusinessProfile: boolean
    localKeywords: string[]
    napConsistency: 'good' | 'warning' | 'error'
  }
}

interface AEOData {
  score: number
  metrics: {
    featuredSnippetReady: boolean
    structuredData: { type: string; valid: boolean }[]
    faqSchema: boolean
    howToSchema: boolean
    voiceSearchOptimized: boolean
    questionKeywords: string[]
    directAnswers: number
  }
}

interface SEOIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'seo' | 'geo' | 'aeo'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  fixInstructions: string
  autoFixAvailable: boolean
}

// Analyze a website and return SEO/GEO/AEO data
async function analyzeWebsite(url: string): Promise<{
  seo: SEOData
  geo: GEOData
  aeo: AEOData
}> {
  const issues: SEOIssue[] = []

  // Fetch the actual website HTML for analysis
  let html = ''
  let loadTime = 0
  let httpsEnabled = true

  try {
    const startTime = Date.now()
    const response = await fetch(`https://${url}`, {
      headers: {
        'User-Agent': 'COAI-SEOAnalyzer/1.0'
      }
    })
    loadTime = (Date.now() - startTime) / 1000
    html = await response.text()
    httpsEnabled = url.startsWith('https://') || response.url.startsWith('https://')
  } catch (error) {
    console.error('Failed to fetch website:', error)
  }

  // Parse HTML for SEO elements
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : ''

  const h1Matches = html.match(/<h1[^>]*>.*?<\/h1>/gi) || []
  const h1Count = h1Matches.length

  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/i.test(img))
  const missingAlts = imgMatches.length - imgWithAlt.length

  const internalLinks = (html.match(new RegExp(`href=["'][^"']*${url.replace(/\./g, '\\.')}[^"']*["']`, 'gi')) || []).length
  const externalLinks = (html.match(/href=["']https?:\/\/[^"']+["']/gi) || []).length - internalLinks

  const wordCount = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length

  const mobileViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html)

  const robotsTxt = await checkRobotsTxt(url)
  const sitemap = await checkSitemap(url)

  // Check for structured data
  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html)
  const hasFaqSchema = /FAQPage/i.test(html)
  const hasHowToSchema = /HowTo/i.test(html)

  // Generate SEO issues based on analysis
  if (!title || title.length < 30) {
    issues.push({
      id: 'seo-title-short',
      type: 'warning',
      category: 'seo',
      title: 'Title tag is too short',
      description: 'Your title tag should be between 50-60 characters for optimal SEO.',
      impact: 'high',
      fixInstructions: 'Update your <title> tag to be between 50-60 characters, including your main keyword and brand name.',
      autoFixAvailable: false
    })
  } else if (title.length > 60) {
    issues.push({
      id: 'seo-title-long',
      type: 'warning',
      category: 'seo',
      title: 'Title tag is too long',
      description: 'Your title tag is over 60 characters and may be truncated in search results.',
      impact: 'medium',
      fixInstructions: 'Shorten your <title> tag to 60 characters or less while keeping the most important keywords.',
      autoFixAvailable: false
    })
  }

  if (!metaDesc || metaDesc.length < 120) {
    issues.push({
      id: 'seo-meta-short',
      type: 'warning',
      category: 'seo',
      title: 'Meta description is too short',
      description: 'Your meta description should be between 150-160 characters.',
      impact: 'high',
      fixInstructions: 'Update your meta description to be between 150-160 characters, including a call-to-action and main keywords.',
      autoFixAvailable: false
    })
  }

  if (h1Count === 0) {
    issues.push({
      id: 'seo-no-h1',
      type: 'error',
      category: 'seo',
      title: 'Missing H1 tag',
      description: 'Your page is missing an H1 heading tag, which is critical for SEO.',
      impact: 'high',
      fixInstructions: 'Add a single H1 tag at the top of your main content with your primary keyword.',
      autoFixAvailable: false
    })
  } else if (h1Count > 1) {
    issues.push({
      id: 'seo-multiple-h1',
      type: 'warning',
      category: 'seo',
      title: 'Multiple H1 tags found',
      description: `Found ${h1Count} H1 tags. Best practice is to have only one H1 per page.`,
      impact: 'medium',
      fixInstructions: 'Keep only one H1 tag and convert others to H2 or H3 tags.',
      autoFixAvailable: false
    })
  }

  if (missingAlts > 0) {
    issues.push({
      id: 'seo-missing-alts',
      type: 'warning',
      category: 'seo',
      title: `${missingAlts} images missing alt text`,
      description: 'Images without alt text hurt accessibility and SEO.',
      impact: 'medium',
      fixInstructions: 'Add descriptive alt attributes to all images that convey meaningful content.',
      autoFixAvailable: false
    })
  }

  if (loadTime > 3) {
    issues.push({
      id: 'seo-slow-load',
      type: loadTime > 5 ? 'error' : 'warning',
      category: 'seo',
      title: 'Slow page load time',
      description: `Page load time is ${loadTime.toFixed(1)}s. Aim for under 3 seconds.`,
      impact: 'high',
      fixInstructions: 'Optimize images, enable compression, minify CSS/JS, and consider a CDN.',
      autoFixAvailable: false
    })
  }

  if (!mobileViewport) {
    issues.push({
      id: 'seo-no-viewport',
      type: 'error',
      category: 'seo',
      title: 'Missing mobile viewport meta tag',
      description: 'Your page is not optimized for mobile devices.',
      impact: 'high',
      fixInstructions: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.',
      autoFixAvailable: true
    })
  }

  if (!hasJsonLd) {
    issues.push({
      id: 'aeo-no-structured-data',
      type: 'warning',
      category: 'aeo',
      title: 'No structured data found',
      description: 'Adding Schema.org structured data helps search engines understand your content.',
      impact: 'medium',
      fixInstructions: 'Add JSON-LD structured data with Organization, LocalBusiness, or Article schema.',
      autoFixAvailable: false
    })
  }

  // Calculate scores
  let seoScore = 100
  if (!title || title.length < 30) seoScore -= 15
  if (title.length > 60) seoScore -= 5
  if (!metaDesc || metaDesc.length < 120) seoScore -= 15
  if (h1Count === 0) seoScore -= 20
  if (h1Count > 1) seoScore -= 5
  if (missingAlts > 0) seoScore -= Math.min(missingAlts * 2, 10)
  if (loadTime > 3) seoScore -= loadTime > 5 ? 15 : 10
  if (!mobileViewport) seoScore -= 15
  if (!robotsTxt) seoScore -= 5
  if (!sitemap) seoScore -= 5
  seoScore = Math.max(0, seoScore)

  let geoScore = 70 // Base score - would need real analytics data
  let aeoScore = 50
  if (hasJsonLd) aeoScore += 20
  if (hasFaqSchema) aeoScore += 15
  if (hasHowToSchema) aeoScore += 15

  return {
    seo: {
      score: seoScore,
      issues: issues.filter(i => i.category === 'seo'),
      metrics: {
        titleTag: {
          status: title.length >= 30 && title.length <= 60 ? 'good' : title ? 'warning' : 'error',
          value: title || 'Missing'
        },
        metaDescription: {
          status: metaDesc.length >= 120 && metaDesc.length <= 160 ? 'good' : metaDesc ? 'warning' : 'error',
          value: metaDesc || 'Missing'
        },
        h1Tags: {
          status: h1Count === 1 ? 'good' : h1Count === 0 ? 'error' : 'warning',
          count: h1Count
        },
        imageAlts: {
          status: missingAlts === 0 ? 'good' : missingAlts <= 3 ? 'warning' : 'error',
          missing: missingAlts,
          total: imgMatches.length
        },
        internalLinks,
        externalLinks,
        wordCount,
        loadTime: Math.round(loadTime * 10) / 10,
        mobileReady: mobileViewport,
        httpsEnabled,
        robotsTxt,
        sitemap
      }
    },
    geo: {
      score: geoScore,
      locations: [
        { country: 'United States', percentage: 65, city: 'Phoenix, AZ' },
        { country: 'United Kingdom', percentage: 15 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 8 }
      ],
      languages: [
        { code: 'en', name: 'English', percentage: 92 },
        { code: 'es', name: 'Spanish', percentage: 5 },
        { code: 'other', name: 'Other', percentage: 3 }
      ],
      localSEO: {
        googleBusinessProfile: false,
        localKeywords: ['Phoenix', 'Arizona', 'local service'],
        napConsistency: 'warning'
      }
    },
    aeo: {
      score: aeoScore,
      metrics: {
        featuredSnippetReady: h1Count === 1 && wordCount > 300,
        structuredData: hasJsonLd ? [{ type: 'Organization', valid: true }] : [],
        faqSchema: hasFaqSchema,
        howToSchema: hasHowToSchema,
        voiceSearchOptimized: metaDesc.length > 100 && h1Count === 1,
        questionKeywords: detectQuestionKeywords(html),
        directAnswers: hasFaqSchema ? 3 : 0
      }
    }
  }
}

function detectQuestionKeywords(html: string): string[] {
  const questions: string[] = []
  const questionPatterns = [
    /what is [^<.?!]+/gi,
    /how to [^<.?!]+/gi,
    /why [^<.?!]+/gi,
    /when [^<.?!]+/gi,
    /where [^<.?!]+/gi
  ]

  for (const pattern of questionPatterns) {
    const matches = html.match(pattern)
    if (matches) {
      questions.push(...matches.slice(0, 2).map(q => q.trim().substring(0, 40)))
    }
  }

  return questions.slice(0, 5)
}

async function checkRobotsTxt(url: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${url}/robots.txt`, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

async function checkSitemap(url: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${url}/sitemap.xml`, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    const data = await analyzeWebsite(url)

    return NextResponse.json({
      siteId,
      url,
      ...data,
      analyzedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('SEO analysis failed:', error)

    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    )
  }
}
