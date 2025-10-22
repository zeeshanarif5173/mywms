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
    
    // Calculate statistics
    const totalComplaints = complaints.length
    const openComplaints = complaints.filter(c => c.status === 'Open').length
    const inProcessComplaints = complaints.filter(c => c.status === 'In Process').length
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length
    const onHoldComplaints = complaints.filter(c => c.status === 'On Hold').length
    const testingComplaints = complaints.filter(c => c.status === 'Testing').length
    
    // Calculate resolution times
    const resolvedComplaintsWithTime = complaints.filter(c => c.status === 'Resolved' && c.resolvedAt)
    const avgResolutionTime = resolvedComplaintsWithTime.length > 0 
      ? resolvedComplaintsWithTime.reduce((sum, c) => {
          const created = new Date(c.createdAt).getTime()
          const resolved = new Date(c.resolvedAt!).getTime()
          return sum + (resolved - created)
        }, 0) / resolvedComplaintsWithTime.length
      : 0
    
    // Calculate resolved this week and month
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const resolvedThisWeek = complaints.filter(c => 
      c.status === 'Resolved' && 
      c.resolvedAt && 
      new Date(c.resolvedAt) >= weekAgo
    ).length
    
    const resolvedThisMonth = complaints.filter(c => 
      c.status === 'Resolved' && 
      c.resolvedAt && 
      new Date(c.resolvedAt) >= monthAgo
    ).length
    
    return NextResponse.json({
      totalComplaints,
      openComplaints,
      inProcessComplaints,
      resolvedComplaints,
      onHoldComplaints,
      testingComplaints,
      resolvedThisWeek,
      resolvedThisMonth,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60 * 24)), // Convert to days
      complaintsByMonth: [], // TODO: Implement monthly breakdown
      complaintsByStatus: [
        { status: 'Open', count: openComplaints },
        { status: 'In Process', count: inProcessComplaints },
        { status: 'On Hold', count: onHoldComplaints },
        { status: 'Testing', count: testingComplaints },
        { status: 'Resolved', count: resolvedComplaints }
      ],
      topComplaintTypes: [] // TODO: Implement complaint type analysis
    })
  } catch (error) {
    console.error('Error fetching complaint stats:', error)
    return NextResponse.json({ error: 'Failed to fetch complaint statistics' }, { status: 500 })
  }
}