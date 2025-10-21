import { NextRequest, NextResponse } from 'next/server'
import { getAllComplaints } from '@/lib/db-service'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const complaints = await getAllComplaints()
    return NextResponse.json(complaints)
  } catch (error) {
    console.error('Error fetching all complaints:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}