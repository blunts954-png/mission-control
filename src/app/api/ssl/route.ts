import { NextRequest, NextResponse } from 'next/server'
import { checkSSL } from '@/lib/ssl'

export async function GET(request: NextRequest) {
  const hostname = request.nextUrl.searchParams.get('hostname')

  if (!hostname) {
    return NextResponse.json({ error: 'hostname parameter is required' }, { status: 400 })
  }

  try {
    const result = await checkSSL(hostname)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: `SSL check failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
