const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function setupSQLite() {
  console.log('🗄️  Setting up SQLite Database for Development...')
  console.log('')
  
  // Update Prisma schema for SQLite
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma')
  let schemaContent = fs.readFileSync(schemaPath, 'utf8')
  
  // Check if already using SQLite
  if (schemaContent.includes('provider = "sqlite"')) {
    console.log('✅ Schema already configured for SQLite')
  } else {
    console.log('📝 Updating Prisma schema for SQLite...')
    
    // Replace PostgreSQL with SQLite
    schemaContent = schemaContent.replace(
      'provider = "postgresql"',
      'provider = "sqlite"'
    )
    schemaContent = schemaContent.replace(
      'url      = env("DATABASE_URL")',
      'url      = "file:./dev.db"'
    )
    
    // Remove PostgreSQL-specific features
    schemaContent = schemaContent.replace(/@db\.Text/g, '')
    schemaContent = schemaContent.replace(/@@map\("[^"]+"\)/g, '')
    
    fs.writeFileSync(schemaPath, schemaContent)
    console.log('✅ Schema updated for SQLite')
  }
  
  // Test SQLite connection
  const sqliteUrl = 'file:./dev.db'
  console.log('')
  console.log('🔍 Testing SQLite connection...')
  console.log(`   Database: ${sqliteUrl}`)
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: { url: sqliteUrl }
      }
    })

    await prisma.$connect()
    console.log('✅ SQLite connection successful!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful!')
    
    await prisma.$disconnect()
    
    console.log('')
    console.log('🎉 SQLite database is ready!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Generate Prisma client:')
    console.log('   npm run db:generate')
    console.log('')
    console.log('2. Push schema to database:')
    console.log('   npm run db:push')
    console.log('')
    console.log('3. Seed the database:')
    console.log('   npm run db:seed')
    console.log('')
    console.log('4. Start the application:')
    console.log('   npm run dev')
    console.log('')
    console.log('5. Access Prisma Studio:')
    console.log('   npm run db:studio')
    
  } catch (error) {
    console.log(`❌ SQLite setup failed: ${error.message}`)
    console.log('')
    console.log('🔧 Troubleshooting:')
    console.log('1. Check if SQLite is installed:')
    console.log('   sqlite3 --version')
    console.log('')
    console.log('2. Install SQLite if needed:')
    console.log('   macOS: brew install sqlite')
    console.log('   Ubuntu: sudo apt-get install sqlite3')
    console.log('')
    console.log('3. Check file permissions:')
    console.log('   ls -la prisma/')
    console.log('')
    console.log('4. Try manual setup:')
    console.log('   sqlite3 prisma/dev.db')
    console.log('   .quit')
    
    process.exit(1)
  }
}

setupSQLite()
