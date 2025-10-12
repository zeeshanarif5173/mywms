const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      },
      take: 5
    })
    console.log('Users found:', JSON.stringify(users, null, 2))
    
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        accountStatus: true
      },
      take: 5
    })
    console.log('Customers found:', JSON.stringify(customers, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
