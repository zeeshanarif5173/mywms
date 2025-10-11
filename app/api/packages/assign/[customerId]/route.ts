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

    // Only managers and admins can assign packages
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const customerId = params.customerId
    const body = await request.json()
    const { packageId, startDate } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Get package details (in real app, fetch from database)
    const packageDetails = {
      id: packageId,
      packageName: 'Premium Plan',
      durationInDays: 30,
      price: 199.99
    }

    // Calculate expiry date
    const start = new Date(startDate || new Date().toISOString())
    const expiryDate = new Date(start)
    expiryDate.setDate(start.getDate() + packageDetails.durationInDays)

    // Create package assignment
    const assignment = {
      id: Date.now().toString(),
      customerId,
      packageId,
      packageName: packageDetails.packageName,
      startDate: start.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: 'ACTIVE',
      price: packageDetails.price,
      createdAt: new Date().toISOString()
    }

    // In a real application, you would:
    // 1. Save assignment to database
    // 2. Update customer's package information
    // 3. Schedule notification emails
    // 4. Set up cron job for expiry checking

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error assigning package:', error)
    return NextResponse.json(
      { error: 'Failed to assign package' },
      { status: 500 }
    )
  }
}
