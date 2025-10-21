import { NextRequest, NextResponse } from 'next/server'
import { getComplaintsByCustomerId } from '@/lib/db-service'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const complaints = await getComplaintsByCustomerId(params.customerId)
    return NextResponse.json(complaints)
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}