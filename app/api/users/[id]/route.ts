import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridUsers, savePersistentUsers } from '@/lib/persistent-storage'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { name, email, phone, role, branchId, accountStatus, companyName, remarks } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get existing users from persistent storage
    const existingUsers = getHybridUsers()

    // Find the user to update
    const userIndex = existingUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user data
    const updatedUser = {
      ...existingUsers[userIndex],
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(role !== undefined && { role }),
      ...(branchId !== undefined && { branchId }),
      ...(accountStatus !== undefined && { accountStatus }),
      ...(companyName !== undefined && { companyName }),
      ...(remarks !== undefined && { remarks }),
      updatedAt: new Date().toISOString()
    }

    // Update the user in the array
    existingUsers[userIndex] = updatedUser

    // Save back to persistent storage
    savePersistentUsers(existingUsers)

    return NextResponse.json(updatedUser, { status: 200 })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get existing users from persistent storage
    const existingUsers = getHybridUsers()

    // Filter out the user to delete
    const updatedUsers = existingUsers.filter(u => u.id !== userId)

    // Save back to persistent storage
    savePersistentUsers(updatedUsers)

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
