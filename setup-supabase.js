#!/usr/bin/env node

console.log('🚀 Supabase Setup Helper for MyWMS\n')

console.log('I found multiple Supabase projects in your codebase:')
console.log('1. db.glvuhieylojaipmytamr.supabase.co (most common)')
console.log('2. db.takwrqhkchgflsugmegk.supabase.co')
console.log('3. db.jsogdarzaryzimvbbdpy.supabase.co\n')

console.log('To set up your Supabase connection:')
console.log('1. Go to your Supabase dashboard: https://supabase.com')
console.log('2. Select your active project')
console.log('3. Go to Settings > API')
console.log('4. Copy the Project URL and anon key')
console.log('5. Go to Settings > Database')
console.log('6. Copy the connection string\n')

console.log('Then create a .env.local file with:')
console.log('SUPABASE_URL=https://your-project-id.supabase.co')
console.log('SUPABASE_KEY=your-anon-key-here')
console.log('DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres')
console.log('NEXTAUTH_URL=http://localhost:3000')
console.log('NEXTAUTH_SECRET=your-secret-here\n')

console.log('After setting up the environment variables:')
console.log('1. Run: npm run db:push (to sync your schema)')
console.log('2. Run: npm run db:seed (to add sample data)')
console.log('3. Test the connection with: node test_realtime.js\n')

console.log('For Vercel deployment:')
console.log('1. Add the same environment variables in Vercel dashboard')
console.log('2. Make sure to use the production DATABASE_URL from Supabase\n')

// Test current connection
const { testDatabaseConnection } = require('./lib/database')

async function testConnection() {
  console.log('🔍 Testing current database connection...')
  try {
    const isConnected = await testDatabaseConnection()
    if (isConnected) {
      console.log('✅ Database connection is working!')
    } else {
      console.log('❌ Database connection failed - please set up environment variables')
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
  }
}

testConnection()
