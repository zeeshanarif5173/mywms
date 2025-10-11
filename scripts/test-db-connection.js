const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  console.log('🔍 Testing database connection...')
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"
      }
    }
  })

  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
    await prisma.$disconnect()
    console.log('✅ Database connection closed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
    
    // Provide troubleshooting steps
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Verify your database URL is correct')
    console.log('2. Check if your database server is running')
    console.log('3. Ensure your IP is whitelisted (for Supabase)')
    console.log('4. Check network connectivity')
    console.log('5. Verify database credentials')
    
    process.exit(1)
  }
}

testConnection()
