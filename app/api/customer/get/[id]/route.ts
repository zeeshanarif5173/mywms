import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id

    // Find customer by ID or email (in case ID is actually an email)
    let customer = null
    
    // First try to find by ID (if it's a number)
    if (!isNaN(Number(customerId))) {
      customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) },
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }

    // If not found by ID, try to find by email (for session-based lookup)
    if (!customer && session.user.email) {
      customer = await prisma.customer.findUnique({
        where: { email: session.user.email },
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this customer
    // Customers can only view their own profile
    if (session.user.role === 'CUSTOMER' && customer.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only view your own profile' },
        { status: 403 }
      )
    }

    // Transform the data to match the expected format
    const customerData = {
      id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      companyName: customer.company, // Map company to companyName
      packageId: customer.packageId?.toString(),
      gatePassId: customer.gatePassId,
      remarks: customer.remarks,
      accountStatus: customer.accountStatus,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      branch: customer.branch
    }

    return NextResponse.json(customerData)

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer profile' },
      { status: 500 }
    )
  }
}
