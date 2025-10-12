const { createClient } = require('@supabase/supabase-js')

async function testRealtime() {
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' })
    
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Supabase credentials not found')
      return
    }
    
    console.log('✅ Supabase credentials found')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test realtime subscription
    console.log('🔗 Setting up realtime subscription...')
    
    const subscription = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Customer' },
        (payload) => {
          console.log('📡 Realtime event received:', payload)
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })
    
    // Wait a bit for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('✅ Realtime subscription test completed')
    
    // Cleanup
    subscription.unsubscribe()
    
  } catch (error) {
    console.error('❌ Realtime test error:', error.message)
  }
}

testRealtime()
