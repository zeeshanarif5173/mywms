const postgres = require('postgres')

async function testSupabaseDirect() {
  console.log('🔍 Testing Supabase Connection with postgres package...')
  console.log('')
  
  const connectionString = "postgresql://postgres:kjhkj^&55GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres"
  
  console.log('📋 Connection Details:')
  console.log(`   Host: db.glvuhieylojaipmytamr.supabase.co`)
  console.log(`   Port: 5432`)
  console.log(`   Database: postgres`)
  console.log(`   User: postgres`)
  console.log('')
  
  let sql
  
  try {
    console.log('🔌 Attempting connection...')
    
    // Try different connection configurations
    const connectionConfigs = [
      {
        name: 'Standard Connection',
        config: {
          host: 'db.glvuhieylojaipmytamr.supabase.co',
          port: 5432,
          database: 'postgres',
          username: 'postgres',
          password: 'kjhkj^&55GG',
          ssl: 'prefer',
          max: 1,
          idle_timeout: 20,
          connect_timeout: 10,
        }
      },
      {
        name: 'SSL Required',
        config: {
          host: 'db.glvuhieylojaipmytamr.supabase.co',
          port: 5432,
          database: 'postgres',
          username: 'postgres',
          password: 'kjhkj^&55GG',
          ssl: 'require',
          max: 1,
          idle_timeout: 20,
          connect_timeout: 10,
        }
      },
      {
        name: 'Connection Pooling Port',
        config: {
          host: 'db.glvuhieylojaipmytamr.supabase.co',
          port: 6543,
          database: 'postgres',
          username: 'postgres',
          password: 'kjhkj^&55GG',
          ssl: 'require',
          max: 1,
          idle_timeout: 20,
          connect_timeout: 10,
        }
      }
    ]
    
    for (const { name, config } of connectionConfigs) {
      console.log(`🔍 Testing: ${name}`)
      
      try {
        sql = postgres(config)
        
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
        
        await sql.end()
        console.log('✅ Connection closed successfully!')
        
        console.log('')
        console.log('🎉 Supabase connection is working!')
        console.log('')
        console.log('Next steps:')
        console.log('1. Update your environment:')
        console.log(`   DATABASE_URL="${connectionString}"`)
        console.log('')
        console.log('2. Run database setup:')
        console.log('   npm run db:push')
        console.log('   npm run db:seed')
        console.log('')
        console.log('3. Start the application:')
        console.log('   npm run dev')
        
        return
        
      } catch (error) {
        console.log(`❌ ${name} failed: ${error.message}`)
        
        if (error.code === 'ENOTFOUND') {
          console.log('   → DNS resolution failed')
        } else if (error.code === 'ECONNREFUSED') {
          console.log('   → Connection refused')
        } else if (error.message.includes('password authentication failed')) {
          console.log('   → Authentication failed')
        } else if (error.message.includes('SSL')) {
          console.log('   → SSL connection issue')
        }
        
        if (sql) {
          try {
            await sql.end()
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
      
      console.log('')
    }
    
    console.log('❌ All connection attempts failed!')
    console.log('')
    console.log('🔧 Troubleshooting Steps:')
    console.log('')
    console.log('1. Check Supabase Dashboard:')
    console.log('   - Go to supabase.com')
    console.log('   - Verify project is active')
    console.log('   - Check if database is running')
    console.log('   - Verify connection string')
    console.log('')
    console.log('2. Network Issues:')
    console.log('   - Check your internet connection')
    console.log('   - Try from a different network')
    console.log('   - Check if your IP is blocked')
    console.log('')
    console.log('3. Alternative Solutions:')
    console.log('   - Continue with SQLite (working perfectly)')
    console.log('   - Set up local PostgreSQL')
    console.log('   - Use Docker for PostgreSQL')
    console.log('')
    console.log('4. Current Status:')
    console.log('   - Application is working with SQLite')
    console.log('   - All features are functional')
    console.log('   - Can migrate to PostgreSQL later')
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

testSupabaseDirect()
