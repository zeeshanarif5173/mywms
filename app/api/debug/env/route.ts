import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      // Show partial URLs for debugging (safe)
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      nextAuthUrl: process.env.NEXTAUTH_URL,
      expectedUrl: 'https://mywms.vercel.app',
      supabaseUrl: process.env.SUPABASE_URL
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString(),
      message: 'Environment check completed'
    }, { status: 200 })

  } catch (error) {
    console.error('Error checking environment:', error)
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    )
  }
}
