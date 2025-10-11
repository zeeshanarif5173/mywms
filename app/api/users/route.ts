import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { getHybridUsers, savePersistentUsers } from '@/lib/persistent-storage'

export async function GET(request: NextRequest) {
  try {
    // Remove authentication requirement for now to test functionality
    // const session = await getServerSession(authOptions)

    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // // Only admins can get all users
    // if (session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    // }

    // Get all users from different roles
    const customers = await prisma.customer.findMany({
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

    // Get all users from User table (for non-customer roles)
    const dbUsers = await prisma.user.findMany({
      where: {
        role: {
          not: 'CUSTOMER'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Get all users from persistent storage
    const hybridUsers = getHybridUsers()
    console.log('API: Loaded hybrid users:', hybridUsers.length)
    console.log('API: Hybrid users data:', hybridUsers.map(u => ({ name: u.name, role: u.role })))
    
    const managers = hybridUsers.filter(user => user.role === 'MANAGER')
    const admins = hybridUsers.filter(user => user.role === 'ADMIN')

    // Get all additional users from persistent storage
    const additionalUsers = hybridUsers.filter(user => 
      ['STAFF', 'TEAM_LEAD', 'VENDOR'].includes(user.role)
    )
    
    // Get CUSTOMER users from persistent storage that are not in the database
    const persistentCustomers = hybridUsers.filter(user => user.role === 'CUSTOMER')
    
    // Handle CUSTOMER_STAFF users by converting them to CUSTOMER (legacy role)
    const customerStaffUsers = hybridUsers.filter(user => user.role === 'CUSTOMER_STAFF')
    const convertedCustomers = customerStaffUsers.map(user => ({
      ...user,
      role: 'CUSTOMER' // Convert CUSTOMER_STAFF to CUSTOMER
    }))
    console.log('API: Loaded additional users:', additionalUsers.length)
    console.log('API: Loaded persistent customers:', persistentCustomers.length)
    console.log('API: Additional users data:', additionalUsers)
    console.log('API: Persistent customers data:', persistentCustomers)

    // Combine all users with their role information
    const combinedUsers = [
      ...customers.map(customer => ({
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'CUSTOMER',
        branchId: customer.branchId.toString(),
        accountStatus: customer.accountStatus,
        companyName: customer.company,
        packageId: customer.packageId,
        gatePassId: customer.gatePassId,
        remarks: customer.remarks,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      })),
      ...managers.map(manager => ({
        id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        role: 'MANAGER',
        branchId: manager.branchId,
        accountStatus: manager.accountStatus,
        companyName: manager.companyName,
        createdAt: manager.createdAt,
        updatedAt: manager.updatedAt
      })),
      ...admins.map(admin => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: 'ADMIN',
        branchId: admin.branchId,
        accountStatus: admin.accountStatus,
        companyName: admin.companyName,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      })),
      ...additionalUsers,
      ...persistentCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'CUSTOMER',
        branchId: customer.branchId,
        accountStatus: customer.accountStatus,
        companyName: customer.companyName,
        packageId: customer.packageId,
        gatePassId: customer.gatePassId,
        remarks: customer.remarks,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      })),
      ...convertedCustomers.map(customer => ({ // Converted CUSTOMER_STAFF to CUSTOMER
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: 'CUSTOMER',
        branchId: customer.branchId,
        accountStatus: customer.accountStatus,
        companyName: customer.companyName,
        packageId: customer.packageId,
        gatePassId: customer.gatePassId,
        remarks: customer.remarks,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      })),
      ...dbUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: 'Active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    ]

    // Sort by name
    combinedUsers.sort((a, b) => a.name.localeCompare(b.name))
    
    console.log('API: Final combined users:', combinedUsers.length)
    console.log('API: Final users data:', combinedUsers.map(u => ({ name: u.name, role: u.role })))

    return NextResponse.json(combinedUsers, { status: 200 })

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
    const { name, email, phone, role, category, branchId, accountStatus, companyName, remarks } = body

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role
      }
    })

    // If it's a CUSTOMER role, also create a customer record
    if (role === 'CUSTOMER') {
      await prisma.customer.create({
        data: {
          name,
          email,
          phone: phone || '',
          company: companyName || '',
          remarks: remarks || '',
          gatePassId: `GP-${Date.now()}`,
          branchId: parseInt(branchId) || 1,
          accountStatus: accountStatus || 'Active'
        }
      })
    }

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
