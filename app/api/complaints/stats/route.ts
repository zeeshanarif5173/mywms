import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    totalComplaints: 0,
    openComplaints: 0,
    inProcessComplaints: 0,
    resolvedComplaints: 0,
    onHoldComplaints: 0,
    testingComplaints: 0,
    averageResolutionTime: 0,
    complaintsByMonth: [],
    complaintsByStatus: [],
    topComplaintTypes: []
  })
}