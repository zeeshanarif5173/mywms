import { NextRequest, NextResponse } from 'next/server'
import { getPersistentUsers, savePersistentUsers } from '@/lib/persistent-storage'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Get users from persistent storage
    const users = getPersistentUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, role, packageId, branchId, remarks } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Get existing users from persistent storage
    const existingUsers = getPersistentUsers()
    
    // Check if email already exists
    const emailExists = existingUsers.some(user => user.email === email)
    if (emailExists) {
      return NextResponse.json({ error: 'Email already exists in the system' }, { status: 400 })
    }

    // Generate unique IDs
    const gatePassId = `GP-${Math.floor(10000000 + Math.random() * 90000000)}`
    const userId = `user-${Date.now()}`
    
    // Create new user
    const newUser = {
      id: userId,
      name,
      email,
      phone: phone || '',
      company: company || '',
      role: role || 'CUSTOMER',
      accountStatus: 'Active',
      gatePassId,
      packageId: packageId ? parseInt(packageId) : null,
      branchId: branchId ? parseInt(branchId) : 1,
      remarks: remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedUsers = [...existingUsers, newUser]
    savePersistentUsers(updatedUsers)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, company, role, packageId, branchId, remarks, accountStatus } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get existing users from persistent storage
    const existingUsers = getPersistentUsers()
    
    // Find the user to update
    const userIndex = existingUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email already exists for other users
    if (email && email !== existingUsers[userIndex].email) {
      const emailExists = existingUsers.some(user => user.email === email && user.id !== id)
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists for another user' }, { status: 400 })
      }
    }

    // Update user
    const updatedUser = {
      ...existingUsers[userIndex],
      name: name || existingUsers[userIndex].name,
      email: email || existingUsers[userIndex].email,
      phone: phone || existingUsers[userIndex].phone,
      company: company || existingUsers[userIndex].company,
      role: role || existingUsers[userIndex].role,
      accountStatus: accountStatus || existingUsers[userIndex].accountStatus,
      packageId: packageId ? parseInt(packageId) : existingUsers[userIndex].packageId,
      branchId: branchId ? parseInt(branchId) : existingUsers[userIndex].branchId,
      remarks: remarks !== undefined ? remarks : existingUsers[userIndex].remarks,
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    const updatedUsers = [...existingUsers]
    updatedUsers[userIndex] = updatedUser
    savePersistentUsers(updatedUsers)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get existing users from persistent storage
    const existingUsers = getPersistentUsers()
    
    // Find the user to delete
    const userIndex = existingUsers.findIndex(user => user.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove user from persistent storage
    const updatedUsers = existingUsers.filter(user => user.id !== id)
    savePersistentUsers(updatedUsers)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}