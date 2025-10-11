import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getAllStaffTimeEntries, getStaffTimeStats } from '@/lib/mock-data'
import { getHybridUsers } from '@/lib/persistent-storage'

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

    // Get all staff users
    const allUsers = getHybridUsers()
    const staffUsers = allUsers.filter((user: any) => 
      user.role === 'STAFF' || user.role === 'TEAM_LEAD'
    )

    // Get attendance data for all staff
    const staffAttendanceData = staffUsers.map((staff: any) => {
      const timeEntries = getAllStaffTimeEntries(staff.id, startDate || undefined, endDate || undefined)
      const stats = getStaffTimeStats(staff.id, startDate || undefined, endDate || undefined)
      
      return {
        staff: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          branchId: staff.branchId,
          accountStatus: staff.accountStatus
        },
        timeEntries,
        stats,
        currentStatus: stats.currentStatus
      }
    })

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
