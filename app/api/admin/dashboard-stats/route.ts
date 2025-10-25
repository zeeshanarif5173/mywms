import { NextRequest, NextResponse } from 'next/server'
import { getPersistentUsers } from '@/lib/persistent-storage'
import { getPersistentTasks } from '@/lib/persistent-tasks'
import { getPersistentComplaints } from '@/lib/persistent-complaints'
import { getPersistentBookings } from '@/lib/persistent-bookings'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

// Simple in-memory cache for dashboard stats
let cachedStats: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 seconds

export async function GET(request: NextRequest) {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedStats)
    }

    // Fetch all data from persistent storage in parallel
    const [complaints, customers, bookings, tasks] = await Promise.all([
      Promise.resolve(getPersistentComplaints()),
      Promise.resolve(getPersistentUsers()),
      Promise.resolve(getPersistentBookings()),
      Promise.resolve(getPersistentTasks())
    ])

    // Optimize calculations with single-pass filtering
    const customerStats = customers.reduce((acc, c) => {
      acc.total++
      if (c.accountStatus === 'Active') acc.active++
      if (c.accountStatus === 'Locked') acc.locked++
      return acc
    }, { total: 0, active: 0, locked: 0 })

    const complaintStats = complaints.reduce((acc, c) => {
      acc.total++
      if (c.status === 'Open') acc.open++
      if (c.status === 'In Process') acc.inProcess++
      if (c.status === 'Resolved') acc.resolved++
      return acc
    }, { total: 0, open: 0, inProcess: 0, resolved: 0 })

    const taskStats = tasks.reduce((acc, t) => {
      acc.total++
      if (t.status === 'Pending') acc.pending++
      if (t.status === 'Completed') acc.completed++
      return acc
    }, { total: 0, pending: 0, completed: 0 })

    const bookingStats = bookings.reduce((acc, b) => {
      acc.total++
      if (new Date(b.endTime) > new Date()) acc.active++
      return acc
    }, { total: 0, active: 0 })

    // Optimize recent activity with single sort and slice
    const recentComplaints = complaints
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(complaint => ({
        id: complaint.id,
        type: 'complaint',
        title: complaint.title,
        customer: `Customer ${complaint.customerId}`,
        status: complaint.status,
        createdAt: complaint.createdAt
      }))

    // Optimize top customers
    const topCustomers = customers
      .slice(0, 5)
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        hours: 0
      }))

    const stats = {
      // User Statistics
      totalCustomers: customerStats.total,
      activeCustomers: customerStats.active,
      lockedCustomers: customerStats.locked,
      
      // Complaint Statistics
      totalComplaints: complaintStats.total,
      openComplaints: complaintStats.open,
      inProcessComplaints: complaintStats.inProcess,
      resolvedComplaints: complaintStats.resolved,
      
      // Task Statistics
      totalTasks: taskStats.total,
      pendingTasks: taskStats.pending,
      completedTasks: taskStats.completed,
      
      // Booking Statistics
      totalBookings: bookingStats.total,
      activeBookings: bookingStats.active,
      
      // Time Tracking Statistics
      totalTimeEntries: 0,
      totalHours: 0,
      
      // Revenue Statistics
      totalRevenue: 0,
      
      // Additional Data
      topCustomers,
      recentActivity: recentComplaints
    }

    // Cache the results
    cachedStats = stats
    cacheTimestamp = now

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 })
  }
}