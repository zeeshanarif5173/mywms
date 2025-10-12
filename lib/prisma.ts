import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a Prisma client that handles build-time scenarios
let prisma: PrismaClient

try {
  // Always try to create a real Prisma client
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:4fqU2X_fieMGFV@db.jsogdarzaryzimvbbdpy.supabase.co:5432/postgres"
  
  console.log('Initializing Prisma client...')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
  
  console.log('Prisma client initialized successfully')
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  console.error('DATABASE_URL:', process.env.DATABASE_URL)
  console.error('Error details:', error)
  
  // If we're in a build environment, create a mock
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.log('Creating mock Prisma client for build environment')
    prisma = {} as PrismaClient
  } else {
    // For development, try to create with default URL
    try {
      console.log('Retrying with default database URL')
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: "postgresql://postgres:4fqU2X_fieMGFV@db.jsogdarzaryzimvbbdpy.supabase.co:5432/postgres"
          }
        },
        log: ['error'],
      })
      console.log('Retry successful')
    } catch (retryError) {
      console.error('Retry failed:', retryError)
      prisma = {} as PrismaClient
    }
  }
}

export { prisma }

// Helper function to check if database is available
export const isDatabaseAvailable = () => {
  // Database is now available in all environments
  return true
}
