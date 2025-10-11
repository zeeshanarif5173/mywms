import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job service like Vercel Cron, GitHub Actions, or external cron
    console.log('Running package expiry check...')
    
    // In a real application, you would:
    // 1. Fetch all active package assignments
    // 2. Check for packages expiring in 5 days (notification)
    // 3. Check for packages that expired today (notification)
    // 4. Check for packages expired 3+ days ago (lock account)
    
    const today = new Date()
    const fiveDaysFromNow = new Date(today)
    fiveDaysFromNow.setDate(today.getDate() + 5)
    
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(today.getDate() - 3)

    // Mock data for demonstration
    const mockAssignments = [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        packageName: 'Premium Plan',
        expiryDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        status: 'ACTIVE'
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        packageName: 'Basic Plan',
        expiryDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        status: 'ACTIVE'
      },
      {
        id: '3',
        customerId: '3',
        customerName: 'Bob Wilson',
        customerEmail: 'bob@example.com',
        packageName: 'Enterprise Plan',
        expiryDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        status: 'ACTIVE'
      }
    ]

    const results = {
      notificationsSent: 0,
      accountsLocked: 0,
      checks: [] as Array<{
        customer: string
        package: string
        expiryDate: string
        daysUntilExpiry: number
        daysSinceExpiry: number
        action: string
        message: string
      }>
    }

    for (const assignment of mockAssignments) {
      const expiryDate = new Date(assignment.expiryDate)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceExpiry = Math.ceil((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24))

      let action = 'none'
      let message = ''

      if (daysUntilExpiry === 5) {
        // Send 5-day warning notification
        action = 'notification'
        message = `5-day expiry warning sent to ${assignment.customerName}`
        results.notificationsSent++
      } else if (daysUntilExpiry === 0) {
        // Send expiry day notification
        action = 'notification'
        message = `Expiry day notification sent to ${assignment.customerName}`
        results.notificationsSent++
      } else if (daysSinceExpiry >= 3) {
        // Lock account
        action = 'lock'
        message = `Account locked for ${assignment.customerName} (expired ${daysSinceExpiry} days ago)`
        results.accountsLocked++
      }

      results.checks.push({
        customer: assignment.customerName,
        package: assignment.packageName,
        expiryDate: assignment.expiryDate,
        daysUntilExpiry,
        daysSinceExpiry,
        action,
        message
      })
    }

    console.log('Package expiry check completed:', results)
    
    // Return format expected by dashboard
    return NextResponse.json({
      accountsLocked: results.accountsLocked,
      accountsUnlocked: 0, // Not implemented yet
      lastRun: new Date().toISOString(),
      isRunning: false,
      details: results
    }, { status: 200 })
  } catch (error) {
    console.error('Error in package expiry check:', error)
    return NextResponse.json(
      { error: 'Failed to check package expiry' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Run the same logic as GET but return the status
    console.log('Manually running package expiry check...')
    
    const today = new Date()
    const fiveDaysFromNow = new Date(today)
    fiveDaysFromNow.setDate(today.getDate() + 5)
    
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(today.getDate() - 3)

    // Mock data for demonstration
    const mockAssignments = [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        packageName: 'Premium Plan',
        expiryDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE'
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        packageName: 'Basic Plan',
        expiryDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE'
      },
      {
        id: '3',
        customerId: '3',
        customerName: 'Bob Wilson',
        customerEmail: 'bob@example.com',
        packageName: 'Enterprise Plan',
        expiryDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE'
      }
    ]

    const results = {
      notificationsSent: 0,
      accountsLocked: 0,
      checks: [] as Array<{
        customer: string
        package: string
        expiryDate: string
        daysUntilExpiry: number
        daysSinceExpiry: number
        action: string
        message: string
      }>
    }

    for (const assignment of mockAssignments) {
      const expiryDate = new Date(assignment.expiryDate)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceExpiry = Math.ceil((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24))

      let action = 'none'
      let message = ''

      if (daysUntilExpiry === 5) {
        action = 'notification'
        message = `5-day expiry warning sent to ${assignment.customerName}`
        results.notificationsSent++
      } else if (daysUntilExpiry === 0) {
        action = 'notification'
        message = `Expiry day notification sent to ${assignment.customerName}`
        results.notificationsSent++
      } else if (daysSinceExpiry >= 3) {
        action = 'lock'
        message = `Account locked for ${assignment.customerName} (expired ${daysSinceExpiry} days ago)`
        results.accountsLocked++
      }

      results.checks.push({
        customer: assignment.customerName,
        package: assignment.packageName,
        expiryDate: assignment.expiryDate,
        daysUntilExpiry,
        daysSinceExpiry,
        action,
        message
      })
    }

    console.log('Manual package expiry check completed:', results)
    
    return NextResponse.json({
      accountsLocked: results.accountsLocked,
      accountsUnlocked: 0,
      lastRun: new Date().toISOString(),
      isRunning: false,
      details: results
    }, { status: 200 })
  } catch (error) {
    console.error('Error in manual package expiry check:', error)
    return NextResponse.json(
      { error: 'Failed to run package expiry check' },
      { status: 500 }
    )
  }
}
