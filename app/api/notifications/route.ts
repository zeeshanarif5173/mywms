import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find customer by email
    const customer = await prisma.customer.findFirst({
      where: { email: session.user.email }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Get notifications for the customer
    const notifications = await prisma.notification.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 notifications
    })

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        customerId: customer.id,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAsRead } = body

    // Find customer by email
    const customer = await prisma.customer.findFirst({
      where: { email: session.user.email }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          customerId: customer.id
        },
        data: { isRead: true }
      })
    } else if (markAsRead === 'all') {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          customerId: customer.id,
          isRead: false
        },
        data: { isRead: true }
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
