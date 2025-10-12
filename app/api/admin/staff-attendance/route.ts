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

    // Only admins can view all staff attendance
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')
    const branchId = searchParams.get('branchId')

    // Get all staff users from database (using Customer model for business users)
    const staffUsers = await prisma.customer.findMany({
      where: {
        OR: [
          { remarks: { contains: 'STAFF' } },
          { remarks: { contains: 'TEAM_LEAD' } }
        ]
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Get attendance data for all staff
    const staffAttendanceData = await Promise.all(staffUsers.map(async (staff) => {
      // Get time entries for this staff member
      const whereClause: any = {
        customerId: staff.id
      }

      if (startDate && endDate) {
        // Since date is stored as string in YYYY-MM-DD format, we can use string comparison
        whereClause.date = {
          gte: startDate,
          lte: endDate
        }
      }

      const timeEntries = await prisma.timeEntry.findMany({
        where: whereClause,
        orderBy: {
          date: 'desc'
        }
      })

      // Calculate stats
      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
      const totalDays = new Set(timeEntries.map(entry => entry.date)).size
      const currentEntry = timeEntries.find(entry => !entry.checkOutTime)
      const currentStatus = currentEntry ? 'Checked In' : 'Checked Out'
      
      const stats = {
        totalHours: Math.round(totalHours * 100) / 100,
        totalDays,
        currentStatus
      }
      
      return {
        staff: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.remarks?.includes('STAFF') ? 'STAFF' : 'TEAM_LEAD',
          branchId: staff.branchId,
          accountStatus: staff.accountStatus,
          branch: staff.branch
        },
        timeEntries,
        stats,
        currentStatus: stats.currentStatus
      }
    }))

    // Filter by branch if specified
    let filteredData = staffAttendanceData
    if (branchId) {
      filteredData = staffAttendanceData.filter((data: any) => data.staff.branchId === branchId)
    }

    // Filter by specific staff if specified
    if (staffId) {
      filteredData = filteredData.filter((data: any) => data.staff.id === staffId)
    }

    // Calculate overall statistics
    const overallStats = {
      totalStaff: filteredData.length,
      currentlyCheckedIn: filteredData.filter((data: any) => data.currentStatus === 'Checked In').length,
      totalHours: filteredData.reduce((sum: number, data: any) => sum + data.stats.totalHours, 0),
      totalWorkingDays: filteredData.reduce((sum: number, data: any) => sum + data.stats.totalDays, 0),
      averageHoursPerStaff: filteredData.length > 0 
        ? Math.round((filteredData.reduce((sum: number, data: any) => sum + data.stats.totalHours, 0) / filteredData.length) * 100) / 100
        : 0
    }

    return NextResponse.json({
      staffAttendance: filteredData,
      overallStats,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        staffId: staffId || null,
        branchId: branchId || null
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching staff attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff attendance data' },
      { status: 500 }
    )
  }
}
