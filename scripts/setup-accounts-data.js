const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./dev.db"
    }
  }
})

async function setupAccountsData() {
  console.log('🌱 Setting up accounts data...')

  try {
    // Create sample branches
    const branch1 = await prisma.branch.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Downtown Branch',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1-555-0100',
        email: 'downtown@coworking.com',
        isActive: true
      }
    })

    const branch2 = await prisma.branch.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Uptown Branch',
        address: '456 Central Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        phone: '+1-555-0200',
        email: 'uptown@coworking.com',
        isActive: true
      }
    })

    console.log('✅ Branches created')

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

    console.log('✅ Packages created')

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
        branchId: 1,
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
        branchId: 1,
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
        email: 'bob@freelancer.com',
        phone: '+1-555-0789',
        gatePassId: 'GP-003',
        packageId: 1,
        branchId: 2,
        accountStatus: 'Active',
        remarks: 'Freelancer'
      }
    })

    console.log('✅ Customers created')

    // Create sample vendors
    const vendor1 = await prisma.vendor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Office Supplies Inc',
        email: 'orders@officesupplies.com',
        phone: '+1-555-1000',
        address: '789 Supply Street',
        taxId: 'TAX123456',
        branchId: 1,
        isActive: true
      }
    })

    const vendor2 = await prisma.vendor.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Cleaning Services Ltd',
        email: 'service@cleaning.com',
        phone: '+1-555-2000',
        address: '321 Clean Avenue',
        taxId: 'TAX789012',
        branchId: 2,
        isActive: true
      }
    })

    console.log('✅ Vendors created')

    // Create sample account chart
    const accounts = [
      { code: '1000', name: 'Cash', type: 'ASSET', category: 'Current Asset', branchId: 1 },
      { code: '1100', name: 'Accounts Receivable', type: 'ASSET', category: 'Current Asset', branchId: 1 },
      { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', category: 'Current Liability', branchId: 1 },
      { code: '3000', name: 'Owner Equity', type: 'EQUITY', category: 'Equity', branchId: 1 },
      { code: '4000', name: 'Service Revenue', type: 'REVENUE', category: 'Revenue', branchId: 1 },
      { code: '5000', name: 'Office Expenses', type: 'EXPENSE', category: 'Operating Expense', branchId: 1 },
      { code: '1000', name: 'Cash', type: 'ASSET', category: 'Current Asset', branchId: 2 },
      { code: '1100', name: 'Accounts Receivable', type: 'ASSET', category: 'Current Asset', branchId: 2 },
      { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', category: 'Current Liability', branchId: 2 },
      { code: '3000', name: 'Owner Equity', type: 'EQUITY', category: 'Equity', branchId: 2 },
      { code: '4000', name: 'Service Revenue', type: 'REVENUE', category: 'Revenue', branchId: 2 },
      { code: '5000', name: 'Office Expenses', type: 'EXPENSE', category: 'Operating Expense', branchId: 2 }
    ]

    for (const account of accounts) {
      await prisma.accountChart.upsert({
        where: { code: account.code },
        update: {},
        create: account
      })
    }

    console.log('✅ Chart of accounts created')

    console.log('🎉 Accounts data setup completed successfully!')
  } catch (error) {
    console.error('❌ Error setting up accounts data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAccountsData()

