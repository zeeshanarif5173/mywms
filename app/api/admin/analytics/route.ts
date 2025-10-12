import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view analytics
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all data from database
    const [customers, timeEntries, bookings] = await Promise.all([
      prisma.customer.findMany(),
      prisma.timeEntry.findMany(),
      prisma.booking.findMany()
    ])

    // Calculate analytics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.accountStatus === 'Active').length
    const lockedCustomers = customers.filter(c => c.accountStatus === 'Locked').length

    // Booking analytics
    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length
    const completedBookings = bookings.filter(b => b.status === 'Completed').length
    const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length

    // Time tracking analytics
    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 // Convert minutes to hours
    const averageSessionTime = timeEntries.length > 0 ? totalHours / timeEntries.length : 0

    // Revenue calculation (assuming Rs 20/hour)
    const hourlyRate = 20
    const totalRevenue = totalHours * hourlyRate

    // Current month data
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // This month's bookings
    const thisMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    }).length

    // Last month's bookings (for comparison)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const lastMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear
    }).length

    // This month's new customers
    const thisMonthCustomers = customers.filter(customer => {
      const createdDate = new Date(customer.createdAt)
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
    }).length

    // Peak hours analysis
    const hourCounts: { [key: string]: number } = {}
    bookings.forEach(booking => {
      const hour = parseInt(booking.startTime.split(':')[0])
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 1)
      .map(([hour]) => {
        const hourNum = parseInt(hour)
        const period = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum)
        return `${displayHour}:00 ${period}`
      })

    // Most popular room
    const roomCounts: { [key: string]: number } = {}
    bookings.forEach(booking => {
      roomCounts[booking.roomId] = (roomCounts[booking.roomId] || 0) + 1
    })
    
    const mostPopularRoom = Object.entries(roomCounts)
      .sort(([,a], [,b]) => b - a)[0]

    // Growth calculations
    const customerGrowth = lastMonthBookings > 0 ? 
      ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0
    
    const bookingGrowth = lastMonthBookings > 0 ? 
      ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0

    // Churn rate (customers who haven't logged in recently)
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const activeRecently = customers.filter(customer => {
      // This is a simplified calculation - in a real system you'd track last login
      return new Date(customer.createdAt) > thirtyDaysAgo
    }).length
    const churnRate = totalCustomers > 0 ? ((totalCustomers - activeRecently) / totalCustomers) * 100 : 0

    // Average lifetime value (simplified)
    const avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

    // Retention rate (simplified)
    const retentionRate = 100 - churnRate

    // System performance (mock data for now)
    const systemPerformance = {
      uptime: 99.9,
      avgResponseTime: 245,
      activeSessions: Math.min(totalCustomers, 89), // Simplified
      serverLoad: 'Low'
    }

    const analytics = {
      // Main stats
      totalCustomers,
      activeCustomers,
      lockedCustomers,
      totalBookings,
      totalRevenue: Math.round(totalRevenue),
      averageSessionTime: Math.round(averageSessionTime * 10) / 10,
      
      // Growth metrics
      customerGrowth: Math.round(customerGrowth * 10) / 10,
      bookingGrowth: Math.round(bookingGrowth * 10) / 10,
      revenueGrowth: Math.round(bookingGrowth * 10) / 10, // Simplified
      
      // Monthly data
      thisMonthBookings,
      lastMonthBookings,
      thisMonthCustomers,
      
      // Detailed analytics
      peakHours: peakHours[0] || '10:00 AM',
      mostPopularRoom: mostPopularRoom ? mostPopularRoom[0] : 'Conference Room A',
      
      // Customer metrics
      churnRate: Math.round(churnRate * 10) / 10,
      avgLifetimeValue: Math.round(avgLifetimeValue),
      retentionRate: Math.round(retentionRate * 10) / 10,
      
      // System performance
      systemPerformance,
      
      // Booking breakdown
      bookingBreakdown: {
        confirmed: confirmedBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      }
    }

    return NextResponse.json(analytics, { status: 200 })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

