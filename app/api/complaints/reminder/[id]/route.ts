import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    message: 'Reminder sent successfully! (mock)',
    complaint: {
      id: params.id,
      updatedAt: new Date().toISOString()
    }
  })
}