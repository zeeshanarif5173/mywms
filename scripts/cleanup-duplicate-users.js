const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function cleanupDuplicateUsers() {
  try {
    console.log('🔍 Checking for duplicate users...')
    
    // Find duplicate customers by email
    const duplicateCustomers = await prisma.customer.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    })

    console.log(`Found ${duplicateCustomers.length} duplicate email addresses:`)
    
    for (const duplicate of duplicateCustomers) {
      console.log(`\n📧 Email: ${duplicate.email}`)
      
      // Get all customers with this email
      const customers = await prisma.customer.findMany({
        where: { email: duplicate.email },
        orderBy: { createdAt: 'asc' } // Keep the oldest one
      })
      
      console.log(`  Found ${customers.length} customers with this email:`)
      customers.forEach((customer, index) => {
        console.log(`    ${index + 1}. ID: ${customer.id}, Name: ${customer.name}, Created: ${customer.createdAt}`)
      })
      
      // Keep the first (oldest) customer, delete the rest
      const toKeep = customers[0]
      const toDelete = customers.slice(1)
      
      console.log(`  ✅ Keeping: ID ${toKeep.id} (${toKeep.name})`)
      
      for (const customer of toDelete) {
        console.log(`  🗑️  Deleting: ID ${customer.id} (${customer.name})`)
        
        // Delete related records first
        await prisma.timeEntry.deleteMany({ where: { customerId: customer.id } })
        await prisma.booking.deleteMany({ where: { customerId: customer.id } })
        await prisma.complaint.deleteMany({ where: { customerId: customer.id } })
        await prisma.contract.deleteMany({ where: { customerId: customer.id } })
        await prisma.payment.deleteMany({ where: { customerId: customer.id } })
        await prisma.notification.deleteMany({ where: { customerId: customer.id } })
        await prisma.invoice.deleteMany({ where: { customerId: customer.id } })
        
        // Delete the customer
        await prisma.customer.delete({ where: { id: customer.id } })
      }
    }
    
    console.log('\n✅ Cleanup completed!')
    
    // Show final count
    const totalCustomers = await prisma.customer.count()
    console.log(`📊 Total customers remaining: ${totalCustomers}`)
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDuplicateUsers()
