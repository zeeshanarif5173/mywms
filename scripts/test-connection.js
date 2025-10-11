const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:5432/postgres"
    }
  }
})

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    console.log('Database URL:', process.env.DATABASE_URL || "postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:5432/postgres")
    
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query test successful:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
