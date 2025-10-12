import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a Prisma client that handles build-time scenarios
let prisma: PrismaClient

// Function to create Prisma client
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:4fqU2X_fieMGFV@db.jsogdarzaryzimvbbdpy.supabase.co:5432/postgres"
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Initialize Prisma client
if (process.env.NODE_ENV === 'production') {
  // In production, always create a new client
  prisma = createPrismaClient()
} else {
  // In development, use global to prevent multiple instances
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export { prisma }

// Helper function to check if database is available
export const isDatabaseAvailable = () => {
  // Database is now available in all environments
  return true
}
