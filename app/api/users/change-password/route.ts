import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function PUT(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    success: true,
    message: 'Password changed successfully (mock)'
  })
}