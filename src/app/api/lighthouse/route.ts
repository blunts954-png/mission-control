import { NextRequest, NextResponse } from 'next/server'
import { fetchLighthouse } from '@/lib/pagespeed'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const strategy = (request.nextUrl.searchParams.get('strategy') || 'mobile') as 'mobile' | 'desktop'
  const apiKey = request.headers.get('x-api-key-pagespeed') || undefined

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    const result = await fetchLighthouse(url, strategy, apiKey)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch Lighthouse data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
