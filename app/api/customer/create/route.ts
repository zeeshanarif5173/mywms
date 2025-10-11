import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { createCustomer } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can create customers
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, company, packageId, gatePassId, remarks, accountStatus, branchId } = body

    // Validate required fields
    if (!name || !email || !branchId) {
      return NextResponse.json(
        { error: 'Name, email, and branch are required' },
        { status: 400 }
      )
    }

    // Generate unique gate pass ID if not provided
    const finalGatePassId = gatePassId || `GP-${Date.now()}`

    // Create customer using mock data
    const newCustomer = createCustomer({
      name,
      email,
      phone: phone || '',
      company: company || '',
      packageId: packageId || '',
      gatePassId: finalGatePassId,
      branchId,
      remarks: remarks || '',
      accountStatus: accountStatus || 'Active'
    })

    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
