const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        customerId: 1,
        roomId: 1,
        date: new Date().toISOString().split('T')[0], // Today's date as string
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        status: 'CONFIRMED',
        purpose: 'E2E Test Meeting'
      }
    })
    
    console.log('Created booking:', JSON.stringify(booking, null, 2))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
