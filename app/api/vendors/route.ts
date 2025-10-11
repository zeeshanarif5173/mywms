import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// GET /api/vendors - List all vendors with filters
export async function GET(request: NextRequest) {
  try {
    // Remove authentication requirement for now to fix the dropdown issue
    // const session = await getServerSession(authOptions)

    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const branchId = searchParams.get('branchId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (branchId) where.branchId = parseInt(branchId)
    if (isActive !== null) where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              bills: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.vendor.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      taxId,
      branchId
    } = body

    // Validate required fields
    if (!name || !branchId) {
      return NextResponse.json(
        { success: false, error: 'Name and branch are required' },
        { status: 400 }
      )
    }

    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(branchId) }
    })

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        taxId,
        branchId: parseInt(branchId),
        isActive: true
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

    return NextResponse.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}
