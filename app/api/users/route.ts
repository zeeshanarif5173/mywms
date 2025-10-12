import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      include: {
        branch: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, company, role, password, packageId, branchId, remarks } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if email already exists in User or Customer tables
    const existingUser = await prisma.user.findUnique({ where: { email } })
    const existingCustomer = await prisma.customer.findFirst({ where: { email } })
    
    if (existingUser || existingCustomer) {
      return NextResponse.json({ error: 'Email already exists in the system' }, { status: 400 })
    }

    // Generate unique IDs
    const gatePassId = `GP-${Math.floor(10000000 + Math.random() * 90000000)}`
    
    // Check if package exists
    if (packageId) {
      const packageExists = await prisma.package.findUnique({ where: { id: parseInt(packageId) } })
      if (!packageExists) {
        return NextResponse.json({ error: 'Package not found' }, { status: 400 })
      }
    }

    // Check if branch exists
    if (branchId) {
      const branchExists = await prisma.branch.findUnique({ where: { id: parseInt(branchId) } })
      if (!branchExists) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 400 })
      }
    }

    // Create User record for authentication (NextAuth handles password separately)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'CUSTOMER'
      }
    })

    // Create Customer record for business logic
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone: phone || '',
        company: company || '',
        accountStatus: 'Active',
        gatePassId,
        packageId: packageId ? parseInt(packageId) : null,
        branchId: branchId ? parseInt(branchId) : 1, // Default to branch 1
        remarks: remarks || ''
      },
      include: {
        branch: true
      }
    })

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      accountStatus: customer.accountStatus,
      gatePassId: customer.gatePassId,
      packageId: customer.packageId,
      branchId: customer.branchId,
      remarks: customer.remarks,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      branch: customer.branch
    })
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, phone, company, role, password, packageId, branchId, remarks, accountStatus } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({ where: { id: parseInt(id) } })
    if (!existingCustomer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email already exists for other users
    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findFirst({ 
        where: { 
          email, 
          id: { not: parseInt(id) } 
        } 
      })
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists for another user' }, { status: 400 })
      }
    }

    // Update customer record
    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingCustomer.name,
        email: email || existingCustomer.email,
        phone: phone || existingCustomer.phone,
        company: company || existingCustomer.company,
        accountStatus: accountStatus || existingCustomer.accountStatus,
        packageId: packageId ? parseInt(packageId) : existingCustomer.packageId,
        branchId: branchId ? parseInt(branchId) : existingCustomer.branchId,
        remarks: remarks !== undefined ? remarks : existingCustomer.remarks,
        updatedAt: new Date()
      },
      include: {
        branch: true
      }
    })

    // Note: User record updates would need to be handled separately via NextAuth
    // since there's no direct relation between Customer and User models

    return NextResponse.json({
      id: updatedCustomer.id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      company: updatedCustomer.company,
      accountStatus: updatedCustomer.accountStatus,
      gatePassId: updatedCustomer.gatePassId,
      packageId: updatedCustomer.packageId,
      branchId: updatedCustomer.branchId,
      remarks: updatedCustomer.remarks,
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt,
      branch: updatedCustomer.branch
    })
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}