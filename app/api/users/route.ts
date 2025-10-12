import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // Fetch users from database (using Customer model for business users)
    const users = await prisma.customer.findMany({
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)

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

    // Check if user already exists (both in Customer and User models)
    let existingCustomer, existingUser
    try {
      [existingCustomer, existingUser] = await Promise.all([
        prisma.customer.findUnique({ where: { email } }),
        prisma.user.findUnique({ where: { email } })
      ])
    } catch (error) {
      console.error('Error checking existing users:', error)
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      )
    }

    if (existingCustomer || existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered in the system. Please use a different email or update the existing user.' },
        { status: 400 }
      )
    }

    // Generate gatePassId if not provided
    const finalGatePassId = gatePassId || `GP-${Date.now()}`
    
    // Check if branch exists
    const branchIdInt = parseInt(branchId) || 1
    let branch
    try {
      branch = await prisma.branch.findUnique({
        where: { id: branchIdInt }
      })
    } catch (error) {
      console.error('Error checking branch:', error)
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      )
    }
    
    if (!branch) {
      return NextResponse.json(
        { error: `Branch with ID ${branchIdInt} not found` },
        { status: 400 }
      )
    }
    
    // Create new user in database (Customer model doesn't store password)
    const newUser = await prisma.customer.create({
      data: {
        name,
        email,
        phone: phone || '',
        company: companyName || '',
        accountStatus: accountStatus || 'Active',
        gatePassId: finalGatePassId,
        packageId: packageId ? parseInt(packageId) : null,
        branchId: branchIdInt,
        remarks: remarks || ''
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

    return NextResponse.json(newUser, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    console.error('Error details:', error)
    
    // Return more specific error message
    let errorMessage = 'Failed to create user'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
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
    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'ID, name, and email are required' },
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

    // Check if user exists
    const existingUser = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if new email already exists
    if (email !== existingUser.email) {
      const [existingCustomer, existingAuthUser] = await Promise.all([
        prisma.customer.findUnique({ where: { email } }),
        prisma.user.findUnique({ where: { email } })
      ])

      if (existingCustomer || existingAuthUser) {
        return NextResponse.json(
          { error: 'This email is already registered in the system. Please use a different email.' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone: phone || '',
      branchId: parseInt(branchId) || 1,
      accountStatus: accountStatus || 'Active',
      company: companyName || '',
      packageId: packageId ? parseInt(packageId) : null,
      gatePassId: gatePassId || '',
      remarks: remarks || ''
    }

    // Update user in database (Customer model doesn't store password)
    const updatedUser = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser, { status: 200 })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
