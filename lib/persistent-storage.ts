import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// Ensure data directory exists
if (typeof window === 'undefined' && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// File-based storage for server-side persistence
export function getPersistentUsers(): any[] {
  if (typeof window !== 'undefined') {
    // Client-side: use localStorage
    try {
      const stored = localStorage.getItem('coworking_portal_additional_users')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Server-side: use file storage
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading users file:', error)
  }
  
  return []
}

export function savePersistentUsers(users: any[]): void {
  if (typeof window !== 'undefined') {
    // Client-side: use localStorage
    try {
      localStorage.setItem('coworking_portal_additional_users', JSON.stringify(users))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
    return
  }

  // Server-side: use file storage
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    console.log(`Saved ${users.length} users to persistent storage`)
  } catch (error) {
    console.error('Error saving users file:', error)
  }
}

// Hybrid storage that works on both client and server
export function getHybridUsers(): any[] {
  const persistentUsers = getPersistentUsers()
  console.log('getHybridUsers: Loaded persistent users:', persistentUsers.length)
  console.log('getHybridUsers: User names:', persistentUsers.map(u => u.name))
  
  // Return only persistent users (no default users)
  return persistentUsers
}
