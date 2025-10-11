import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getAllComplaints } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can view complaint stats
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all complaints
    const complaints = getAllComplaints()

    // Calculate current date ranges
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Calculate statistics
    const totalComplaints = complaints.length
    const openComplaints = complaints.filter(c => c.status === 'Open').length
    
    // Count resolved complaints this week
    const resolvedThisWeek = complaints.filter(complaint => {
      if (complaint.status !== 'Resolved' || !complaint.resolvedAt) return false
      const resolvedDate = new Date(complaint.resolvedAt)
      return resolvedDate >= startOfWeek
    }).length

    // Count resolved complaints this month
    const resolvedThisMonth = complaints.filter(complaint => {
      if (complaint.status !== 'Resolved' || !complaint.resolvedAt) return false
      const resolvedDate = new Date(complaint.resolvedAt)
      return resolvedDate >= startOfMonth
    }).length

    // Additional statistics
    const inProcessComplaints = complaints.filter(c => c.status === 'In Process').length
    const onHoldComplaints = complaints.filter(c => c.status === 'On Hold').length
    const testingComplaints = complaints.filter(c => c.status === 'Testing').length
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length

    // Average resolution time (in days)
    const resolvedComplaintsWithTime = complaints.filter(c => 
      c.status === 'Resolved' && c.resolvedAt && c.createdAt
    )
    
    let avgResolutionTime = 0
    if (resolvedComplaintsWithTime.length > 0) {
      const totalResolutionTime = resolvedComplaintsWithTime.reduce((sum, complaint) => {
        const created = new Date(complaint.createdAt)
        const resolved = new Date(complaint.resolvedAt!)
        const diffTime = Math.abs(resolved.getTime() - created.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return sum + diffDays
      }, 0)
      avgResolutionTime = Math.round((totalResolutionTime / resolvedComplaintsWithTime.length) * 10) / 10
    }

    // Recent complaints (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentComplaints = complaints.filter(complaint => {
      const createdDate = new Date(complaint.createdAt)
      return createdDate >= sevenDaysAgo
    }).length

    const stats = {
      totalComplaints,
      openComplaints,
      inProcessComplaints,
      onHoldComplaints,
      testingComplaints,
      resolvedComplaints,
      resolvedThisWeek,
      resolvedThisMonth,
      recentComplaints,
      avgResolutionTime
    }

    return NextResponse.json(stats, { status: 200 })

  } catch (error) {
    console.error('Error fetching complaint stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaint statistics' },
      { status: 500 }
    )
  }
}

