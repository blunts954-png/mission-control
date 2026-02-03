import { NextRequest, NextResponse } from 'next/server'
import { runWatchdogAgent, generateWatchdogReport, analyzeHTML } from '@/lib/watchdogAgent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { owner, repo, genTime, htmlContent, githubToken } = body

    // If raw HTML content is provided, analyze it directly
    if (htmlContent) {
      const files = [{ path: 'index.html', content: htmlContent }]
      const report = generateWatchdogReport(
        repo || 'local',
        genTime || 3740,
        files
      )
      return NextResponse.json(report)
    }

    // If GitHub repo is provided, fetch and analyze
    if (owner && repo) {
      const report = await runWatchdogAgent(
        owner,
        repo,
        genTime || 3740,
        githubToken
      )
      return NextResponse.json(report)
    }

    return NextResponse.json(
      { error: 'Please provide either htmlContent or owner/repo' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Watchdog error:', error)
    return NextResponse.json(
      { error: 'Failed to run watchdog analysis' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return sample report for demo purposes
  const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Sample Page</title>
  <link rel="stylesheet" href="styles.css">
  <script src="analytics.js"></script>
  <script src="main.js"></script>
  <style>
    /* Large inline styles that could be extracted */
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
    .nav { display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <!-- This is a comment that could be removed in production -->
  <div>
    <div>
      <div>
        <div>
          <p>Deeply nested content</p>
        </div>
      </div>
    </div>
  </div>
  <img src="hero.jpg" alt="Hero image">
  <img src="feature1.jpg" alt="Feature 1">
  <img src="feature2.jpg" alt="Feature 2">
  <iframe src="https://youtube.com/embed/xyz"></iframe>
  <div onclick="handleClick()" style="background: #000; color: #fff; padding: 10px; margin: 5px; border: 1px solid #333; font-size: 14px; line-height: 1.5; text-align: center; cursor: pointer; transition: all 0.3s ease;">
    Click me
  </div>
</body>
</html>
  `

  const report = generateWatchdogReport(
    'chaoticallyorganizedai/website',
    3740, // Current gen time from user's dashboard
    [{ path: 'index.html', content: sampleHTML }]
  )

  return NextResponse.json(report)
}
