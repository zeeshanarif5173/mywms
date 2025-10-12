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
    
    fs.writeFileSync('/tmp/db-snapshots/final_snapshot.json', JSON.stringify(snapshot, null, 2))
    console.log('Final snapshot created with', customers.length, 'customers and', bookings.length, 'bookings')
    
    // Test updating the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: 2 },
      data: { 
        status: 'COMPLETED',
        purpose: 'E2E Test Meeting - Updated'
      }
    })
    console.log('Updated booking:', JSON.stringify(updatedBooking, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
