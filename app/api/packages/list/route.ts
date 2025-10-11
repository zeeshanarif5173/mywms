import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock data for demo - in real app, fetch from database
    const packages = [
      {
        id: '1',
        packageName: 'Basic Plan',
        price: 99.99,
        duration: 1,
        durationType: 'MONTHLY',
        durationInDays: 30,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        packageName: 'Premium Plan',
        price: 199.99,
        duration: 1,
        durationType: 'MONTHLY',
        durationInDays: 30,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        packageName: 'Enterprise Plan',
        price: 499.99,
        duration: 3,
        durationType: 'MONTHLY',
        durationInDays: 90,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        packageName: 'Trial Package',
        price: 0,
        duration: 7,
        durationType: 'DAYS',
        durationInDays: 7,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json(packages, { status: 200 })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}
