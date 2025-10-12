const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      customers: customers,
      bookings: bookings
    }
    
    fs.writeFileSync('/tmp/db-snapshots/post_customer_snapshot.json', JSON.stringify(snapshot, null, 2))
    console.log('Post-customer snapshot created with', customers.length, 'customers and', bookings.length, 'bookings')
  } catch (error) {
    console.error('Error creating snapshot:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
