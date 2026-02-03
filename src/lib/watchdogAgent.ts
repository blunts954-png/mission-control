/**
 * AI Watchdog Agent
 *
 * This agent reads HTML source code from GitHub repositories and analyzes
 * generation time / payload size issues. When Gen Time is too high, it
 * suggests specific HTML line edits to reduce the payload.
 */

import { Octokit } from '@octokit/rest'

export interface HTMLAnalysisResult {
  filePath: string
  lineNumber: number
  issue: string
  severity: 'high' | 'medium' | 'low'
  suggestion: string
  codeSnippet: string
  estimatedSavings: string
}

export interface WatchdogReport {
  timestamp: string
  repository: string
  genTime: number
  genTimeStatus: 'critical' | 'warning' | 'good'
  totalPayloadSize: string
  analyzedFiles: number
  issues: HTMLAnalysisResult[]
  recommendations: string[]
}

// Gen Time thresholds (in ms)
const GEN_TIME_CRITICAL = 3000
const GEN_TIME_WARNING = 2000

// Common HTML issues that affect generation time and payload size
const HTML_PATTERNS = [
  {
    pattern: /<script[^>]*src=['"][^'"]*['"][^>]*><\/script>/gi,
    issue: 'External script blocking render',
    suggestion: 'Add defer or async attribute to non-critical scripts',
    severity: 'high' as const,
    fix: (match: string) => match.replace('<script', '<script defer')
  },
  {
    pattern: /<img[^>]*(?!loading=['"]lazy['"])[^>]*>/gi,
    issue: 'Image without lazy loading',
    suggestion: 'Add loading="lazy" to images below the fold',
    severity: 'medium' as const,
    fix: (match: string) => match.replace('<img', '<img loading="lazy"')
  },
  {
    pattern: /<link[^>]*rel=['"]stylesheet['"][^>]*>/gi,
    issue: 'Render-blocking CSS',
    suggestion: 'Consider inlining critical CSS and deferring non-critical styles',
    severity: 'high' as const,
    fix: (match: string) => `<!-- Consider: preload and async load -->\n${match}`
  },
  {
    pattern: /<!--[\s\S]*?-->/g,
    issue: 'HTML comment found',
    suggestion: 'Remove unnecessary comments in production to reduce payload',
    severity: 'low' as const,
    fix: () => ''
  },
  {
    pattern: /<style[^>]*>[\s\S]*?<\/style>/gi,
    issue: 'Large inline style block',
    suggestion: 'Consider extracting to external CSS and using critical CSS approach',
    severity: 'medium' as const,
    fix: (match: string) => match
  },
  {
    pattern: /data-[a-z-]+=['"][^'"]{100,}['"]/gi,
    issue: 'Large data attribute detected',
    suggestion: 'Move large data to JavaScript or fetch from API',
    severity: 'high' as const,
    fix: (match: string) => match.split('=')[0] + '="[MOVED_TO_JS]"'
  },
  {
    pattern: /<div[^>]*>\s*<div[^>]*>\s*<div[^>]*>\s*<div/gi,
    issue: 'Deep DOM nesting detected (4+ levels)',
    suggestion: 'Flatten DOM structure to improve rendering performance',
    severity: 'medium' as const,
    fix: (match: string) => match
  },
  {
    pattern: /onclick=['"][^'"]+['"]/gi,
    issue: 'Inline event handler',
    suggestion: 'Use addEventListener in external JS for better caching',
    severity: 'low' as const,
    fix: (match: string) => match
  },
  {
    pattern: /<iframe[^>]*(?!loading=['"]lazy['"])[^>]*>/gi,
    issue: 'iframe without lazy loading',
    suggestion: 'Add loading="lazy" to defer iframe loading',
    severity: 'high' as const,
    fix: (match: string) => match.replace('<iframe', '<iframe loading="lazy"')
  },
  {
    pattern: /style=['"][^'"]{200,}['"]/gi,
    issue: 'Large inline style attribute',
    suggestion: 'Extract to CSS class for better maintainability and caching',
    severity: 'medium' as const,
    fix: (match: string) => 'class="extracted-style"'
  }
]

/**
 * Analyze HTML content for performance issues
 */
export function analyzeHTML(content: string, filePath: string): HTMLAnalysisResult[] {
  const results: HTMLAnalysisResult[] = []
  const lines = content.split('\n')

  HTML_PATTERNS.forEach(({ pattern, issue, suggestion, severity }) => {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match

    while ((match = regex.exec(content)) !== null) {
      // Find line number
      const contentBeforeMatch = content.substring(0, match.index)
      const lineNumber = contentBeforeMatch.split('\n').length

      // Get code snippet (3 lines context)
      const startLine = Math.max(0, lineNumber - 2)
      const endLine = Math.min(lines.length, lineNumber + 1)
      const codeSnippet = lines.slice(startLine, endLine).join('\n')

      // Estimate savings based on severity
      const estimatedSavings = severity === 'high' ? '100-500ms' :
                               severity === 'medium' ? '50-100ms' : '10-50ms'

      results.push({
        filePath,
        lineNumber,
        issue,
        severity,
        suggestion,
        codeSnippet: codeSnippet.substring(0, 200) + (codeSnippet.length > 200 ? '...' : ''),
        estimatedSavings
      })
    }
  })

  return results
}

/**
 * Fetch HTML files from GitHub repository
 */
export async function fetchGitHubHTML(
  owner: string,
  repo: string,
  token?: string
): Promise<{ path: string; content: string }[]> {
  const octokit = new Octokit({ auth: token })
  const files: { path: string; content: string }[] = []

  try {
    // Get repository content tree
    const { data: tree } = await octokit.repos.getContent({
      owner,
      repo,
      path: ''
    })

    if (!Array.isArray(tree)) {
      return files
    }

    // Find HTML files
    const htmlFiles = await findHTMLFiles(octokit, owner, repo, tree)

    // Fetch content of each HTML file
    for (const file of htmlFiles) {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: file
        })

        if ('content' in data && data.encoding === 'base64') {
          const content = Buffer.from(data.content, 'base64').toString('utf-8')
          files.push({ path: file, content })
        }
      } catch (err) {
        console.error(`Failed to fetch ${file}:`, err)
      }
    }
  } catch (err) {
    console.error('Failed to fetch repository:', err)
  }

  return files
}

/**
 * Recursively find HTML files in repository
 */
async function findHTMLFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  items: any[],
  basePath: string = ''
): Promise<string[]> {
  const htmlFiles: string[] = []

  for (const item of items) {
    if (item.type === 'file' && item.name.endsWith('.html')) {
      htmlFiles.push(item.path)
    } else if (item.type === 'dir') {
      try {
        const { data: subItems } = await octokit.repos.getContent({
          owner,
          repo,
          path: item.path
        })

        if (Array.isArray(subItems)) {
          const subFiles = await findHTMLFiles(octokit, owner, repo, subItems, item.path)
          htmlFiles.push(...subFiles)
        }
      } catch (err) {
        console.error(`Failed to read directory ${item.path}:`, err)
      }
    }
  }

  return htmlFiles
}

/**
 * Generate watchdog report
 */
export function generateWatchdogReport(
  repository: string,
  genTime: number,
  files: { path: string; content: string }[]
): WatchdogReport {
  const allIssues: HTMLAnalysisResult[] = []
  let totalSize = 0

  // Analyze each file
  for (const file of files) {
    totalSize += file.content.length
    const issues = analyzeHTML(file.content, file.path)
    allIssues.push(...issues)
  }

  // Sort issues by severity
  allIssues.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  // Determine gen time status
  const genTimeStatus = genTime >= GEN_TIME_CRITICAL ? 'critical' :
                        genTime >= GEN_TIME_WARNING ? 'warning' : 'good'

  // Generate recommendations based on issues
  const recommendations: string[] = []

  const highSeverityCount = allIssues.filter(i => i.severity === 'high').length
  if (highSeverityCount > 0) {
    recommendations.push(`Fix ${highSeverityCount} high-severity issues to significantly reduce Gen Time`)
  }

  if (genTime > GEN_TIME_CRITICAL) {
    recommendations.push('Consider implementing server-side rendering or static site generation')
    recommendations.push('Enable HTTP/2 and resource compression on your server')
  }

  if (totalSize > 500000) {
    recommendations.push('Total HTML payload exceeds 500KB - consider code splitting')
  }

  const scriptIssues = allIssues.filter(i => i.issue.includes('script'))
  if (scriptIssues.length > 3) {
    recommendations.push('Bundle multiple scripts to reduce HTTP requests')
  }

  return {
    timestamp: new Date().toISOString(),
    repository,
    genTime,
    genTimeStatus,
    totalPayloadSize: `${(totalSize / 1024).toFixed(1)} KB`,
    analyzedFiles: files.length,
    issues: allIssues.slice(0, 20), // Limit to top 20 issues
    recommendations
  }
}

/**
 * Main watchdog function - runs full analysis
 */
export async function runWatchdogAgent(
  owner: string,
  repo: string,
  currentGenTime: number,
  githubToken?: string
): Promise<WatchdogReport> {
  const files = await fetchGitHubHTML(owner, repo, githubToken)
  return generateWatchdogReport(`${owner}/${repo}`, currentGenTime, files)
}
