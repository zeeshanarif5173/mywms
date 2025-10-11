const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

async function setupLocalDatabase() {
  console.log('🏠 Setting up Local PostgreSQL Database...')
  console.log('')
  
  // Check if PostgreSQL is installed
  try {
    execSync('which psql', { stdio: 'ignore' })
    console.log('✅ PostgreSQL is installed')
  } catch (error) {
    console.log('❌ PostgreSQL is not installed')
    console.log('')
    console.log('📦 Install PostgreSQL:')
    console.log('   macOS: brew install postgresql')
    console.log('   Ubuntu: sudo apt-get install postgresql postgresql-contrib')
    console.log('   Windows: Download from https://www.postgresql.org/download/')
    console.log('')
    console.log('🐳 Or use Docker:')
    console.log('   docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres')
    console.log('')
    return
  }

  // Test local connection
  const localUrl = 'postgresql://postgres:password@localhost:5432/coworking_portal'
  
  console.log('🔍 Testing local database connection...')
  console.log(`   URL: ${localUrl}`)
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: { url: localUrl }
      }
    })

    await prisma.$connect()
    console.log('✅ Local database connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful!')
    
    await prisma.$disconnect()
    
    console.log('')
    console.log('🎉 Local database is ready!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Update your .env file:')
    console.log(`   DATABASE_URL="${localUrl}"`)
    console.log('')
    console.log('2. Run the database setup:')
    console.log('   npm run db:push')
    console.log('   npm run db:seed')
    console.log('')
    console.log('3. Start the application:')
    console.log('   npm run dev')
    
  } catch (error) {
    console.log(`❌ Local database connection failed: ${error.message}`)
    console.log('')
    console.log('🔧 Setup local PostgreSQL:')
    console.log('')
    console.log('1. Start PostgreSQL service:')
    console.log('   macOS: brew services start postgresql')
    console.log('   Ubuntu: sudo systemctl start postgresql')
    console.log('   Windows: Start PostgreSQL service')
    console.log('')
    console.log('2. Create database:')
    console.log('   createdb coworking_portal')
    console.log('')
    console.log('3. Or use Docker:')
    console.log('   docker run --name postgres \\')
    console.log('     -e POSTGRES_PASSWORD=password \\')
    console.log('     -e POSTGRES_DB=coworking_portal \\')
    console.log('     -p 5432:5432 \\')
    console.log('     -d postgres')
    console.log('')
    console.log('4. Then run this script again')
  }
}

setupLocalDatabase()
