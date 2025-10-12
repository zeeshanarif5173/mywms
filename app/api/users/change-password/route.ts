import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword, userId } = body

    // Validate input
    if (!currentPassword || !newPassword || !userId) {
      return NextResponse.json(
        { error: 'Current password, new password, and user ID are required' },
        { status: 400 }
      )
    }

    // For now, we'll use a simple validation since we're using hardcoded credentials
    // In a real system, you would verify the current password against the database
    
    // Check if the user is trying to change their own password or is an admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only change your own password' },
        { status: 403 }
      )
    }

    // For demo purposes, we'll accept any current password
    // In a real system, you would:
    // 1. Hash the current password
    // 2. Compare it with the stored hash
    // 3. Hash the new password
    // 4. Update the database

    // Simulate password change (in real app, update database)
    console.log(`Password changed for user ${userId}`)

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
