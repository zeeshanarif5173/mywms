import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create packages
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { packageName, price, duration, durationType, status = 'ACTIVE' } = body

    // Validate required fields
    if (!packageName || !price || !duration) {
      return NextResponse.json(
        { error: 'Package name, price, and duration are required' },
        { status: 400 }
      )
    }

    // Calculate duration in days
    let durationInDays: number
    if (durationType === 'MONTHLY') {
      durationInDays = duration * 30 // Approximate days in a month
    } else {
      durationInDays = duration
    }

    // In a real application, you would save to database here
    const newPackage = {
      id: Date.now().toString(),
      packageName,
      price: parseFloat(price),
      duration,
      durationType,
      durationInDays,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
