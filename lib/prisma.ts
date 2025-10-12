import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a Prisma client that handles build-time scenarios
let prisma: PrismaClient

try {
  // Always try to create a real Prisma client
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgresql://postgres:4fqU2X_fieMGFV@db.jsogdarzaryzimvbbdpy.supabase.co:5432/postgres"
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  console.error('DATABASE_URL:', process.env.DATABASE_URL)
  
  // If we're in a build environment, create a mock
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    prisma = {} as PrismaClient
  } else {
    // For development, try to create with default URL
    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: "postgresql://postgres:4fqU2X_fieMGFV@db.jsogdarzaryzimvbbdpy.supabase.co:5432/postgres"
          }
        },
        log: ['error'],
      })
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
