import { NextRequest, NextResponse } from 'next/server'
import { getPersistentUsers } from '@/lib/persistent-storage'
import { getPersistentStaffTimeEntries } from '@/lib/persistent-storage'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const staffId = searchParams.get('staffId')
    const branchId = searchParams.get('branchId')

    // Get all users (staff members)
    const users = getPersistentUsers()
    const staffMembers = users.filter(user => user.role === 'STAFF' || user.role === 'TEAM_LEAD')

    // Get time entries
    const timeEntries = getPersistentStaffTimeEntries()

    // Filter time entries based on date range
    let filteredTimeEntries = timeEntries
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredTimeEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= start && entryDate <= end
      })
    }

    // Filter by staff ID if provided
    if (staffId) {
      filteredTimeEntries = filteredTimeEntries.filter(entry => entry.staffId === staffId)
    }

    // Filter by branch ID if provided
    if (branchId) {
      filteredTimeEntries = filteredTimeEntries.filter(entry => entry.branchId === branchId)
    }

    // Process staff attendance data
    const staffAttendance = staffMembers.map(staff => {
      const staffTimeEntries = filteredTimeEntries.filter(entry => entry.staffId === staff.id)
      
      // Calculate statistics
      const totalHours = staffTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 // Convert minutes to hours
      const totalDays = new Set(staffTimeEntries.map(entry => entry.date)).size
      const averageHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0
      const completedEntries = staffTimeEntries.filter(entry => entry.status === 'Checked Out').length
      
      // Determine current status
      const lastEntry = staffTimeEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      const currentStatus = lastEntry ? lastEntry.status : 'Never'

      return {
        staff: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          branchId: staff.branchId || '1',
          accountStatus: staff.accountStatus || 'ACTIVE'
        },
        timeEntries: staffTimeEntries,
        stats: {
          totalHours: Math.round(totalHours),
          totalDays,
          averageHoursPerDay: parseFloat(averageHoursPerDay),
          totalEntries: staffTimeEntries.length,
          completedEntries,
          currentStatus
        },
        currentStatus
      }
    })

    // Calculate overall statistics
    const overallStats = {
      totalStaff: staffMembers.length,
      currentlyCheckedIn: staffAttendance.filter(data => data.currentStatus === 'Checked In').length,
      totalHours: staffAttendance.reduce((sum, data) => sum + data.stats.totalHours, 0),
      totalWorkingDays: staffAttendance.reduce((sum, data) => sum + data.stats.totalDays, 0),
      averageHoursPerStaff: staffMembers.length > 0 
        ? Math.round(staffAttendance.reduce((sum, data) => sum + data.stats.totalHours, 0) / staffMembers.length)
        : 0
    }

    return NextResponse.json({
      staffAttendance,
      overallStats
    })
  } catch (error) {
    console.error('Error fetching staff attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch staff attendance' }, { status: 500 })
  }
}