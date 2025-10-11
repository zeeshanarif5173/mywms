import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export interface Room {
  id: string
  branchId: string
  roomNumber: string
  name: string
  type: string
  capacity: number
  location: string
  floor: string
  amenities: string[]
  isActive: boolean
  isBookable: boolean
  assignedCustomerId?: string
  hourlyRate?: number
  monthlyRate?: number
  description: string
  tags: string[]
  inventory: any[]
  createdAt: string
  updatedAt: string
}

// Default rooms (only used if no persistent data exists)
const defaultRooms: Room[] = [
  {
    id: 'ROOM-001',
    branchId: '1',
    roomNumber: '101',
    name: 'Conference Room Alpha',
    type: 'meeting',
    capacity: 8,
    location: '2nd Floor',
    floor: '2',
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing'],
    isActive: true,
    isBookable: true,
    hourlyRate: 50,
    monthlyRate: 1000,
    description: 'Modern conference room with all amenities',
    tags: ['conference', 'meeting', 'presentation'],
    inventory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ROOM-002',
    branchId: '1',
    roomNumber: '102',
    name: 'Private Office Beta',
    type: 'private_office',
    capacity: 4,
    location: '3rd Floor',
    floor: '3',
    amenities: ['Desk', 'Chair', 'Storage'],
    isActive: true,
    isBookable: false,
    monthlyRate: 2000,
    description: 'Private office space for dedicated work',
    tags: ['private', 'office', 'dedicated'],
    inventory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ROOM-003',
    branchId: '1',
    roomNumber: '103',
    name: 'Store Gamma',
    type: 'store',
    capacity: 2,
    location: 'Ground Floor',
    floor: 'G',
    amenities: ['Display Area', 'Storage'],
    isActive: true,
    isBookable: false,
    monthlyRate: 1500,
    description: 'Retail store space',
    tags: ['store', 'retail', 'display'],
    inventory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ROOM-004',
    branchId: '2',
    roomNumber: '201',
    name: 'Conference Room Delta',
    type: 'meeting',
    capacity: 6,
    location: '2nd Floor',
    floor: '2',
    amenities: ['Smart Board', 'Audio System'],
    isActive: true,
    isBookable: true,
    hourlyRate: 45,
    monthlyRate: 900,
    description: 'Premium conference room in Gulberg',
    tags: ['conference', 'premium', 'smart'],
    inventory: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'ROOM-005',
    branchId: '2',
    roomNumber: '202',
    name: 'Workspace Epsilon',
    type: 'workspace',
    capacity: 12,
    location: '3rd Floor',
    floor: '3',
    amenities: ['Hot Desks', 'WiFi', 'Coffee Station'],
    isActive: true,
    isBookable: true,
    hourlyRate: 25,
    monthlyRate: 500,
    description: 'Open workspace with hot desks',
    tags: ['workspace', 'hot-desk', 'flexible'],
    inventory: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

export function getPersistentRooms(): Room[] {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const data = fs.readFileSync(ROOMS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading persistent rooms:', error)
  }
  return []
}

export function savePersistentRooms(rooms: Room[]): void {
  try {
    fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2))
  } catch (error) {
    console.error('Error saving persistent rooms:', error)
  }
}

export function getHybridRooms(): Room[] {
  const persistentRooms = getPersistentRooms()
  
  // If we have persistent rooms, use them
  if (persistentRooms.length > 0) {
    return persistentRooms
  }
  
  // Otherwise, return empty array (no default rooms)
  return []
}
