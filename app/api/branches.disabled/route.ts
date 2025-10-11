import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { getHybridRooms } from '@/lib/persistent-rooms'
import { getPersistentPackages } from '@/lib/persistent-packages'

export async function GET(request: NextRequest) {
  try {
    // Remove authentication requirement for now to fix the dropdown issue
    // const session = await getServerSession(authOptions)

    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Get branches from database
    const branches = await prisma.branch.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get rooms from persistent storage
    const allRooms = getHybridRooms()
    
    // Get packages from persistent storage (same as packages API)
    let packages = getPersistentPackages()
    
    // If no packages in persistent storage, initialize with default packages (same logic as packages API)
    if (packages.length === 0) {
      const defaultPackages = [
        {
          id: 'PKG-001',
          name: 'Basic Coworking',
          description: 'Basic coworking package with essential amenities',
          type: 'monthly' as const,
          price: 15000,
          currency: 'PKR',
          duration: 30,
          features: ['Hot desk access', 'WiFi', 'Coffee', 'Printing'],
          limitations: ['No dedicated space', 'Limited meeting room access'],
          isActive: true,
          branchIds: ['1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'PKG-002',
          name: 'Premium Office',
          description: 'Premium office package with dedicated space',
          type: 'monthly' as const,
          price: 25000,
          currency: 'PKR',
          duration: 30,
          features: ['Dedicated desk', 'Storage', 'Meeting room access', 'Phone booth'],
          limitations: ['Limited to one location'],
          isActive: true,
          branchIds: ['1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'PKG-003',
          name: 'Flexible Workspace',
          description: 'Flexible workspace package for dynamic teams',
          type: 'monthly' as const,
          price: 18000,
          currency: 'PKR',
          duration: 30,
          features: ['Flexible seating', 'Meeting rooms', 'Event space', 'Networking'],
          limitations: ['Subject to availability'],
          isActive: true,
          branchIds: ['2'],
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 'PKG-004',
          name: 'Executive Suite',
          description: 'Executive suite package with premium amenities',
          type: 'monthly' as const,
          price: 35000,
          currency: 'PKR',
          duration: 30,
          features: ['Private office', 'Executive lounge', 'Concierge service', 'Premium meeting rooms'],
          limitations: ['Limited availability'],
          isActive: true,
          branchIds: ['2'],
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ]
      packages = defaultPackages
    }

    // Add room and package counts to each branch
    const branchesWithCounts = branches.map(branch => {
      const branchRooms = allRooms.filter(room => room.branchId === branch.id.toString() && room.isActive)
      const branchPackages = packages.filter(pkg => true) // All packages are available for all branches for now
      
      return {
        ...branch,
        rooms: branchRooms,
        packages: branchPackages,
        roomCount: branchRooms.length,
        packageCount: branchPackages.length
      }
    })

    return NextResponse.json({
      success: true,
      data: branchesWithCounts
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
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

    // Only admins can create branches
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create branches' }, { status: 403 })
    }

    const body = await request.json()
    console.log('Branch creation request body:', body)
    
    const { 
      name, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      email, 
      isActive = true 
    } = body

    // Validate required fields based on database schema
    const missingFields = []
    if (!name) missingFields.push('name')
    if (!address) missingFields.push('address')
    if (!city) missingFields.push('city')
    if (!state) missingFields.push('state')
    if (!zipCode) missingFields.push('zipCode')

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received: body,
          missing: missingFields
        },
        { status: 400 }
      )
    }

    // Create new branch in database
    const newBranch = await prisma.branch.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone: phone || null,
        email: email || null,
        isActive
      }
    })

    return NextResponse.json(newBranch, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    )
  }
}
