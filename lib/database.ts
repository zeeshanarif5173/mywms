import { PrismaClient } from '@prisma/client'

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:5432/postgres"

// Create Prisma client with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Database connection test
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Database initialization
export async function initializeDatabase(): Promise<void> {
  try {
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      throw new Error('Database connection failed')
    }
    
    // Create default data if tables are empty
    await seedDefaultData()
    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Seed default data
async function seedDefaultData(): Promise<void> {
  try {
    // Check if customers exist
    const customerCount = await prisma.customer.count()
    if (customerCount === 0) {
      // Create default customers
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
            remarks: 'VIP customer',
            branchId: 1
          },
          {
            name: 'Jane Manager',
            email: 'manager@example.com',
            phone: '+1-555-0124',
            company: 'Management Inc',
            accountStatus: 'Active',
            gatePassId: 'GP-002',
            packageId: 2,
            remarks: 'Senior manager',
            branchId: 1
          },
          {
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '+1-555-0125',
            company: 'Admin Corp',
            accountStatus: 'Active',
            gatePassId: 'GP-003',
            packageId: 3,
            remarks: 'System administrator',
            branchId: 1
          }
        ]
      })
    }

    // Check if packages exist
    const packageCount = await prisma.package.count()
    if (packageCount === 0) {
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
    }

    // Check if meeting rooms exist
    const roomCount = await prisma.meetingRoom.count()
    if (roomCount === 0) {
      await prisma.meetingRoom.createMany({
        data: [
          {
            name: 'Conference Room A',
            capacity: 10,
            location: '2nd Floor',
            amenities: 'Projector, Whiteboard, Video Conferencing',
            isActive: true
          },
          {
            name: 'Meeting Room B',
            capacity: 6,
            location: '1st Floor',
            amenities: 'Whiteboard, TV Screen',
            isActive: true
          },
          {
            name: 'Boardroom',
            capacity: 20,
            location: '3rd Floor',
            amenities: 'Projector, Whiteboard, Video Conferencing, Audio System',
            isActive: true
          }
        ]
      })
    }

    // Check if package limits exist
    const limitCount = await prisma.packageLimit.count()
    if (limitCount === 0) {
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
    }

    console.log('✅ Default data seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding default data:', error)
    throw error
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}
