// Try to import PrismaClient, but handle the case when it's not available
let PrismaClient: any
let isPrismaAvailable = false

try {
  PrismaClient = require('@prisma/client').PrismaClient
  isPrismaAvailable = true
} catch (error) {
  console.warn('Prisma client not available. Using mock client.')
  // Create a mock PrismaClient for when dependencies aren't installed
  PrismaClient = class MockPrismaClient {
    constructor() {}
    async findMany() { return [] }
    async findUnique() { return null }
    async findFirst() { return null }
    async create() { return { id: 1 } }
    async update() { return { id: 1 } }
    async delete() { return { id: 1 } }
    async upsert() { return { id: 1 } }
    async count() { return 0 }
    async aggregate() { return { _count: 0 } }
    async groupBy() { return [] }
    async findRaw() { return [] }
    async aggregateRaw() { return [] }
    $connect() { return Promise.resolve() }
    $disconnect() { return Promise.resolve() }
    $transaction() { return Promise.resolve([]) }
    $queryRaw() { return Promise.resolve([]) }
    $executeRaw() { return Promise.resolve(0) }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

// Create a Prisma client that handles build-time scenarios
let prisma: any

// Function to create Prisma client
function createPrismaClient(): any {
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:4fqU2X_fieMGFV@db.jsogdarzaryzimvbbdpy.supabase.co:5432/postgres"
  
  // Check if we're in a build environment
  const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL ||
                     process.env.VERCEL_ENV === 'preview' ||
                     process.env.CI === 'true' ||
                     !isPrismaAvailable
  
  // During build time or when Prisma is not available, create a minimal client
  if (isBuildTime) {
    return new PrismaClient()
  }
  
  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.warn('Failed to create Prisma client, using mock:', error)
    return new PrismaClient()
  }
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
  return isPrismaAvailable && !!process.env.DATABASE_URL
}
