import { initializeDatabase } from './db-service'

// Initialize database connection on app startup
export async function initDatabase() {
  try {
    console.log('🔄 Initializing database connection...')
    await initializeDatabase()
    console.log('✅ Database initialization completed')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    console.log('⚠️ Continuing with mock data fallback')
  }
}
