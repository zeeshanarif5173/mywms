import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    // Find customer by email first (since customerId might be session user ID)
    let customer = null
    if (session.user.email) {
      customer = await prisma.customer.findUnique({
        where: { email: session.user.email }
      })
    }

    // If not found by email, try by ID
    if (!customer && !isNaN(Number(customerId))) {
      customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      })
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to access this customer's contracts
    if (session.user.role === 'CUSTOMER' && customer.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only access your own contracts' },
        { status: 403 }
      )
    }

    // Get contract requests for this customer
    const contractRequests = await prisma.contract.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data to match expected format
    const transformedRequests = contractRequests.map(contract => ({
      id: contract.id.toString(),
      customerId: contract.customerId.toString(),
      status: contract.status === 'ACTIVE' ? 'Completed' : 'Pending',
      requestedAt: contract.createdAt.toISOString(),
      uploadedAt: contract.status === 'ACTIVE' ? contract.createdAt.toISOString() : undefined,
      contractFileName: contract.fileUrl ? 'contract.pdf' : undefined,
      contractFileUrl: contract.fileUrl || undefined,
      uploadedBy: contract.status === 'ACTIVE' ? 'Admin' : undefined
    }))

    return NextResponse.json(transformedRequests)

  } catch (error) {
    console.error('Error fetching contract requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract requests' },
      { status: 500 }
    )
  }
}
