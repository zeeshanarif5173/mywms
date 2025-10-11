import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const branchId = parseInt(params.id)
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    return NextResponse.json(branch, { status: 200 })
  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update branches
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can update branches' }, { status: 403 })
    }

    const branchId = parseInt(params.id)
    const body = await request.json()
    const { 
      name, 
      address, 
      city, 
      state, 
      zipCode, 
      phone, 
      email, 
      isActive 
    } = body

    // Check if branch exists
    const existingBranch = await prisma.branch.findUnique({
      where: { id: branchId }
    })

    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Update the branch in database
    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(updatedBranch, { status: 200 })
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json(
      { error: 'Failed to update branch' },
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

    // Only admins can delete branches
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete branches' }, { status: 403 })
    }

    const branchId = parseInt(params.id)
    
    // Check if branch exists
    const existingBranch = await prisma.branch.findUnique({
      where: { id: branchId }
    })

    if (!existingBranch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Soft delete by setting isActive to false in database
    await prisma.branch.update({
      where: { id: branchId },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Branch deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json(
      { error: 'Failed to delete branch' },
      { status: 500 }
    )
  }
}
