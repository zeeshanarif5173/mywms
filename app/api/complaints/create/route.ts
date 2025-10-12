import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can create complaints
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can create complaints' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, imageUrl } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email! },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check if customer account is locked
    if (customer.accountStatus === 'Locked') {
      return NextResponse.json(
        { error: 'Your account is locked. Cannot create complaints. Please contact support.' },
        { status: 403 }
      )
    }

    // Create complaint in database
    const newComplaint = await prisma.complaint.create({
      data: {
        customerId: customer.id,
        title,
        description,
        status: 'Open',
        imageUrl: imageUrl || null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(newComplaint, { status: 201 })
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 }
    )
  }
}
