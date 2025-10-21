import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key-here'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY)
}

// Real-time subscription helper
export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping real-time subscription')
    return { unsubscribe: () => {} }
  }

  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe()
}

// Real-time subscription for complaints
export const subscribeToComplaints = (customerId: string, callback: (payload: any) => void) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping complaints subscription')
    return { unsubscribe: () => {} }
  }

  return supabase
    .channel(`complaints-${customerId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'Complaint',
        filter: `customerId=eq.${customerId}`
      },
      callback
    )
    .subscribe()
}

export default supabase
