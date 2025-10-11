const { PrismaClient } = require('@prisma/client')
const cron = require('node-cron')
const { sendNotificationEmail } = require('../lib/email')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"
    }
  }
})

// Daily email reminder cron job (runs at 9 AM UTC)
const dailyEmailReminders = cron.schedule('0 9 * * *', async () => {
  console.log('📧 Running daily email reminders...')
  
  try {
    const today = new Date()
    const fiveDaysFromNow = new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000))
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000))
    
    let reminderCount = 0
    let expiryCount = 0
    let lockCount = 0

    // 1. Send 5-day expiry reminders
    const customersForReminder = await prisma.customer.findMany({
      where: {
        package: {
          expiryDate: {
            gte: fiveDaysFromNow,
            lt: new Date(fiveDaysFromNow.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours of 5 days
          }
        },
        accountStatus: 'Active'
      },
      include: {
        package: true
      }
    })

    for (const customer of customersForReminder) {
      if (customer.package) {
        const result = await sendNotificationEmail(
          customer.email,
          customer.name,
          'packageExpiryReminder',
          {
            packageName: customer.package.name,
            expiryDate: customer.package.expiryDate.toLocaleDateString()
          }
        )

        if (result.success) {
          // Create in-app notification
          await prisma.notification.create({
            data: {
              customerId: customer.id,
              type: 'PackageExpiryReminder',
              title: 'Package Expiry Reminder',
              message: `Your ${customer.package.name} package expires on ${customer.package.expiryDate.toLocaleDateString()}. Please renew to avoid service interruption.`,
              isRead: false
            }
          })

          reminderCount++
          console.log(`📧 5-day reminder sent to: ${customer.name} (${customer.email})`)
        }
      }
    }

    // 2. Send expiry date notifications
    const customersForExpiry = await prisma.customer.findMany({
      where: {
        package: {
          expiryDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Today
          }
        },
        accountStatus: 'Active'
      },
      include: {
        package: true
      }
    })

    for (const customer of customersForExpiry) {
      if (customer.package) {
        const result = await sendNotificationEmail(
          customer.email,
          customer.name,
          'packageExpired',
          {
            packageName: customer.package.name,
            expiryDate: customer.package.expiryDate.toLocaleDateString()
          }
        )

        if (result.success) {
          // Create in-app notification
          await prisma.notification.create({
            data: {
              customerId: customer.id,
              type: 'PackageExpired',
              title: 'Package Expired',
              message: `Your ${customer.package.name} package has expired. Please contact support to renew.`,
              isRead: false
            }
          })

          expiryCount++
          console.log(`📧 Expiry notification sent to: ${customer.name} (${customer.email})`)
        }
      }
    }

    // 3. Send lock date notifications (3 days after expiry)
    const customersForLock = await prisma.customer.findMany({
      where: {
        package: {
          expiryDate: {
            gte: threeDaysFromNow,
            lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000) // Within 24 hours of 3 days
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
              gte: new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000)) // Payment in last 3 days
            }
          }
        }
      }
    })

    for (const customer of customersForLock) {
      // Only send if no recent payment
      if (customer.payments.length === 0 && customer.package) {
        const result = await sendNotificationEmail(
          customer.email,
          customer.name,
          'accountLocked',
          {
            packageName: customer.package.name,
            lockDate: new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)).toLocaleDateString()
          }
        )

        if (result.success) {
          // Create in-app notification
          await prisma.notification.create({
            data: {
              customerId: customer.id,
              type: 'AccountLockWarning',
              title: 'Account Lock Warning',
              message: `Your account will be locked in 3 days due to overdue payment. Please contact support immediately.`,
              isRead: false
            }
          })

          lockCount++
          console.log(`📧 Lock warning sent to: ${customer.name} (${customer.email})`)
        }
      }
    }

    console.log(`✅ Email reminders completed:`)
    console.log(`   - 5-day reminders: ${reminderCount}`)
    console.log(`   - Expiry notifications: ${expiryCount}`)
    console.log(`   - Lock warnings: ${lockCount}`)

  } catch (error) {
    console.error('❌ Error in email reminders:', error)
  }
}, {
  scheduled: false,
  timezone: "UTC"
})

// Function to start the notification cron job
function startNotificationCron() {
  dailyEmailReminders.start()
  console.log('📧 Email notification cron job started - Daily reminders at 9 AM UTC')
}

// Function to stop the notification cron job
function stopNotificationCron() {
  dailyEmailReminders.stop()
  console.log('📧 Email notification cron job stopped')
}

// Manual trigger for testing
async function runManualEmailReminders() {
  console.log('🧪 Running manual email reminders...')
  await dailyEmailReminders.fire()
}

// Export functions for use in other modules
module.exports = {
  startNotificationCron,
  stopNotificationCron,
  runManualEmailReminders
}

// If this script is run directly, start the cron job
if (require.main === module) {
  startNotificationCron()
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping email notification cron job...')
    stopNotificationCron()
    process.exit(0)
  })
}
