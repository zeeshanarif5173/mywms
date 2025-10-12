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
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const branches = await prisma.branch.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, city, state, zipCode, phone, email } = body

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Branch name, address, city, state, and zip code are required' }, { status: 400 })
    }

    // Create branch
    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone: phone || '',
        email: email || '',
        isActive: true
      }
    })

    return NextResponse.json({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      phone: branch.phone,
      email: branch.email,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt
    })
  } catch (error) {
    console.error('Error creating branch:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, address, city, state, zipCode, phone, email, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 })
    }

    // Check if branch exists
    const existingBranch = await prisma.branch.findUnique({ where: { id: parseInt(id) } })
    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Update branch
    const updatedBranch = await prisma.branch.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingBranch.name,
        address: address !== undefined ? address : existingBranch.address,
        city: city !== undefined ? city : existingBranch.city,
        state: state !== undefined ? state : existingBranch.state,
        zipCode: zipCode !== undefined ? zipCode : existingBranch.zipCode,
        phone: phone !== undefined ? phone : existingBranch.phone,
        email: email !== undefined ? email : existingBranch.email,
        isActive: isActive !== undefined ? isActive : existingBranch.isActive,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      id: updatedBranch.id,
      name: updatedBranch.name,
      address: updatedBranch.address,
      city: updatedBranch.city,
      state: updatedBranch.state,
      zipCode: updatedBranch.zipCode,
      phone: updatedBranch.phone,
      email: updatedBranch.email,
      isActive: updatedBranch.isActive,
      createdAt: updatedBranch.createdAt,
      updatedAt: updatedBranch.updatedAt
    })
  } catch (error) {
    console.error('Error updating branch:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
  }
}
