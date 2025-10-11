import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can trigger cron jobs
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const today = new Date()
    const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000))
    
    console.log('🔄 Manual cron job triggered by admin...')
    
    // Find all customers with packages that expired 3+ days ago
    const customersToCheck = await prisma.customer.findMany({
      where: {
        package: {
          expiryDate: {
            lt: threeDaysAgo
          }
        },
        accountStatus: 'Active'
      },
      include: {
        package: true,
        payments: {
          where: {
            status: 'Completed',
            paidAt: {
              gte: threeDaysAgo // Payment received within the last 3 days
            }
          }
        }
      }
    })

    let lockedCount = 0
    let notificationCount = 0
    const results = []

    for (const customer of customersToCheck) {
      // Check if customer has made a payment after package expiry
      const hasRecentPayment = customer.payments.length > 0
      
      if (!hasRecentPayment) {
        // Lock the customer account
        await prisma.customer.update({
          where: { id: customer.id },
          data: { 
            accountStatus: 'Locked',
            updatedAt: new Date()
          }
        })

        // Create a notification record
        await prisma.notification.create({
          data: {
            customerId: customer.id,
            type: 'AccountLocked',
            title: 'Account Locked Due to Payment Overdue',
            message: `Your account has been locked due to overdue payment. Package expired on ${customer.package?.expiryDate?.toLocaleDateString()}. Please contact support to restore access.`,
            isRead: false
          }
        })

        lockedCount++
        notificationCount++
        
        results.push({
          action: 'locked',
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            packageExpiry: customer.package?.expiryDate
          }
        })
      }
    }

    // Also check for customers who should be unlocked (if they made payments)
    const lockedCustomersWithPayments = await prisma.customer.findMany({
      where: {
        accountStatus: 'Locked'
      },
      include: {
        payments: {
          where: {
            status: 'Completed',
            paidAt: {
              gte: new Date(today.getTime() - (24 * 60 * 60 * 1000)) // Payment in last 24 hours
            }
          }
        }
      }
    })

    let unlockedCount = 0

    for (const customer of lockedCustomersWithPayments) {
      if (customer.payments.length > 0) {
        // Unlock the customer account
        await prisma.customer.update({
          where: { id: customer.id },
          data: { 
            accountStatus: 'Active',
            updatedAt: new Date()
          }
        })

        // Create unlock notification
        await prisma.notification.create({
          data: {
            customerId: customer.id,
            type: 'AccountUnlocked',
            title: 'Account Restored',
            message: 'Your account has been restored. Welcome back!',
            isRead: false
          }
        })

        unlockedCount++
        notificationCount++
        
        results.push({
          action: 'unlocked',
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      results: {
        accountsLocked: lockedCount,
        accountsUnlocked: unlockedCount,
        notificationsSent: notificationCount,
        details: results
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error running manual cron job:', error)
    return NextResponse.json(
      { error: 'Failed to execute cron job' },
      { status: 500 }
    )
  }
}
