const postgres = require('postgres')

async function testPostgresConnection() {
  console.log('🔍 Testing PostgreSQL Connection with postgres package...')
  console.log('')
  
  const connectionString = "postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"
  
  console.log('📋 Connection Details:')
  console.log(`   Host: db.glvuhieylojaipmytamr.supabase.co`)
  console.log(`   Port: 5432`)
  console.log(`   Database: postgres`)
  console.log(`   User: postgres`)
  console.log('')
  
  let sql
  
  try {
    console.log('🔌 Attempting connection...')
    
    // Create connection with postgres package
    sql = postgres(connectionString, {
      host: 'db.glvuhieylojaipmytamr.supabase.co',
      port: 5432,
      database: 'postgres',
      username: 'postgres',
      password: 'kjhkj^&55GG',
      ssl: 'require', // Supabase requires SSL
      max: 1, // Limit connections for testing
      idle_timeout: 20,
      connect_timeout: 10,
    })
    
    console.log('⏳ Testing basic connection...')
    const result = await sql`SELECT version() as version`
    console.log('✅ Connection successful!')
    console.log(`   PostgreSQL Version: ${result[0].version}`)
    
    console.log('🔍 Testing database access...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('✅ Database access successful!')
    console.log(`   Found ${tables.length} tables in public schema`)
    
    if (tables.length > 0) {
      console.log('   Tables:')
      tables.forEach(table => {
        console.log(`     - ${table.table_name}`)
      })
    }
    
    console.log('🔍 Testing user permissions...')
    const currentUser = await sql`SELECT current_user as user`
    console.log(`   Current user: ${currentUser[0].user}`)
    
    console.log('🔍 Testing database size...')
    const dbSize = await sql`SELECT pg_size_pretty(pg_database_size(current_database())) as size`
    console.log(`   Database size: ${dbSize[0].size}`)
    
    await sql.end()
    console.log('✅ Connection closed successfully!')
    
    console.log('')
    console.log('🎉 PostgreSQL connection is working perfectly!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Update Prisma to use this connection:')
    console.log('   DATABASE_URL="postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"')
    console.log('')
    console.log('2. Run database setup:')
    console.log('   npm run db:push')
    console.log('   npm run db:seed')
    console.log('')
    console.log('3. Start the application:')
    console.log('   npm run dev')
    
  } catch (error) {
    console.log('❌ Connection failed!')
    console.log('')
    console.log('🔍 Error Details:')
    console.log(`   Code: ${error.code || 'N/A'}`)
    console.log(`   Message: ${error.message}`)
    console.log('')
    
    if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('🔧 DNS Resolution Issue:')
      console.log('   - The hostname cannot be resolved')
      console.log('   - Check if the Supabase project is active')
      console.log('   - Verify the hostname is correct')
      console.log('   - Try from a different network')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Connection Refused:')
      console.log('   - The database server is not running')
      console.log('   - Check if the Supabase project is paused')
      console.log('   - Verify the port is correct (5432)')
    } else if (error.message.includes('password authentication failed')) {
      console.log('🔧 Authentication Issue:')
      console.log('   - The password is incorrect')
      console.log('   - Check for special characters in password')
      console.log('   - Verify the username is correct')
    } else if (error.message.includes('SSL')) {
      console.log('🔧 SSL Connection Issue:')
      console.log('   - SSL connection is required')
      console.log('   - Try adding ?sslmode=require to the URL')
      console.log('   - Check SSL certificate validity')
    }
    
    console.log('')
    console.log('🆘 Alternative Solutions:')
    console.log('1. Check Supabase Dashboard:')
    console.log('   - Verify project is active')
    console.log('   - Check connection settings')
    console.log('   - Get updated connection string')
    console.log('')
    console.log('2. Try Different Connection Methods:')
    console.log('   - Use connection pooling (port 6543)')
    console.log('   - Try with SSL disabled')
    console.log('   - Use different SSL modes')
    console.log('')
    console.log('3. Continue with SQLite:')
    console.log('   - The application is working with SQLite')
    console.log('   - All features are functional')
    console.log('   - Can migrate to PostgreSQL later')
    
    if (sql) {
      try {
        await sql.end()
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1)
  }
}

testPostgresConnection()
