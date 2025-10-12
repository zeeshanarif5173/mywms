import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packages = await prisma.package.findMany({
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, price, duration, status } = body

    // Validate required fields
    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'Package name, price, and duration are required' }, { status: 400 })
    }

    // Create package
    const packageItem = await prisma.package.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        status: status || 'ACTIVE'
      }
    })

    return NextResponse.json({
      id: packageItem.id,
      name: packageItem.name,
      price: packageItem.price,
      duration: packageItem.duration,
      status: packageItem.status,
      startDate: packageItem.startDate,
      expiryDate: packageItem.expiryDate
    })
  } catch (error) {
    console.error('Error creating package:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}