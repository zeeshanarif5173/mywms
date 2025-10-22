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

export async function GET(request: NextRequest) {
  try {
    // Fetch all data from persistent storage
    const [
      complaints,
      customers,
      bookings,
      tasks
    ] = [
      getPersistentComplaints(),
      getPersistentUsers(),
      getPersistentBookings(),
      getPersistentTasks()
    ]

    // Calculate statistics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.accountStatus === 'Active').length
    const lockedCustomers = customers.filter(c => c.accountStatus === 'Locked').length
    
    const totalComplaints = complaints.length
    const openComplaints = complaints.filter(c => c.status === 'Open').length
    const inProcessComplaints = complaints.filter(c => c.status === 'In Process').length
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length
    
    const totalTasks = tasks.length
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length
    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    
    const totalBookings = bookings.length
    const activeBookings = bookings.filter(b => new Date(b.endTime) > new Date()).length
    
    const totalTimeEntries = 0 // TODO: Add time tracking persistent storage
    const totalHours = 0 // TODO: Add time tracking persistent storage

    // Calculate revenue (simplified for now)
    const totalRevenue = 0 // TODO: Add revenue calculation

    // Recent activity (last 5 complaints)
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

    // Top customers (simplified for now)
    const topCustomers = customers
      .slice(0, 5)
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        hours: 0 // TODO: Add actual time tracking
      }))

    return NextResponse.json({
      // User Statistics
      totalCustomers,
      activeCustomers,
      lockedCustomers,
      
      // Complaint Statistics
      totalComplaints,
      openComplaints,
      inProcessComplaints,
      resolvedComplaints,
      
      // Task Statistics
      totalTasks,
      pendingTasks,
      completedTasks,
      
      // Booking Statistics
      totalBookings,
      activeBookings,
      
      // Time Tracking Statistics
      totalTimeEntries,
      totalHours: Math.round(totalHours * 10) / 10,
      
      // Revenue Statistics
      totalRevenue: Math.round(totalRevenue),
      
      // Additional Data
      topCustomers,
      recentActivity: recentComplaints
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 })
  }
}