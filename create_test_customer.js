const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Create a test customer
    const customer = await prisma.customer.create({
      data: {
        name: 'Test Customer E2E',
        email: 'teste2e@example.com',
        phone: '123-456-7890',
        company: 'Test Company E2E',
        accountStatus: 'Active',
        gatePassId: 'GP-' + Math.floor(10000000 + Math.random() * 90000000),
        branchId: 1,
        remarks: 'Created during E2E testing'
      }
    })
    
    console.log('Created customer:', JSON.stringify(customer, null, 2))
    
    // Create a test booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        roomId: 1,
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
