import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can access their own profile
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can access their profile' }, { status: 403 })
    }

    // Find customer by email from session
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
    console.error('Error fetching customer by email:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer profile' },
      { status: 500 }
    )
  }
}
