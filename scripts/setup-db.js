const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./dev.db"
    }
  }
})

async function main() {
  console.log('🌱 Setting up database with sample data...')

  // Create sample packages
  const basicPackage = await prisma.package.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Basic Plan',
      price: 99.99,
      duration: 30,
      status: 'Active',
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  const premiumPackage = await prisma.package.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Premium Plan',
      price: 199.99,
      duration: 30,
      status: 'Active',
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  const vipPackage = await prisma.package.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'VIP Plan',
      price: 299.99,
      duration: 30,
      status: 'Active',
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  // Create sample customers
  const customer1 = await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-555-0123',
      company: 'TechCorp',
      gatePassId: 'GP-001',
      packageId: 1,
      accountStatus: 'Active',
      remarks: 'VIP member, premium package'
    }
  })

  const customer2 = await prisma.customer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Jane Doe',
      email: 'jane@startup.io',
      phone: '+1-555-0456',
      company: 'StartupXYZ',
      gatePassId: 'GP-002',
      packageId: 2,
      accountStatus: 'Active',
      remarks: 'Regular member'
    }
  })

  const customer3 = await prisma.customer.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'Bob Wilson',
      email: 'bob@freelance.com',
      phone: '+1-555-0789',
      company: 'Freelance Solutions',
      gatePassId: 'GP-003',
      packageId: 1,
      accountStatus: 'Locked',
      remarks: 'Payment overdue'
    }
  })

  // Create sample complaints
  const complaint1 = await prisma.complaint.create({
    data: {
      customerId: 1,
      title: 'AC not working',
      description: 'The air conditioning in my workspace is not cooling properly.',
      status: 'Open',
      imageUrl: null
    }
  })

  const complaint2 = await prisma.complaint.create({
    data: {
      customerId: 2,
      title: 'Internet connectivity issues',
      description: 'Internet keeps disconnecting frequently.',
      status: 'In Process',
      imageUrl: 'https://example.com/photo.jpg'
    }
  })

  const complaint3 = await prisma.complaint.create({
    data: {
      customerId: 3,
      title: 'Noisy environment',
      description: 'Construction work nearby is very loud.',
      status: 'Resolved',
      resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      imageUrl: null
    }
  })

  // Create sample feedback
  await prisma.feedback.create({
    data: {
      complaintId: complaint3.id,
      rating: 5,
      comment: 'Great service! Issue resolved quickly.'
    }
  })

  // Create sample contracts
  await prisma.contract.create({
    data: {
      customerId: 1,
      fileUrl: '/uploads/contracts/contract_001.pdf',
      status: 'Completed'
    }
  })

  await prisma.contract.create({
    data: {
      customerId: 2,
      fileUrl: null,
      status: 'Requested'
    }
  })

  console.log('✅ Database setup completed!')
  console.log(`📦 Created ${await prisma.package.count()} packages`)
  console.log(`👥 Created ${await prisma.customer.count()} customers`)
  console.log(`📝 Created ${await prisma.complaint.count()} complaints`)
  console.log(`📄 Created ${await prisma.contract.count()} contracts`)
}

main()
  .catch((e) => {
    console.error('❌ Error setting up database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
