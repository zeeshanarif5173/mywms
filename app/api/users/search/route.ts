import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getAllCustomers, getAllManagers, getAllAdmins } from '@/lib/mock-data'
import { getHybridUsers } from '@/lib/persistent-storage'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can search users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Get all users from different roles
    const customers = getAllCustomers()
    const managers = getAllManagers()
    const admins = getAllAdmins()

    // Get all users from persistent storage (including newly added users)
    const additionalUsers = getHybridUsers()

    // Combine all users with their role information (excluding customers for task assignment)
    const allUsers = [
      ...managers.map((manager: any) => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
        role: 'MANAGER',
        branchId: manager.branchId,
        accountStatus: manager.accountStatus
      })),
      ...admins.map((admin: any) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'ADMIN',
        branchId: admin.branchId,
        accountStatus: admin.accountStatus
      })),
      ...additionalUsers.filter((user: any) => 
        user.role === 'STAFF' || user.role === 'TEAM_LEAD' || user.role === 'VENDOR'
      )
    ]

    // Filter users based on search query
    let filteredUsers = allUsers

    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim()
      filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().trim().includes(searchTerm) ||
        user.email.toLowerCase().trim().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
      )
    }

    // Sort by name
    filteredUsers.sort((a, b) => a.name.localeCompare(b.name))

    // Limit results to 50 for performance
    const limitedUsers = filteredUsers.slice(0, 50)

    return NextResponse.json(limitedUsers, { status: 200 })

  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
