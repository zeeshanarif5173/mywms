import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can view all users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // For now, return empty array since we're using mock data
    // In a real system, you would fetch from database
    return NextResponse.json([])

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      email, 
      password, 
      phone, 
      role, 
      branchId, 
      accountStatus, 
      companyName, 
      packageId, 
      gatePassId, 
      remarks 
    } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real system, this would be hashed
      phone: phone || '',
      role,
      branchId: branchId || '1',
      accountStatus: accountStatus || 'Active',
      companyName: companyName || '',
      packageId: packageId || '',
      gatePassId: gatePassId || '',
      remarks: remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real system, you would save to database here
    // For now, we'll just return the created user
    console.log('New user created:', newUser)

    return NextResponse.json(newUser, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      id,
      name, 
      email, 
      password, 
      phone, 
      role, 
      branchId, 
      accountStatus, 
      companyName, 
      packageId, 
      gatePassId, 
      remarks 
    } = body

    // Validate required fields
    if (!id || !name || !email || !role) {
      return NextResponse.json(
        { error: 'ID, name, email, and role are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // If password is provided, validate it
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create updated user object
    const updatedUser = {
      id,
      name,
      email,
      password: password || undefined, // Only include if provided
      phone: phone || '',
      role,
      branchId: branchId || '1',
      accountStatus: accountStatus || 'Active',
      companyName: companyName || '',
      packageId: packageId || '',
      gatePassId: gatePassId || '',
      remarks: remarks || '',
      updatedAt: new Date().toISOString()
    }

    // In a real system, you would update the database here
    console.log('User updated:', updatedUser)

    return NextResponse.json(updatedUser, { status: 200 })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
