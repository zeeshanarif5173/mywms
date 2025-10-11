const { PrismaClient } = require('@prisma/client')
const cron = require('node-cron')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"
    }
  }
})

// Daily cron job that runs at midnight
const dailyAccountStatusCheck = cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Running daily account status check...')
  
  try {
    const today = new Date()
    const threeDaysAgo = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000))
    
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

        // Create a notification record (optional)
        await prisma.notification.create({
          data: {
            customerId: customer.id,
            type: 'AccountLocked',
            title: 'Account Locked Due to Payment Overdue',
            message: `Your account has been locked due to overdue payment. Package expired on ${customer.package?.expiryDate?.toLocaleDateString()}. Please contact support to restore access.`,
            isRead: false
          }
        }).catch(() => {
          // Ignore if notification table doesn't exist yet
        })

        lockedCount++
        notificationCount++
        
        console.log(`🔒 Locked account for customer: ${customer.name} (${customer.email})`)
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
        }).catch(() => {
          // Ignore if notification table doesn't exist yet
        })

        unlockedCount++
        notificationCount++
        
        console.log(`🔓 Unlocked account for customer: ${customer.name} (${customer.email})`)
      }
    }

    console.log(`✅ Daily check completed:`)
    console.log(`   - Accounts locked: ${lockedCount}`)
    console.log(`   - Accounts unlocked: ${unlockedCount}`)
    console.log(`   - Notifications sent: ${notificationCount}`)

  } catch (error) {
    console.error('❌ Error in daily account status check:', error)
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "UTC"
})

// Function to start the cron job
function startCronJob() {
  dailyAccountStatusCheck.start()
  console.log('⏰ Cron job started - Daily account status check at midnight UTC')
}

// Function to stop the cron job
function stopCronJob() {
  dailyAccountStatusCheck.stop()
  console.log('⏹️ Cron job stopped')
}

// Manual trigger for testing
async function runManualCheck() {
  console.log('🧪 Running manual account status check...')
  await dailyAccountStatusCheck.fire()
}

// Export functions for use in other modules
module.exports = {
  startCronJob,
  stopCronJob,
  runManualCheck
}

// If this script is run directly, start the cron job
if (require.main === module) {
  startCronJob()
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping cron job...')
    stopCronJob()
    process.exit(0)
  })
}
