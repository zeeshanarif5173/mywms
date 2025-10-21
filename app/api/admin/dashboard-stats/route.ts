import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllComplaints, 
  getAllCustomers, 
  getAllTimeEntries, 
  getAllBookings,
  getAllTasks 
} from '@/lib/db-service'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel for better performance
    const [
      complaints,
      customers,
      timeEntries,
      bookings,
      tasks
    ] = await Promise.all([
      getAllComplaints(),
      getAllCustomers(),
      getAllTimeEntries(),
      getAllBookings(),
      getAllTasks()
    ])

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
    
    const totalTimeEntries = timeEntries.length
    const totalHours = timeEntries.reduce((sum, entry) => {
      if (entry.checkOutTime) {
        const duration = new Date(entry.checkOutTime).getTime() - new Date(entry.checkInTime).getTime()
        return sum + (duration / (1000 * 60 * 60)) // Convert to hours
      }
      return sum
    }, 0)

    // Calculate revenue (assuming average package price)
    const totalRevenue = customers.reduce((sum, customer) => {
      if (customer.package) {
        return sum + customer.package.price
      }
      return sum
    }, 0)

    // Recent activity (last 5 complaints)
    const recentComplaints = complaints
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(complaint => ({
        id: complaint.id,
        type: 'complaint',
        title: complaint.title,
        customer: complaint.customer?.name || `Customer ${complaint.customerId}`,
        status: complaint.status,
        createdAt: complaint.createdAt
      }))

    // Top customers by time spent
    const customerTimeMap = new Map()
    timeEntries.forEach(entry => {
      if (entry.checkOutTime) {
        const duration = new Date(entry.checkOutTime).getTime() - new Date(entry.checkInTime).getTime()
        const hours = duration / (1000 * 60 * 60)
        const customerId = entry.customerId
        customerTimeMap.set(customerId, (customerTimeMap.get(customerId) || 0) + hours)
      }
    })

    const topCustomers = Array.from(customerTimeMap.entries())
      .map(([customerId, hours]) => {
        const customer = customers.find(c => c.id.toString() === customerId)
        return {
          id: customerId,
          name: customer?.name || `Customer ${customerId}`,
          hours: Math.round(hours * 10) / 10
        }
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

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