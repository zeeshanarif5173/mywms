import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateCustomer, getCustomerById } from '@/lib/db-service'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, phone, company, packageId, gatePassId, remarks, accountStatus } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const existingCustomer = await getCustomerById(id)

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Determine what fields can be updated based on role
    const updateData: any = {}
    
    if (session.user.role === 'MANAGER' || session.user.role === 'ADMIN') {
      // Managers can update all fields
      if (name !== undefined) updateData.name = name
      if (email !== undefined) updateData.email = email
      if (phone !== undefined) updateData.phone = phone
      if (company !== undefined) updateData.company = company
      if (packageId !== undefined) updateData.packageId = packageId ? parseInt(packageId) : null
      if (gatePassId !== undefined) updateData.gatePassId = gatePassId
      if (remarks !== undefined) updateData.remarks = remarks
      if (accountStatus !== undefined) updateData.accountStatus = accountStatus
    } else if (session.user.role === 'CUSTOMER') {
      // Customers can only update: name, phone, company
      if (name !== undefined) updateData.name = name
      if (phone !== undefined) updateData.phone = phone
      if (company !== undefined) updateData.company = company
      
      // Reject attempts to update restricted fields
      if (email !== undefined || packageId !== undefined || 
          gatePassId !== undefined || remarks !== undefined || 
          accountStatus !== undefined) {
        return NextResponse.json(
          { error: 'You do not have permission to update this field' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update customer using database service
    const updatedCustomer = await updateCustomer(id, updateData)

    return NextResponse.json(updatedCustomer, { status: 200 })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}
