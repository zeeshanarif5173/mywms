import { NextRequest, NextResponse } from 'next/server'
import { getPersistentComplaints } from '@/lib/persistent-complaints'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const complaints = getPersistentComplaints()
    return NextResponse.json(complaints)
  } catch (error) {
    console.error('Error fetching all complaints:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}