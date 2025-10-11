import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.customerId

    // Check if user can create contract request
    if (session.user.role === 'CUSTOMER' && session.user.id !== customerId) {
      return NextResponse.json(
        { error: 'You can only create contract requests for yourself' },
        { status: 403 }
      )
    }

    // In a real application, you would save to database here
    // For demo purposes, we'll return a mock response
    const newContractRequest = {
      id: Date.now().toString(),
      customerId,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      uploadedAt: null,
      contractFileName: null,
      contractFileUrl: null,
      uploadedBy: null
    }

    return NextResponse.json(newContractRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating contract request:', error)
    return NextResponse.json(
      { error: 'Failed to create contract request' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.customerId

    // Check if user can access contract requests
    if (session.user.role === 'CUSTOMER' && session.user.id !== customerId) {
      return NextResponse.json(
        { error: 'You can only access your own contract requests' },
        { status: 403 }
      )
    }

    // In a real application, you would fetch from database here
    // For demo purposes, we'll return mock data
    const mockContractRequests = [
      {
        id: '1',
        customerId: customerId,
        status: 'Pending',
        requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedAt: null,
        contractFileName: null,
        contractFileUrl: null,
        uploadedBy: null
      },
      {
        id: '2',
        customerId: customerId,
        status: 'Completed',
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        contractFileName: 'contract_2024_001.pdf',
        contractFileUrl: '/uploads/contracts/contract_2024_001.pdf',
        uploadedBy: 'manager@example.com'
      }
    ]

    return NextResponse.json(mockContractRequests, { status: 200 })
  } catch (error) {
    console.error('Error fetching contract requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract requests' },
      { status: 500 }
    )
  }
}
