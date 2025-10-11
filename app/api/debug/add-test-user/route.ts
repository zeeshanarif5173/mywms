import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridUsers, savePersistentUsers } from '@/lib/persistent-storage'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can add test users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get existing users
    const existingUsers = getHybridUsers()

    // Create test user
    const testUser = {
      id: `user-${Date.now()}`,
      name: 'Asim Khan',
      email: 'asim.khan@company.com',
      phone: '+1-555-0013',
      role: 'STAFF',
      category: 'Staff',
      branchId: '1',
      accountStatus: 'Active',
      companyName: 'Maintenance Team',
      remarks: 'Test user added via debug API',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Check if user already exists
    const existingUser = existingUsers.find(u => u.email === testUser.email)
    if (existingUser) {
      return NextResponse.json(
        { 
          message: 'User already exists',
          user: existingUser,
          totalUsers: existingUsers.length
        },
        { status: 200 }
      )
    }

    // Add to persistent storage
    const updatedUsers = [...existingUsers, testUser]
    savePersistentUsers(updatedUsers)

    return NextResponse.json({
      message: 'Test user added successfully',
      user: testUser,
      totalUsers: updatedUsers.length
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding test user:', error)
    return NextResponse.json(
      { error: 'Failed to add test user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view debug info
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all users
    const allUsers = getHybridUsers()

    return NextResponse.json({
      message: 'Debug info',
      totalUsers: allUsers.length,
      users: allUsers,
      staffUsers: allUsers.filter(u => u.role === 'STAFF'),
      teamUsers: allUsers.filter(u => u.role === 'TEAM_LEAD')
    }, { status: 200 })

  } catch (error) {
    console.error('Error getting debug info:', error)
    return NextResponse.json(
      { error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}
