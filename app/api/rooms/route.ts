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

    const rooms = await prisma.meetingRoom.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, capacity, location, amenities } = body

    // Validate required fields
    if (!name || !capacity || !location) {
      return NextResponse.json({ error: 'Room name, capacity, and location are required' }, { status: 400 })
    }

    // Create meeting room
    const room = await prisma.meetingRoom.create({
      data: {
        name,
        capacity: parseInt(capacity),
        location,
        amenities: amenities || '',
        isActive: true
      }
    })

    return NextResponse.json({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      amenities: room.amenities,
      isActive: room.isActive,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    })
  } catch (error) {
    console.error('Error creating room:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}