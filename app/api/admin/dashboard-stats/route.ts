import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

export async function GET(request: NextRequest) {
  // Return mock data during build to prevent build failures
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return NextResponse.json({
      totalCustomers: 0,
      activeAccounts: 0,
      lockedAccounts: 0,
      totalTimeEntries: 0,
      totalBookings: 0,
      averageSessionDuration: 0,
      topCustomers: [],
      recentActivity: []
    })
  }

  try {
    // Check if Prisma client is available
    if (!prisma || typeof prisma.customer === 'undefined') {
      console.error('Prisma client not available during build')
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can access dashboard stats
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can access dashboard stats' }, { status: 403 })
    }

    // Get real data from database
    const [totalUsers, activeUsers, lockedUsers, timeEntries] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { accountStatus: 'Active' } }),
      prisma.customer.count({ where: { accountStatus: 'Locked' } }),
      prisma.timeEntry.findMany()
    ])

    // Calculate stats
    const totalCustomers = totalUsers
    const activeAccounts = activeUsers
    const lockedAccounts = lockedUsers

    // Calculate monthly revenue based on time entries (simplified calculation)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyTimeEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })

    // Estimate revenue: assume Rs 20/hour average rate
    const monthlyHours = monthlyTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
    const monthlyRevenue = Math.round(monthlyHours * 20)

    const stats = {
      totalCustomers,
      activeAccounts,
      lockedAccounts,
      monthlyRevenue
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

