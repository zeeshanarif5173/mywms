const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:5432/postgres"
    }
  }
})

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to database...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    console.log('🔄 Creating database schema...')
    // The schema will be created by Prisma when we run db push
    
    console.log('🔄 Seeding default data...')
    
    // Create default packages
    const packages = await prisma.package.findMany()
    if (packages.length === 0) {
      await prisma.package.createMany({
        data: [
          {
            name: 'Basic Plan',
            price: 99.99,
            duration: 30,
            status: 'Active'
          },
          {
            name: 'Premium Plan',
            price: 199.99,
            duration: 30,
            status: 'Active'
          },
          {
            name: 'Enterprise Plan',
            price: 399.99,
            duration: 30,
            status: 'Active'
          }
        ]
      })
      console.log('✅ Packages created')
    }

    // Create default customers
    const customers = await prisma.customer.findMany()
    if (customers.length === 0) {
      await prisma.customer.createMany({
        data: [
          {
            name: 'John Customer',
            email: 'customer@example.com',
            phone: '+1-555-0123',
            company: 'TechCorp',
            accountStatus: 'Active',
            gatePassId: 'GP-001',
            packageId: 1,
            remarks: 'VIP customer'
          },
          {
            name: 'Jane Manager',
            email: 'manager@example.com',
            phone: '+1-555-0124',
            company: 'Management Inc',
            accountStatus: 'Active',
            gatePassId: 'GP-002',
            packageId: 2,
            remarks: 'Senior manager'
          },
          {
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '+1-555-0125',
            company: 'Admin Corp',
            accountStatus: 'Active',
            gatePassId: 'GP-003',
            packageId: 3,
            remarks: 'System administrator'
          }
        ]
      })
      console.log('✅ Customers created')
    }

    // Create default meeting rooms
    const rooms = await prisma.meetingRoom.findMany()
    if (rooms.length === 0) {
      await prisma.meetingRoom.createMany({
        data: [
          {
            name: 'Conference Room A',
            capacity: 10,
            location: '2nd Floor',
            amenities: ['Projector', 'Whiteboard', 'Video Conferencing'],
            isActive: true
          },
          {
            name: 'Meeting Room B',
            capacity: 6,
            location: '1st Floor',
            amenities: ['Whiteboard', 'TV Screen'],
            isActive: true
          },
          {
            name: 'Boardroom',
            capacity: 20,
            location: '3rd Floor',
            amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'Audio System'],
            isActive: true
          }
        ]
      })
      console.log('✅ Meeting rooms created')
    }

    // Create package limits
    const limits = await prisma.packageLimit.findMany()
    if (limits.length === 0) {
      await prisma.packageLimit.createMany({
        data: [
          {
            packageId: 1,
            monthlyHours: 20,
            dailyHours: 2
          },
          {
            packageId: 2,
            monthlyHours: 40,
            dailyHours: 4
          },
          {
            packageId: 3,
            monthlyHours: 80,
            dailyHours: 8
          }
        ]
      })
      console.log('✅ Package limits created')
    }

    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('✅ Setup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })