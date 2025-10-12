import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, phone, company, remarks, accountStatus } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Find the customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (session.user.role === 'CUSTOMER' && existingCustomer.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      )
    }

    // Prepare update data based on user role
    const updateData: any = {
      name: name || existingCustomer.name,
      phone: phone !== undefined ? phone : existingCustomer.phone,
      company: company !== undefined ? company : existingCustomer.company
    }

    // Only managers and admins can update remarks and account status
    if (session.user.role === 'MANAGER' || session.user.role === 'ADMIN') {
      if (remarks !== undefined) {
        updateData.remarks = remarks
      }
      if (accountStatus !== undefined) {
        updateData.accountStatus = accountStatus
      }
    }

    // Update customer in database
    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Transform the data to match the expected format
    const customerData = {
      id: updatedCustomer.id.toString(),
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      companyName: updatedCustomer.company, // Map company to companyName
      packageId: updatedCustomer.packageId?.toString(),
      gatePassId: updatedCustomer.gatePassId,
      remarks: updatedCustomer.remarks,
      accountStatus: updatedCustomer.accountStatus,
      createdAt: updatedCustomer.createdAt.toISOString(),
      updatedAt: updatedCustomer.updatedAt.toISOString(),
      branch: updatedCustomer.branch
    }

    return NextResponse.json(customerData)

  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer profile' },
      { status: 500 }
    )
  }
}
