import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Issue {
  id: string
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'code'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  fix: {
    type: 'auto' | 'manual' | 'code'
    instructions: string
    codeSnippet?: string
    filePath?: string
    lineNumber?: number
    estimatedTime: string
  }
  aiSuggestion?: string
}

// Analyze a website and generate AI-powered fix recommendations
async function analyzeWithAI(url: string): Promise<Issue[]> {
  const issues: Issue[] = []

  // Fetch the actual website HTML for analysis
  let html = ''
  let responseTime = 0
  let headers: Headers | null = null

  try {
    const startTime = Date.now()
    const response = await fetch(`https://${url}`, {
      headers: {
        'User-Agent': 'COAI-AIAnalyzer/1.0'
      }
    })
    responseTime = Date.now() - startTime
    headers = response.headers
    html = await response.text()
  } catch (error) {
    console.error('Failed to fetch website:', error)
    issues.push({
      id: 'critical-site-down',
      category: 'performance',
      severity: 'critical',
      title: 'Website Unreachable',
      description: 'The website could not be accessed for analysis.',
      impact: 'Users cannot access your website, resulting in lost traffic and potential revenue.',
      fix: {
        type: 'manual',
        instructions: 'Check your hosting provider, DNS settings, and ensure your server is running.',
        estimatedTime: '15-30 min'
      },
      aiSuggestion: 'I recommend checking your Netlify deployment logs and DNS configuration. Verify that your domain is properly pointed to Netlify\'s servers.'
    })
    return issues
  }

  // Performance Analysis
  if (responseTime > 3000) {
    issues.push({
      id: 'perf-slow-response',
      category: 'performance',
      severity: responseTime > 5000 ? 'critical' : 'high',
      title: 'Slow Server Response Time',
      description: `Server response time is ${responseTime}ms. Optimal is under 200ms.`,
      impact: 'Slow response times increase bounce rates and hurt SEO rankings. Google recommends under 200ms.',
      fix: {
        type: 'manual',
        instructions: 'Enable server-side caching, use a CDN, optimize database queries, and consider upgrading your hosting plan.',
        estimatedTime: '2-4 hours'
      },
      aiSuggestion: 'Based on your Netlify setup, I recommend enabling Edge Functions for dynamic content and ensuring static assets are properly cached. Check if any serverless functions are causing delays.'
    })
  }

  // Check for large unoptimized images
  const imgTags = html.match(/<img[^>]*>/gi) || []
  const largeImages = imgTags.filter(img => !img.includes('loading="lazy"'))

  if (largeImages.length > 3) {
    issues.push({
      id: 'perf-images-not-lazy',
      category: 'performance',
      severity: 'medium',
      title: 'Images Not Using Lazy Loading',
      description: `${largeImages.length} images found without lazy loading.`,
      impact: 'Non-lazy images load immediately, increasing initial page load time and bandwidth usage.',
      fix: {
        type: 'code',
        instructions: 'Add loading="lazy" attribute to images below the fold.',
        codeSnippet: '<img src="image.jpg" loading="lazy" alt="Description">',
        estimatedTime: '15 min'
      },
      aiSuggestion: 'For Next.js projects, use the next/image component which automatically handles lazy loading and optimization. For other frameworks, add loading="lazy" to all images except hero/above-fold images.'
    })
  }

  // Check for unminified CSS/JS
  const hasUnminifiedCSS = html.match(/<link[^>]*\.css[^>]*>/gi)?.some(link =>
    !link.includes('.min.') && !link.includes('_next/')
  )

  if (hasUnminifiedCSS) {
    issues.push({
      id: 'perf-unminified-assets',
      category: 'performance',
      severity: 'medium',
      title: 'Unminified CSS Detected',
      description: 'Some CSS files appear to be unminified, increasing file sizes.',
      impact: 'Unminified assets take longer to download, especially on slow connections.',
      fix: {
        type: 'auto',
        instructions: 'Use a build tool like Vite, Webpack, or the Next.js build process to automatically minify assets.',
        estimatedTime: '30 min'
      },
      aiSuggestion: 'If using Next.js, ensure you\'re running production builds (next build). For custom setups, add cssnano or terser to your build pipeline.'
    })
  }

  // Security Analysis
  const hasCSP = headers?.get('content-security-policy')
  const hasXFrameOptions = headers?.get('x-frame-options')
  const hasXContentType = headers?.get('x-content-type-options')
  const hasStrictTransport = headers?.get('strict-transport-security')

  if (!hasCSP) {
    issues.push({
      id: 'sec-no-csp',
      category: 'security',
      severity: 'high',
      title: 'Missing Content Security Policy',
      description: 'No Content-Security-Policy header detected.',
      impact: 'Without CSP, your site is more vulnerable to XSS attacks and data injection.',
      fix: {
        type: 'code',
        instructions: 'Add a Content-Security-Policy header to your server configuration or Netlify headers.',
        codeSnippet: `# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"`,
        filePath: 'netlify.toml',
        estimatedTime: '20 min'
      },
      aiSuggestion: 'Start with a basic CSP policy and gradually tighten it. Monitor for violations using the report-uri directive before enforcing.'
    })
  }

  if (!hasStrictTransport) {
    issues.push({
      id: 'sec-no-hsts',
      category: 'security',
      severity: 'high',
      title: 'Missing HSTS Header',
      description: 'Strict-Transport-Security header not found.',
      impact: 'Without HSTS, browsers may load your site over insecure HTTP, exposing users to man-in-the-middle attacks.',
      fix: {
        type: 'code',
        instructions: 'Add HSTS header to enforce HTTPS connections.',
        codeSnippet: `# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"`,
        filePath: 'netlify.toml',
        estimatedTime: '10 min'
      },
      aiSuggestion: 'Since your site is on Netlify with HTTPS, adding HSTS is a quick security win. Consider submitting to the HSTS preload list for maximum protection.'
    })
  }

  if (!hasXFrameOptions) {
    issues.push({
      id: 'sec-no-xframe',
      category: 'security',
      severity: 'medium',
      title: 'Missing X-Frame-Options Header',
      description: 'X-Frame-Options header not found.',
      impact: 'Your site could be embedded in malicious iframes for clickjacking attacks.',
      fix: {
        type: 'code',
        instructions: 'Add X-Frame-Options header to prevent clickjacking.',
        codeSnippet: `X-Frame-Options: DENY`,
        filePath: 'netlify.toml',
        estimatedTime: '5 min'
      }
    })
  }

  // SEO Analysis
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : ''

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)

  if (!title) {
    issues.push({
      id: 'seo-no-title',
      category: 'seo',
      severity: 'critical',
      title: 'Missing Page Title',
      description: 'Your page is missing a <title> tag.',
      impact: 'Search engines use the title tag as the primary headline in search results. Without it, your page will rank poorly.',
      fix: {
        type: 'code',
        instructions: 'Add a descriptive title tag between 50-60 characters.',
        codeSnippet: `<head>
  <title>Your Business Name | Primary Service in Location</title>
</head>`,
        estimatedTime: '5 min'
      },
      aiSuggestion: 'Create a title that includes your primary keyword near the beginning, your brand name, and is compelling enough to encourage clicks.'
    })
  }

  if (!metaDesc) {
    issues.push({
      id: 'seo-no-meta-desc',
      category: 'seo',
      severity: 'high',
      title: 'Missing Meta Description',
      description: 'Your page is missing a meta description.',
      impact: 'Without a meta description, search engines will auto-generate one, often resulting in less compelling search snippets.',
      fix: {
        type: 'code',
        instructions: 'Add a meta description between 150-160 characters.',
        codeSnippet: `<meta name="description" content="Your compelling description here that includes your main keyword and a call to action.">`,
        estimatedTime: '10 min'
      },
      aiSuggestion: 'Write a description that answers the user\'s search intent, includes your primary keyword naturally, and ends with a call to action.'
    })
  }

  if (!canonicalMatch) {
    issues.push({
      id: 'seo-no-canonical',
      category: 'seo',
      severity: 'medium',
      title: 'Missing Canonical URL',
      description: 'No canonical URL specified.',
      impact: 'Without a canonical URL, search engines may index duplicate versions of your page, diluting your SEO authority.',
      fix: {
        type: 'code',
        instructions: 'Add a canonical link tag to specify the preferred URL.',
        codeSnippet: `<link rel="canonical" href="https://${url}/">`,
        estimatedTime: '5 min'
      }
    })
  }

  // Accessibility Analysis
  const imgWithoutAlt = imgTags.filter(img => !img.includes('alt='))

  if (imgWithoutAlt.length > 0) {
    issues.push({
      id: 'a11y-missing-alt',
      category: 'accessibility',
      severity: 'high',
      title: `${imgWithoutAlt.length} Images Missing Alt Text`,
      description: 'Images without alt text are inaccessible to screen reader users.',
      impact: 'Screen reader users cannot understand image content. This also hurts SEO.',
      fix: {
        type: 'manual',
        instructions: 'Add descriptive alt text to all images. Use empty alt="" only for decorative images.',
        codeSnippet: `<img src="photo.jpg" alt="Team members collaborating in modern office">`,
        estimatedTime: '30 min'
      },
      aiSuggestion: 'When writing alt text, describe the image\'s content and function. For product images, include the product name and key details.'
    })
  }

  const hasSkipLink = html.includes('skip') && html.includes('main')
  if (!hasSkipLink) {
    issues.push({
      id: 'a11y-no-skip-link',
      category: 'accessibility',
      severity: 'medium',
      title: 'Missing Skip Navigation Link',
      description: 'No skip-to-main-content link detected.',
      impact: 'Keyboard users must tab through all navigation items on every page load.',
      fix: {
        type: 'code',
        instructions: 'Add a skip link as the first focusable element.',
        codeSnippet: `<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">...</main>`,
        estimatedTime: '15 min'
      }
    })
  }

  // Check for proper form labels
  const formInputs = html.match(/<input[^>]*>/gi) || []
  const inputsWithoutLabel = formInputs.filter(input =>
    !input.includes('type="hidden"') &&
    !input.includes('type="submit"') &&
    !input.includes('aria-label')
  )

  if (inputsWithoutLabel.length > 2) {
    issues.push({
      id: 'a11y-unlabeled-inputs',
      category: 'accessibility',
      severity: 'high',
      title: 'Form Inputs Missing Labels',
      description: `${inputsWithoutLabel.length} form inputs may be missing associated labels.`,
      impact: 'Screen reader users cannot identify form field purposes without proper labels.',
      fix: {
        type: 'code',
        instructions: 'Associate each input with a label using the for/id attributes or aria-label.',
        codeSnippet: `<label for="email">Email Address</label>
<input type="email" id="email" name="email">`,
        estimatedTime: '20 min'
      }
    })
  }

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return issues
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
    const issues = await analyzeWithAI(url)

    return NextResponse.json({
      siteId,
      url,
      issues,
      totalIssues: issues.length,
      criticalCount: issues.filter(i => i.severity === 'critical').length,
      highCount: issues.filter(i => i.severity === 'high').length,
      analyzedAt: new Date().toISOString(),
      poweredBy: 'Chaotically Organized AI'
    })
  } catch (error) {
    console.error('AI analysis failed:', error)

    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    )
  }
}
