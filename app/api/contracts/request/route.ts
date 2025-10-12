import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can create contract requests
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can create contract requests' }, { status: 403 })
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: session.user.email! }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Create contract request
    const contract = await prisma.contract.create({
      data: {
        customerId: customer.id,
        status: 'PENDING',
        type: 'REQUEST',
        fileName: null,
        fileUrl: null,
        uploadedBy: null
      }
    })

    // Transform data to match expected format
    const contractRequest = {
      id: contract.id.toString(),
      customerId: contract.customerId.toString(),
      status: 'Pending',
      requestedAt: contract.createdAt.toISOString(),
      uploadedAt: undefined,
      contractFileName: undefined,
      contractFileUrl: undefined,
      uploadedBy: undefined
    }

    return NextResponse.json(contractRequest, { status: 201 })

  } catch (error) {
    console.error('Error creating contract request:', error)
    return NextResponse.json(
      { error: 'Failed to create contract request' },
      { status: 500 }
    )
  }
}
