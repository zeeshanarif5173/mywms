const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./dev.db"
    }
  }
})

async function checkCustomers() {
  try {
    console.log('Checking customers in database...')
    
    const customers = await prisma.customer.findMany()
    console.log('Found customers:', customers.length)
    
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email}) - Branch: ${customer.branchId}`)
    })
    
    // Check if asimkhan exists
    const asimkhan = await prisma.customer.findUnique({
      where: { email: 'asimkhan@popcornstudio.co' }
    })
    
    if (asimkhan) {
      console.log('Found asimkhan:', asimkhan)
    } else {
      console.log('asimkhan@popcornstudio.co not found in database')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCustomers()



