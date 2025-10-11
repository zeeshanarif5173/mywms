const { PrismaClient } = require('@prisma/client')

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...')
  console.log('')
  
  // The exact URL you provided
  const databaseUrl = "postgresql://postgres:kjhkj^&55GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"
  
  console.log('📋 Connection Details:')
  console.log(`   Host: db.glvuhieylojaipmytamr.supabase.co`)
  console.log(`   Port: 5432`)
  console.log(`   Database: postgres`)
  console.log(`   User: postgres`)
  console.log(`   Password: kjhkj^&55GG`)
  console.log('')
  
  try {
    console.log('🔌 Attempting connection...')
    
    const prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      },
      log: ['query', 'info', 'warn', 'error']
    })

    console.log('⏳ Connecting to database...')
    await prisma.$connect()
    console.log('✅ Connection established!')
    
    console.log('🔍 Testing database query...')
    const result = await prisma.$queryRaw`SELECT version() as version`
    console.log('✅ Database query successful!')
    console.log(`   PostgreSQL Version: ${result[0].version}`)
    
    console.log('🔍 Testing schema access...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('✅ Schema access successful!')
    console.log(`   Found ${tables.length} tables in public schema`)
    
    await prisma.$disconnect()
    console.log('✅ Connection closed successfully!')
    
    console.log('')
    console.log('🎉 Database connection is working perfectly!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run database schema setup:')
    console.log('   npm run db:push')
    console.log('')
    console.log('2. Seed the database:')
    console.log('   npm run db:seed')
    console.log('')
    console.log('3. Start the application:')
    console.log('   npm run dev')
    console.log('')
    console.log('4. Access Prisma Studio:')
    console.log('   npm run db:studio')
    
  } catch (error) {
    console.log('❌ Connection failed!')
    console.log('')
    console.log('🔍 Error Details:')
    console.log(`   Code: ${error.code || 'N/A'}`)
    console.log(`   Message: ${error.message}`)
    console.log('')
    
    if (error.code === 'P1001') {
      console.log('🔧 Network Connection Issue:')
      console.log('   - Check your internet connection')
      console.log('   - Verify the hostname is correct')
      console.log('   - Check if Supabase project is active')
      console.log('   - Ensure your IP is not blocked')
    } else if (error.code === 'P1000') {
      console.log('🔧 Authentication Issue:')
      console.log('   - Verify the password is correct')
      console.log('   - Check for special characters in password')
      console.log('   - Ensure user has proper permissions')
    } else if (error.code === 'P1002') {
      console.log('🔧 Database Access Issue:')
      console.log('   - Verify the database name is correct')
      console.log('   - Check if database exists')
      console.log('   - Ensure user has database access')
    }
    
    console.log('')
    console.log('🆘 Alternative Solutions:')
    console.log('1. Check Supabase Dashboard:')
    console.log('   - Go to your Supabase project')
    console.log('   - Check if project is paused')
    console.log('   - Verify database is running')
    console.log('   - Check connection settings')
    console.log('')
    console.log('2. Try Different Connection Method:')
    console.log('   - Use Supabase CLI')
    console.log('   - Use connection pooling')
    console.log('   - Check SSL requirements')
    console.log('')
    console.log('3. Local Development:')
    console.log('   - Use local PostgreSQL')
    console.log('   - Use Docker container')
    console.log('   - Use SQLite for development')
    
    process.exit(1)
  }
}

testSupabaseConnection()
