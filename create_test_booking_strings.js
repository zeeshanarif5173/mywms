const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const now = new Date()
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000)
    
    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        customerId: 1,
        roomId: 1,
        date: now.toISOString().split('T')[0], // Today's date as string
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        duration: 120, // 2 hours in minutes
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
