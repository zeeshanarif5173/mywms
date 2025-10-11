// Server-side storage for mock data
// This will persist data during the server session

// In-memory storage
let serverBookings: any[] = []
let serverTimeEntries: any[] = []
let serverStaffTimeEntries: any[] = []
let serverComplaints: any[] = []
let serverBranches: any[] = []
let serverRooms: any[] = []
let serverPackages: any[] = []
let serverInventory: any[] = []
let serverInventoryMovements: any[] = []
let serverTasks: any[] = []
let serverAdditionalUsers: any[] = []

// Storage keys
export const SERVER_STORAGE_KEYS = {
  BOOKINGS: 'coworking_portal_bookings',
  TIME_ENTRIES: 'coworking_portal_time_entries',
  STAFF_TIME_ENTRIES: 'coworking_portal_staff_time_entries',
  COMPLAINTS: 'coworking_portal_complaints',
  BRANCHES: 'coworking_portal_branches',
  ROOMS: 'coworking_portal_rooms',
  PACKAGES: 'coworking_portal_packages',
  INVENTORY: 'coworking_portal_inventory',
  INVENTORY_MOVEMENTS: 'coworking_portal_inventory_movements',
  TASKS: 'coworking_portal_tasks',
  ADDITIONAL_USERS: 'coworking_portal_additional_users'
}

// Server-side storage functions
export function getServerStorage<T>(key: string, defaultValue: T[]): T[] {
  switch (key) {
    case SERVER_STORAGE_KEYS.BOOKINGS:
      return serverBookings as T[]
    case SERVER_STORAGE_KEYS.TIME_ENTRIES:
      return serverTimeEntries as T[]
    case SERVER_STORAGE_KEYS.STAFF_TIME_ENTRIES:
      return serverStaffTimeEntries as T[]
    case SERVER_STORAGE_KEYS.COMPLAINTS:
      return serverComplaints as T[]
    case SERVER_STORAGE_KEYS.BRANCHES:
      return serverBranches as T[]
    case SERVER_STORAGE_KEYS.ROOMS:
      return serverRooms as T[]
    case SERVER_STORAGE_KEYS.PACKAGES:
      return serverPackages as T[]
    case SERVER_STORAGE_KEYS.INVENTORY:
      return serverInventory as T[]
    case SERVER_STORAGE_KEYS.INVENTORY_MOVEMENTS:
      return serverInventoryMovements as T[]
    case SERVER_STORAGE_KEYS.TASKS:
      return serverTasks as T[]
    case SERVER_STORAGE_KEYS.ADDITIONAL_USERS:
      return serverAdditionalUsers as T[]
    default:
      return defaultValue
  }
}

export function saveServerStorage<T>(key: string, data: T[]): void {
  switch (key) {
    case SERVER_STORAGE_KEYS.BOOKINGS:
      serverBookings = [...data]
      break
    case SERVER_STORAGE_KEYS.TIME_ENTRIES:
      serverTimeEntries = [...data]
      break
    case SERVER_STORAGE_KEYS.STAFF_TIME_ENTRIES:
      serverStaffTimeEntries = [...data]
      break
    case SERVER_STORAGE_KEYS.COMPLAINTS:
      serverComplaints = [...data]
      break
    case SERVER_STORAGE_KEYS.BRANCHES:
      serverBranches = [...data]
      break
    case SERVER_STORAGE_KEYS.ROOMS:
      serverRooms = [...data]
      break
    case SERVER_STORAGE_KEYS.PACKAGES:
      serverPackages = [...data]
      break
    case SERVER_STORAGE_KEYS.INVENTORY:
      serverInventory = [...data]
      break
    case SERVER_STORAGE_KEYS.INVENTORY_MOVEMENTS:
      serverInventoryMovements = [...data]
      break
    case SERVER_STORAGE_KEYS.TASKS:
      serverTasks = [...data]
      break
    case SERVER_STORAGE_KEYS.ADDITIONAL_USERS:
      serverAdditionalUsers = [...data]
      break
  }
  console.log(`Server storage updated for ${key}:`, data.length, 'items')
}

// Hybrid storage functions that work on both client and server
export function getHybridStorage<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === 'undefined') {
    // Server-side: use in-memory storage
    return getServerStorage(key, defaultValue)
  } else {
    // Client-side: use localStorage
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }
}

export function saveHybridStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') {
    // Server-side: use in-memory storage
    saveServerStorage(key, data)
  } else {
    // Client-side: use localStorage
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }
}
