// Mock data for testing without database

export interface MockBranch {
  id: string
  name: string
  buildingName: string
  logo?: string
  description: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  managerId?: string
  isActive: boolean
  packages: string[] // Package IDs available at this branch
  rooms: string[] // Room IDs in this branch
  createdAt: string
  updatedAt: string
}

export interface MockRoom {
  id: string
  branchId: string
  roomNumber: string
  name: string
  type: 'meeting' | 'private_office' | 'store' | 'workspace' | 'conference_hall'
  capacity: number
  location: string
  floor: string
  amenities: string[]
  isActive: boolean
  isBookable: boolean // Can clients book this room?
  assignedCustomerId?: string // For private offices and stores
  hourlyRate?: number
  monthlyRate?: number
  description: string
  tags: string[]
  inventory: MockRoomInventoryItem[]
  createdAt: string
  updatedAt: string
}

export interface MockRoomInventoryItem {
  id: string
  roomId: string
  name: string
  category: string // AC, Chair, Table, etc.
  brand?: string
  model?: string
  serialNumber?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken'
  status: 'active' | 'maintenance' | 'out_of_order'
  purchaseDate?: string
  warrantyExpiry?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MockTask {
  id: string
  title: string
  description: string
  department: 'AC' | 'Electrician' | 'IT' | 'Management' | 'Operations' | 'Accounts' | 'Cleaning' | 'Security' | 'Maintenance'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue'
  assignedTo?: string // User ID
  assignedToName?: string // User name for display
  createdBy: string // User ID who created the task
  createdByName: string // Creator name for display
  branchId: string
  dueDate: string
  completedAt?: string
  isRecurring: boolean
  recurringPattern?: {
    type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom'
    interval: number // Every X hours/days/weeks/months
    daysOfWeek?: number[] // For weekly: [1,2,3,4,5] for weekdays
    dayOfMonth?: number // For monthly: 15 for 15th of every month
    timeOfDay?: string // "10:00" for 10 AM
    endDate?: string // When to stop recurring
  }
  parentTaskId?: string // For recurring tasks, links to original task
  attachments: MockTaskAttachment[]
  comments: MockTaskComment[]
  history: MockTaskHistory[]
  fineAmount?: number // Fine for late completion
  fineApplied?: boolean
  createdAt: string
  updatedAt: string
}

export interface MockTaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileType: 'image' | 'video' | 'document' | 'other'
  fileSize: number
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
}

export interface MockTaskComment {
  id: string
  taskId: string
  userId: string
  userName: string
  comment: string
  createdAt: string
}

export interface MockTaskHistory {
  id: string
  taskId: string
  action: 'created' | 'assigned' | 'status_changed' | 'commented' | 'attachment_added' | 'due_date_changed' | 'fine_applied'
  description: string
  userId: string
  userName: string
  oldValue?: string
  newValue?: string
  createdAt: string
}

export interface MockPackage {
  id: string
  name: string
  description: string
  type: 'hourly' | 'daily' | 'monthly' | 'yearly'
  price: number
  currency: string
  features: string[]
  limitations: {
    maxHours?: number
    maxBookings?: number
    maxRooms?: number
  }
  isActive: boolean
  branchIds: string[] // Which branches offer this package
  createdAt: string
  updatedAt: string
}

export interface MockCustomer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  accountStatus: string
  gatePassId: string
  packageId?: string
  branchId: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface MockComplaint {
  id: string
  customerId: string
  branchId: string
  title: string
  description: string
  status: string
  remarks?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  imageUrl?: string
  workCompletionImage?: string
}

export interface MockContract {
  id: string
  customerId: string
  fileUrl?: string
  status: string
  createdAt: string
}

export interface MockTimeEntry {
  id: string
  customerId: string
  checkInTime: string
  checkOutTime?: string
  duration?: number // in minutes
  date: string
  status: 'Checked In' | 'Checked Out'
  notes?: string
}

export interface MockStaffTimeEntry {
  id: string
  staffId: string
  checkInTime: string
  checkOutTime?: string
  duration?: number // in minutes
  date: string
  status: 'Checked In' | 'Checked Out'
  notes?: string
  branchId: string
}

export interface MockInventoryItem {
  id: string
  name: string
  description: string
  category: 'fixture' | 'moveable' | 'consumable'
  type: string // e.g., 'chair', 'table', 'fan', 'tea', 'coffee'
  brand?: string
  model?: string
  unit: string // e.g., 'pieces', 'kg', 'liters', 'boxes'
  totalQuantity: number
  currentQuantity: number
  minStockLevel: number
  maxStockLevel: number
  costPerUnit: number
  supplier?: string
  imageUrl?: string
  barcode?: string
  location: 'store_room' | 'branch_room'
  branchId: string
  roomId?: string
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: string
  updatedAt: string
}

export interface MockInventoryMovement {
  id: string
  itemId: string
  itemName: string
  movementType: 'received' | 'moved' | 'consumed' | 'returned' | 'damaged' | 'lost'
  fromLocation: 'vendor' | 'store_room' | 'branch_room'
  toLocation: 'store_room' | 'branch_room' | 'consumed' | 'damaged' | 'lost'
  fromBranchId?: string
  toBranchId?: string
  fromRoomId?: string
  toRoomId?: string
  quantity: number
  unit: string
  reason?: string
  notes?: string
  performedBy: string
  performedByName: string
  vendorName?: string
  costPerUnit?: number
  totalCost?: number
  createdAt: string
}

export interface MockInventoryReport {
  totalItems: number
  totalValue: number
  itemsByCategory: {
    fixture: { count: number, value: number }
    moveable: { count: number, value: number }
    consumable: { count: number, value: number }
  }
  itemsByLocation: {
    store_room: { count: number, value: number }
    branch_rooms: { count: number, value: number }
  }
  lowStockItems: number
  outOfStockItems: number
  recentMovements: number
}

export interface MockMeetingRoom {
  id: string
  name: string
  capacity: number
  location: string
  amenities: string[]
  isActive: boolean
  createdAt: string
}

export interface MockBooking {
  id: string
  customerId: string
  branchId: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  duration: number // in minutes
  status: 'Confirmed' | 'Cancelled' | 'Completed'
  purpose: string
  createdAt: string
  updatedAt: string
}

export interface MockPackageLimit {
  id: string
  packageId: string
  monthlyHoursLimit: number
  maxBookingDuration: number // in minutes
  maxBookingsPerDay: number
  isActive: boolean
}

// Mock customers data
export const mockCustomers: MockCustomer[] = [
  {
    id: '1',
    name: 'John Customer',
    email: 'customer@example.com',
    phone: '+1-555-0123',
    company: 'TechCorp',
    accountStatus: 'Active',
    gatePassId: 'GP-001',
    packageId: 'PKG-001',
    branchId: '1',
    remarks: 'VIP customer',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Manager',
    email: 'manager@example.com',
    phone: '+1-555-0456',
    company: 'Management Inc',
    accountStatus: 'Active',
    gatePassId: 'GP-002',
    packageId: 'PKG-002',
    branchId: '1',
    remarks: 'Manager account',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1-555-0789',
    company: 'Admin Corp',
    accountStatus: 'Active',
    gatePassId: 'GP-003',
    packageId: 'PKG-003',
    branchId: '1',
    remarks: 'Admin account',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-22T11:20:00Z'
  }
]

// User ID to Customer ID mapping (for authentication)
export const userIdToCustomerId: Record<string, string> = {
  '1': '1', // customer@example.com -> Customer ID 1
  '2': '2', // manager@example.com -> Customer ID 2  
  '3': '3'  // admin@example.com -> Customer ID 3
}

// Mock complaints data - will be initialized with persistent storage

// Mock contracts data
export const mockContracts: MockContract[] = [
  {
    id: '1',
    customerId: '1',
    fileUrl: '/contracts/customer-1-contract.pdf',
    status: 'Completed',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    customerId: '2',
    status: 'Requested',
    createdAt: '2024-01-15T10:00:00Z'
  }
]

// Mock time entries data - will be initialized with persistent storage

// Mock meeting rooms data
export const mockMeetingRooms: MockMeetingRoom[] = [
  {
    id: '1',
    name: 'Conference Room A',
    capacity: 8,
    location: '2nd Floor',
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Meeting Room B',
    capacity: 4,
    location: '1st Floor',
    amenities: ['Whiteboard', 'TV Screen'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Boardroom',
    capacity: 12,
    location: '3rd Floor',
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'Catering Setup'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Small Meeting Room',
    capacity: 2,
    location: '1st Floor',
    amenities: ['Whiteboard'],
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// Use SERVER_STORAGE_KEYS from server-storage
const STORAGE_KEYS = SERVER_STORAGE_KEYS

// Initialize default data - start with empty array for clean slate
const defaultBookings: MockBooking[] = []

// Default branches
const defaultBranches: MockBranch[] = [
  {
    id: '1',
    name: 'Downtown Branch',
    buildingName: 'PopCorn Studio Wahdat Road',
    description: 'Modern coworking space in the heart of downtown with premium amenities and flexible workspace solutions.',
    address: '123 Wahdat Road',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54000',
    phone: '+92 (42) 123-4567',
    email: 'downtown@popcornstudio.com',
    isActive: true,
    packages: ['PKG-001', 'PKG-002', 'PKG-003'],
    rooms: ['ROOM-001', 'ROOM-002', 'ROOM-003', 'ROOM-004'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Uptown Branch',
    buildingName: 'PopCorn Studio Gulberg',
    description: 'Premium coworking space in Gulberg with state-of-the-art facilities and dedicated support.',
    address: '456 Gulberg Main Boulevard',
    city: 'Lahore',
    state: 'Punjab',
    zipCode: '54000',
    phone: '+92 (42) 234-5678',
    email: 'uptown@popcornstudio.com',
    isActive: true,
    packages: ['PKG-001', 'PKG-002', 'PKG-004'],
    rooms: ['ROOM-005', 'ROOM-006', 'ROOM-007'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Default rooms
const defaultRooms: MockRoom[] = [
  {
    id: 'ROOM-001',
    branchId: '1',
    roomNumber: '101',
    name: 'Conference Room Alpha',
    type: 'meeting',
    capacity: 8,
    location: '1st Floor',
    floor: '1',
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing', 'Coffee Machine'],
    isActive: true,
    isBookable: true,
    hourlyRate: 25,
    description: 'Modern meeting room with video conferencing capabilities',
    tags: ['meeting', 'conference', 'video-call'],
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
    location: '1st Floor',
    floor: '1',
    amenities: ['Desk', 'Chairs', 'Storage', 'Window View'],
    isActive: true,
    isBookable: false,
    monthlyRate: 1200,
    description: 'Private office space for dedicated teams',
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
    floor: '0',
    amenities: ['Storage', 'Display Area', 'Security'],
    isActive: true,
    isBookable: false,
    monthlyRate: 800,
    description: 'Retail space for small businesses',
    tags: ['store', 'retail', 'display'],
    inventory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ROOM-004',
    branchId: '1',
    roomNumber: '112',
    name: 'Workspace Delta',
    type: 'workspace',
    capacity: 12,
    location: '2nd Floor',
    floor: '2',
    amenities: ['Hot Desks', 'WiFi', 'Power Outlets', 'Lounge Area'],
    isActive: true,
    isBookable: true,
    hourlyRate: 15,
    description: 'Flexible workspace with hot desk arrangements',
    tags: ['workspace', 'hot-desk', 'flexible'],
    inventory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ROOM-005',
    branchId: '2',
    roomNumber: '201',
    name: 'Conference Hall Epsilon',
    type: 'conference_hall',
    capacity: 50,
    location: '2nd Floor',
    floor: '2',
    amenities: ['Large Screen', 'Sound System', 'Stage', 'Catering Area'],
    isActive: true,
    isBookable: true,
    hourlyRate: 100,
    description: 'Large conference hall for events and presentations',
    tags: ['conference', 'events', 'large'],
    inventory: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Default packages
const defaultPackages: MockPackage[] = [
  {
    id: 'PKG-001',
    name: 'Flexi Hour',
    description: 'Pay-as-you-go hourly access to meeting rooms and workspaces',
    type: 'hourly',
    price: 20,
    currency: 'PKR',
    features: ['Hourly booking', 'Meeting room access', 'Basic amenities'],
    limitations: {
      maxHours: 8,
      maxBookings: 10
    },
    isActive: true,
    branchIds: ['1', '2'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'PKG-002',
    name: 'Business Starter',
    description: 'Monthly package with dedicated workspace and meeting room access',
    type: 'monthly',
    price: 15000,
    currency: 'PKR',
    features: ['Dedicated desk', 'Meeting room access', 'Storage', 'Mail handling'],
    limitations: {
      maxHours: 160,
      maxBookings: 50,
      maxRooms: 5
    },
    isActive: true,
    branchIds: ['1', '2'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'PKG-003',
    name: 'Enterprise Suite',
    description: 'Premium package with private office and full amenities',
    type: 'monthly',
    price: 25000,
    currency: 'PKR',
    features: ['Private office', 'Unlimited meeting rooms', 'Premium amenities', 'Dedicated support'],
    limitations: {
      maxHours: 300,
      maxBookings: 100,
      maxRooms: 10
    },
    isActive: true,
    branchIds: ['1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Default inventory items
const defaultInventory: MockRoomInventoryItem[] = [
  {
    id: 'INV-001',
    roomId: 'ROOM-001',
    name: 'Samsung 65" Smart TV',
    category: 'Display',
    brand: 'Samsung',
    model: 'UN65AU8000',
    condition: 'excellent',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'INV-002',
    roomId: 'ROOM-001',
    name: 'Office Chair - Ergonomic',
    category: 'moveable',
    brand: 'Herman Miller',
    condition: 'good',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'INV-003',
    roomId: 'ROOM-001',
    name: 'Conference Table - 8 Seater',
    category: 'moveable',
    brand: 'IKEA',
    condition: 'good',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'INV-004',
    roomId: 'ROOM-001',
    name: 'Air Conditioner - 2 Ton',
    category: 'fixture',
    brand: 'Carrier',
    condition: 'excellent',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Helper functions for persistent storage
import { getHybridStorage, saveHybridStorage, SERVER_STORAGE_KEYS } from './server-storage'
import { getHybridTasks, savePersistentTasks } from './persistent-tasks'

function getFromStorage<T>(key: string, defaultValue: T[]): T[] {
  return getHybridStorage(key, defaultValue)
}

function saveToStorage<T>(key: string, data: T[]): void {
  saveHybridStorage(key, data)
}

// Initialize persistent data
let mockBookings: MockBooking[] = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)

// Default time entries - start with empty array for clean slate
const defaultTimeEntries: MockTimeEntry[] = []

// Initialize persistent time entries
export let mockTimeEntries: MockTimeEntry[] = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)

// Default staff time entries - start with empty array for clean slate
const defaultStaffTimeEntries: MockStaffTimeEntry[] = []

// Initialize persistent staff time entries
export let mockStaffTimeEntries: MockStaffTimeEntry[] = getFromStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, defaultStaffTimeEntries)

// Default complaints
const defaultComplaints: MockComplaint[] = [
  {
    id: '1',
    customerId: '1',
    branchId: '1',
    title: 'AC not working',
    description: 'The air conditioning in my workspace is not functioning properly',
    status: 'Open',
    remarks: null,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    resolvedAt: undefined,
    imageUrl: undefined,
  },
  {
    id: '2',
    customerId: '1',
    branchId: '1',
    title: 'Internet connectivity issues',
    description: 'Frequent disconnections from the WiFi network',
    status: 'In Process',
    remarks: 'Technician assigned - checking router configuration',
    createdAt: '2024-01-19T14:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z',
    resolvedAt: undefined,
    imageUrl: undefined,
  },
  {
    id: '3',
    customerId: '2',
    branchId: '1',
    title: 'Noisy neighbors',
    description: 'The people in the adjacent workspace are very loud during calls',
    status: 'Resolved',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
    resolvedAt: '2024-01-18T16:30:00Z',
    imageUrl: undefined
  },
  {
    id: '4',
    customerId: '3',
    branchId: '1',
    title: 'Broken chair',
    description: 'The office chair in my workspace has a broken armrest',
    status: 'On Hold',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    resolvedAt: undefined,
    imageUrl: undefined,
  },
  {
    id: '5',
    customerId: '1',
    branchId: '1',
    title: 'Printer not working',
    description: 'The shared printer on floor 2 is showing error messages',
    status: 'Testing',
    createdAt: '2024-01-23T08:30:00Z',
    updatedAt: '2024-01-23T14:20:00Z',
    resolvedAt: undefined,
    imageUrl: undefined,
  }
]

// Initialize persistent complaints
export let mockComplaints: MockComplaint[] = getFromStorage(STORAGE_KEYS.COMPLAINTS, defaultComplaints)

// Initialize persistent branches
export let mockBranches: MockBranch[] = getFromStorage(STORAGE_KEYS.BRANCHES, defaultBranches)

// Initialize persistent rooms
export let mockRooms: MockRoom[] = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)

// Initialize persistent packages
export let mockPackages: MockPackage[] = getFromStorage(STORAGE_KEYS.PACKAGES, defaultPackages)

// Initialize persistent inventory
export let mockInventory: MockRoomInventoryItem[] = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)

// Default tasks
const defaultTasks: MockTask[] = [
  {
    id: '1',
    title: 'Clean Washroom - Hourly',
    description: 'Clean all washrooms thoroughly including floors, sinks, and toilets',
    department: 'Cleaning',
    priority: 'High',
    status: 'Open',
    assignedTo: 'staff-1', // Office boy
    assignedToName: 'Mike Johnson',
    createdBy: '3', // Admin
    createdByName: 'Admin User',
    branchId: '1',
    dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    isRecurring: true,
    recurringPattern: {
      type: 'hourly',
      interval: 1,
      timeOfDay: '10:00',
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    },
    attachments: [],
    comments: [],
    history: [
      {
        id: '1',
        taskId: '1',
        action: 'created',
        description: 'Task created',
        userId: '3',
        userName: 'Admin User',
        createdAt: new Date().toISOString()
      }
    ],
    fineAmount: 50, // $50 fine for late completion
    fineApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Check AC Units',
    description: 'Inspect and maintain all AC units in the building',
    department: 'AC',
    priority: 'Medium',
    status: 'Assigned',
    assignedTo: 'team-1',
    assignedToName: 'Lisa Garcia',
    createdBy: '3',
    createdByName: 'Admin User',
    branchId: '1',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    isRecurring: false,
    attachments: [],
    comments: [
      {
        id: '1',
        taskId: '2',
        userId: 'team-1',
        userName: 'Lisa Garcia',
        comment: 'Will start working on this tomorrow morning',
        createdAt: new Date().toISOString()
      }
    ],
    history: [
      {
        id: '2',
        taskId: '2',
        action: 'created',
        description: 'Task created',
        userId: '3',
        userName: 'Admin User',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        taskId: '2',
        action: 'assigned',
        description: 'Task assigned to Lisa Garcia',
        userId: '3',
        userName: 'Admin User',
        newValue: 'Lisa Garcia',
        createdAt: new Date().toISOString()
      }
    ],
    fineAmount: 100,
    fineApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Initialize persistent tasks
const initialTasks = getHybridTasks()
export let mockTasks: MockTask[] = initialTasks.length > 0 ? initialTasks : defaultTasks

// Task management functions
export function getAllTasks(): MockTask[] {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  return mockTasks
}

export function getTasksByBranchId(branchId: string): MockTask[] {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  return mockTasks.filter(task => task.branchId === branchId)
}

export function getTasksByAssignedUser(userId: string): MockTask[] {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  return mockTasks.filter(task => task.assignedTo === userId)
}

export function getTaskById(taskId: string): MockTask | undefined {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  return mockTasks.find(task => task.id === taskId)
}

export function createTask(
  title: string,
  description: string,
  department: MockTask['department'],
  priority: MockTask['priority'],
  createdBy: string,
  createdByName: string,
  branchId: string,
  dueDate: string,
  assignedTo?: string,
  assignedToName?: string,
  isRecurring: boolean = false,
  recurringPattern?: MockTask['recurringPattern'],
  fineAmount?: number
): MockTask {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  
  const newTaskId = (mockTasks.length + 1).toString()
  
  const newTask: MockTask = {
    id: newTaskId,
    title,
    description,
    department,
    priority,
    status: assignedTo ? 'Assigned' : 'Open',
    assignedTo,
    assignedToName,
    createdBy,
    createdByName,
    branchId,
    dueDate,
    isRecurring,
    recurringPattern,
    attachments: [],
    comments: [],
    history: [
      {
        id: `${Date.now()}-1`,
        taskId: newTaskId,
        action: 'created',
        description: 'Task created',
        userId: createdBy,
        userName: createdByName,
        createdAt: new Date().toISOString()
      }
    ],
    fineAmount,
    fineApplied: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  if (assignedTo) {
    newTask.history.push({
      id: `${Date.now()}-2`,
      taskId: newTask.id,
      action: 'assigned',
      description: `Task assigned to ${assignedToName}`,
      userId: createdBy,
      userName: createdByName,
      newValue: assignedToName,
      createdAt: new Date().toISOString()
    })
  }

  mockTasks.push(newTask)
  savePersistentTasks(mockTasks)
  return newTask
}

export function updateTask(taskId: string, updates: Partial<MockTask>, userId: string, userName: string): MockTask | null {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  const taskIndex = mockTasks.findIndex(task => task.id === taskId)
  
  if (taskIndex === -1) return null
  
  const oldTask = { ...mockTasks[taskIndex] }
  mockTasks[taskIndex] = { 
    ...mockTasks[taskIndex], 
    ...updates,
    updatedAt: new Date().toISOString()
  }

  // Add history entries for changes
  const newHistory: MockTaskHistory[] = []
  
  if (updates.status && updates.status !== oldTask.status) {
    newHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      taskId,
      action: 'status_changed',
      description: `Status changed from ${oldTask.status} to ${updates.status}`,
      userId,
      userName,
      oldValue: oldTask.status,
      newValue: updates.status,
      createdAt: new Date().toISOString()
    })
  }

  if (updates.assignedTo && updates.assignedTo !== oldTask.assignedTo) {
    newHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      taskId,
      action: 'assigned',
      description: `Task reassigned to ${updates.assignedToName}`,
      userId,
      userName,
      oldValue: oldTask.assignedToName,
      newValue: updates.assignedToName,
      createdAt: new Date().toISOString()
    })
  }

  if (updates.dueDate && updates.dueDate !== oldTask.dueDate) {
    newHistory.push({
      id: `${Date.now()}-${Math.random()}`,
      taskId,
      action: 'due_date_changed',
      description: `Due date changed to ${new Date(updates.dueDate).toLocaleDateString()}`,
      userId,
      userName,
      oldValue: new Date(oldTask.dueDate).toLocaleDateString(),
      newValue: new Date(updates.dueDate).toLocaleDateString(),
      createdAt: new Date().toISOString()
    })
  }

  mockTasks[taskIndex].history = [...mockTasks[taskIndex].history, ...newHistory]
  
  savePersistentTasks(mockTasks)
  return mockTasks[taskIndex]
}

export function addTaskComment(taskId: string, userId: string, userName: string, comment: string): MockTaskComment | null {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  const taskIndex = mockTasks.findIndex(task => task.id === taskId)
  
  if (taskIndex === -1) return null
  
  const newComment: MockTaskComment = {
    id: `${Date.now()}-${Math.random()}`,
    taskId,
    userId,
    userName,
    comment,
    createdAt: new Date().toISOString()
  }

  mockTasks[taskIndex].comments.push(newComment)
  mockTasks[taskIndex].history.push({
    id: `${Date.now()}-${Math.random()}`,
    taskId,
    action: 'commented',
    description: `${userName} added a comment`,
    userId,
    userName,
    createdAt: new Date().toISOString()
  })
  mockTasks[taskIndex].updatedAt = new Date().toISOString()
  
  savePersistentTasks(mockTasks)
  return newComment
}

export function addTaskAttachment(taskId: string, fileName: string, fileType: MockTaskAttachment['fileType'], fileSize: number, fileUrl: string, uploadedBy: string): MockTaskAttachment | null {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  const taskIndex = mockTasks.findIndex(task => task.id === taskId)
  
  if (taskIndex === -1) return null
  
  const newAttachment: MockTaskAttachment = {
    id: `${Date.now()}-${Math.random()}`,
    taskId,
    fileName,
    fileType,
    fileSize,
    fileUrl,
    uploadedBy,
    uploadedAt: new Date().toISOString()
  }

  mockTasks[taskIndex].attachments.push(newAttachment)
  mockTasks[taskIndex].history.push({
    id: `${Date.now()}-${Math.random()}`,
    taskId,
    action: 'attachment_added',
    description: `Attachment "${fileName}" added`,
    userId: uploadedBy,
    userName: uploadedBy, // You might want to get the actual name
    createdAt: new Date().toISOString()
  })
  mockTasks[taskIndex].updatedAt = new Date().toISOString()
  
  savePersistentTasks(mockTasks)
  return newAttachment
}

export function checkOverdueTasks(): MockTask[] {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  const now = new Date()
  const overdueTasks: MockTask[] = []
  
  mockTasks.forEach(task => {
    if (task.status !== 'Completed' && task.status !== 'Cancelled' && new Date(task.dueDate) < now) {
      if (task.status !== 'Overdue') {
        task.status = 'Overdue'
        task.updatedAt = new Date().toISOString()
        overdueTasks.push(task)
      }
    }
  })
  
  if (overdueTasks.length > 0) {
    savePersistentTasks(mockTasks)
  }
  
  return overdueTasks
}

export function applyLateFines(): { taskId: string, fineAmount: number, assignedTo: string }[] {
  const hybridTasks = getHybridTasks()
  mockTasks = hybridTasks.length > 0 ? hybridTasks : defaultTasks
  const now = new Date()
  const appliedFines: { taskId: string, fineAmount: number, assignedTo: string }[] = []
  
  mockTasks.forEach(task => {
    if (task.status === 'Overdue' && task.fineAmount && !task.fineApplied && task.assignedTo) {
      task.fineApplied = true
      task.updatedAt = new Date().toISOString()
      task.history.push({
        id: `${Date.now()}-${Math.random()}`,
        taskId: task.id,
        action: 'fine_applied',
        description: `Late fine of $${task.fineAmount} applied`,
        userId: 'system',
        userName: 'System',
        newValue: task.fineAmount.toString(),
        createdAt: new Date().toISOString()
      })
      
      appliedFines.push({
        taskId: task.id,
        fineAmount: task.fineAmount,
        assignedTo: task.assignedTo
      })
    }
  })
  
  if (appliedFines.length > 0) {
    savePersistentTasks(mockTasks)
  }
  
  return appliedFines
}

// Staff time tracking helper functions
export function getStaffTimeEntries(staffId: string, startDate?: string, endDate?: string): MockStaffTimeEntry[] {
  mockStaffTimeEntries = getFromStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, defaultStaffTimeEntries)
  let filtered = mockStaffTimeEntries.filter(entry => entry.staffId === staffId)
  
  if (startDate && endDate) {
    filtered = filtered.filter(entry => entry.date >= startDate && entry.date <= endDate)
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllStaffTimeEntries(staffId?: string, startDate?: string, endDate?: string): MockStaffTimeEntry[] {
  mockStaffTimeEntries = getFromStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, defaultStaffTimeEntries)
  let filtered = mockStaffTimeEntries
  
  if (staffId) {
    filtered = filtered.filter(entry => entry.staffId === staffId)
  }
  
  if (startDate && endDate) {
    filtered = filtered.filter(entry => entry.date >= startDate && entry.date <= endDate)
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getCurrentStaffTimeEntry(staffId: string): MockStaffTimeEntry | undefined {
  mockStaffTimeEntries = getFromStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, defaultStaffTimeEntries)
  return mockStaffTimeEntries.find(entry => 
    entry.staffId === staffId && entry.status === 'Checked In'
  )
}

export function checkInStaff(staffId: string, notes?: string): MockStaffTimeEntry {
  mockStaffTimeEntries = getFromStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, defaultStaffTimeEntries)
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()
  
  // Get staff info to get branchId
  const staff = getStaffByEmail('') // We'll get the branchId from the session or default to '1'
  const branchId = '1' // Default branch ID
  
  const newEntry: MockStaffTimeEntry = {
    id: (mockStaffTimeEntries.length + 1).toString(),
    staffId,
    checkInTime: now,
    date: today,
    status: 'Checked In',
    notes: notes || '',
    branchId: branchId
  }
  
  mockStaffTimeEntries.push(newEntry)
  saveToStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, mockStaffTimeEntries)
  return newEntry
}

export function checkOutStaff(staffId: string): MockStaffTimeEntry | null {
  mockStaffTimeEntries = getFromStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, defaultStaffTimeEntries)
  const currentEntry = getCurrentStaffTimeEntry(staffId)
  if (!currentEntry) return null
  
  const now = new Date()
  const checkInTime = new Date(currentEntry.checkInTime)
  const duration = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60)) // minutes
  
  currentEntry.checkOutTime = now.toISOString()
  currentEntry.duration = duration
  currentEntry.status = 'Checked Out'
  
  saveToStorage(STORAGE_KEYS.STAFF_TIME_ENTRIES, mockStaffTimeEntries)
  return currentEntry
}

export function getStaffTimeStats(staffId: string, startDate?: string, endDate?: string): {
  totalHours: number
  totalDays: number
  averageHoursPerDay: number
  totalEntries: number
  completedEntries: number
  currentStatus: 'Checked In' | 'Checked Out' | 'Never'
} {
  const entries = getStaffTimeEntries(staffId, startDate, endDate)
  const completedEntries = entries.filter(entry => entry.status === 'Checked Out')
  const totalMinutes = completedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100
  const totalDays = new Set(entries.map(entry => entry.date)).size
  const averageHoursPerDay = totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0
  
  const currentEntry = getCurrentStaffTimeEntry(staffId)
  const currentStatus = currentEntry ? 'Checked In' : (entries.length > 0 ? 'Checked Out' : 'Never')
  
  return {
    totalHours,
    totalDays,
    averageHoursPerDay,
    totalEntries: entries.length,
    completedEntries: completedEntries.length,
    currentStatus
  }
}

export function getStaffByEmail(email: string): any {
  // Check in additional users (which includes staff)
  const additionalUsers = getFromStorage(STORAGE_KEYS.ADDITIONAL_USERS, [])
  const staff = additionalUsers.find((u: any) => u.email === email && (u.role === 'STAFF' || u.role === 'TEAM_LEAD'))
  if (staff) return staff
  
  return null
}

// Mock package limits data
export const mockPackageLimits: MockPackageLimit[] = [
  {
    id: '1',
    packageId: 'PKG-001',
    monthlyHoursLimit: 20,
    maxBookingDuration: 120, // 2 hours
    maxBookingsPerDay: 2,
    isActive: true
  },
  {
    id: '2',
    packageId: 'PKG-002',
    monthlyHoursLimit: 40,
    maxBookingDuration: 180, // 3 hours
    maxBookingsPerDay: 3,
    isActive: true
  },
  {
    id: '3',
    packageId: 'PKG-003',
    monthlyHoursLimit: 60,
    maxBookingDuration: 240, // 4 hours
    maxBookingsPerDay: 4,
    isActive: true
  }
]

// Helper functions
export function getCustomerByEmail(email: string): MockCustomer | undefined {
  return mockCustomers.find(customer => customer.email === email)
}

export function getCustomerById(id: string): MockCustomer | undefined {
  return mockCustomers.find(customer => customer.id === id)
}

export function getCustomerByUserId(userId: string): MockCustomer | undefined {
  const customerId = userIdToCustomerId[userId]
  if (!customerId) return undefined
  return getCustomerById(customerId)
}

export function updateMockCustomer(id: string, updateData: any): MockCustomer | undefined {
  const customerIndex = mockCustomers.findIndex(customer => customer.id === id)
  if (customerIndex === -1) return undefined
  
  // Update the customer with new data
  mockCustomers[customerIndex] = {
    ...mockCustomers[customerIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  }
  
  return mockCustomers[customerIndex]
}

export function getComplaintsByCustomerId(customerId: string): MockComplaint[] {
  mockComplaints = getFromStorage(STORAGE_KEYS.COMPLAINTS, defaultComplaints)
  return mockComplaints.filter(complaint => complaint.customerId === customerId)
}

export function getContractsByCustomerId(customerId: string): MockContract[] {
  return mockContracts.filter(contract => contract.customerId === customerId)
}

export function createComplaint(customerId: string, branchId: string, title: string, description: string): MockComplaint {
  mockComplaints = getFromStorage(STORAGE_KEYS.COMPLAINTS, defaultComplaints)
  const newComplaint: MockComplaint = {
    id: (mockComplaints.length + 1).toString(),
    customerId,
    branchId,
    title,
    description,
    status: 'Open',
    remarks: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  mockComplaints.push(newComplaint)
  saveToStorage(STORAGE_KEYS.COMPLAINTS, mockComplaints)
  return newComplaint
}

export function getComplaintById(complaintId: string): MockComplaint | undefined {
  mockComplaints = getFromStorage(STORAGE_KEYS.COMPLAINTS, defaultComplaints)
  return mockComplaints.find(complaint => complaint.id === complaintId)
}

export function updateComplaint(complaintId: string, updates: Partial<MockComplaint>): MockComplaint | null {
  mockComplaints = getFromStorage(STORAGE_KEYS.COMPLAINTS, defaultComplaints)
  const complaintIndex = mockComplaints.findIndex(complaint => complaint.id === complaintId)
  
  if (complaintIndex === -1) return null
  
  mockComplaints[complaintIndex] = { 
    ...mockComplaints[complaintIndex], 
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveToStorage(STORAGE_KEYS.COMPLAINTS, mockComplaints)
  return mockComplaints[complaintIndex]
}

export function getAllComplaints(): MockComplaint[] {
  mockComplaints = getFromStorage(STORAGE_KEYS.COMPLAINTS, defaultComplaints)
  return mockComplaints
}

export function createContractRequest(customerId: string): MockContract {
  const newContract: MockContract = {
    id: (mockContracts.length + 1).toString(),
    customerId,
    status: 'Requested',
    createdAt: new Date().toISOString()
  }
  mockContracts.push(newContract)
  return newContract
}

// Time tracking helper functions
export function getTimeEntriesByCustomerId(customerId: string): MockTimeEntry[] {
  mockTimeEntries = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)
  return mockTimeEntries.filter(entry => entry.customerId === customerId)
}

export function getCurrentTimeEntry(customerId: string): MockTimeEntry | undefined {
  mockTimeEntries = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)
  return mockTimeEntries.find(entry => 
    entry.customerId === customerId && entry.status === 'Checked In'
  )
}

export function checkIn(customerId: string, notes?: string): MockTimeEntry {
  mockTimeEntries = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()
  
  const newEntry: MockTimeEntry = {
    id: (mockTimeEntries.length + 1).toString(),
    customerId,
    checkInTime: now,
    date: today,
    status: 'Checked In',
    notes: notes || ''
  }
  
  mockTimeEntries.push(newEntry)
  saveToStorage(STORAGE_KEYS.TIME_ENTRIES, mockTimeEntries)
  return newEntry
}

// Helper function to clear time entries (for testing/reset)
export function clearTimeEntries(): void {
  saveToStorage(STORAGE_KEYS.TIME_ENTRIES, [])
  mockTimeEntries = []
}

export function checkOut(customerId: string): MockTimeEntry | null {
  mockTimeEntries = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)
  const currentEntry = getCurrentTimeEntry(customerId)
  if (!currentEntry) return null
  
  const now = new Date()
  const checkInTime = new Date(currentEntry.checkInTime)
  const duration = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60)) // minutes
  
  currentEntry.checkOutTime = now.toISOString()
  currentEntry.duration = duration
  currentEntry.status = 'Checked Out'
  
  saveToStorage(STORAGE_KEYS.TIME_ENTRIES, mockTimeEntries)
  return currentEntry
}

export function getTimeEntriesByDateRange(customerId: string, startDate: string, endDate: string): MockTimeEntry[] {
  mockTimeEntries = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)
  return mockTimeEntries.filter(entry => 
    entry.customerId === customerId &&
    entry.date >= startDate &&
    entry.date <= endDate
  )
}

export function getTotalHoursInRange(customerId: string, startDate: string, endDate: string): number {
  const entries = getTimeEntriesByDateRange(customerId, startDate, endDate)
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
  return Math.round((totalMinutes / 60) * 100) / 100 // Round to 2 decimal places
}

// Meeting room helper functions
export function getAllMeetingRooms(): MockMeetingRoom[] {
  return mockMeetingRooms
}

export function getActiveMeetingRooms(): MockMeetingRoom[] {
  return mockMeetingRooms.filter(room => room.isActive)
}

export function getMeetingRoomById(id: string): MockMeetingRoom | undefined {
  return mockMeetingRooms.find(room => room.id === id)
}

export function createMeetingRoom(name: string, capacity: number, location: string, amenities: string[]): MockMeetingRoom {
  const newRoom: MockMeetingRoom = {
    id: (mockMeetingRooms.length + 1).toString(),
    name,
    capacity,
    location,
    amenities,
    isActive: true,
    createdAt: new Date().toISOString()
  }
  mockMeetingRooms.push(newRoom)
  return newRoom
}

export function updateMeetingRoom(id: string, updates: Partial<MockMeetingRoom>): MockMeetingRoom | null {
  const roomIndex = mockMeetingRooms.findIndex(room => room.id === id)
  if (roomIndex === -1) return null
  
  mockMeetingRooms[roomIndex] = { ...mockMeetingRooms[roomIndex], ...updates }
  return mockMeetingRooms[roomIndex]
}

export function deleteMeetingRoom(id: string): boolean {
  const roomIndex = mockMeetingRooms.findIndex(room => room.id === id)
  if (roomIndex === -1) return false
  
  mockMeetingRooms.splice(roomIndex, 1)
  return true
}

// Booking helper functions
export function getBookingsByCustomerId(customerId: string): MockBooking[] {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  const bookings = mockBookings.filter(booking => booking.customerId === customerId)
  
  // Auto-update bookings to "Completed" status if the time has passed
  const now = new Date()
  let updated = false
  
  bookings.forEach(booking => {
    if (booking.status === 'Confirmed') {
      const bookingDateTime = new Date(`${booking.date}T${booking.endTime}:00`)
      if (now > bookingDateTime) {
        booking.status = 'Completed'
        booking.updatedAt = now.toISOString()
        updated = true
      }
    }
  })
  
  if (updated) {
    saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings)
  }
  
  return bookings
}

export function getBookingsByCustomerIdAndStatus(customerId: string, status?: string): MockBooking[] {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  let filtered = mockBookings.filter(booking => booking.customerId === customerId)
  if (status) {
    filtered = filtered.filter(booking => booking.status === status)
  }
  return filtered
}

export function getBookingsByRoomId(roomId: string): MockBooking[] {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  return mockBookings.filter(booking => booking.roomId === roomId)
}

export function getBookingsByDate(roomId: string, date: string): MockBooking[] {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  return mockBookings.filter(booking => 
    booking.roomId === roomId && 
    booking.date === date && 
    booking.status === 'Confirmed'
  )
}

export function isTimeSlotAvailable(roomId: string, date: string, startTime: string, endTime: string): boolean {
  const existingBookings = getBookingsByDate(roomId, date)
  
  for (const booking of existingBookings) {
    // Check for time overlap
    if (
      (startTime >= booking.startTime && startTime < booking.endTime) ||
      (endTime > booking.startTime && endTime <= booking.endTime) ||
      (startTime <= booking.startTime && endTime >= booking.endTime)
    ) {
      return false
    }
  }
  
  return true
}

export function getCustomerDailyBookingHours(customerId: string, date: string): number {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  const dayBookings = mockBookings.filter(booking => 
    booking.customerId === customerId && 
    booking.date === date && 
    booking.status === 'Confirmed'
  )
  
  return dayBookings.reduce((total, booking) => total + booking.duration, 0)
}

export function getCustomerMonthlyBookingHours(customerId: string, year: number, month: number): number {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]
  
  const monthBookings = mockBookings.filter(booking => 
    booking.customerId === customerId && 
    booking.date >= startDate && 
    booking.date <= endDate && 
    booking.status === 'Confirmed'
  )
  
  return monthBookings.reduce((total, booking) => total + booking.duration, 0)
}

export function createBooking(customerId: string, branchId: string, roomId: string, date: string, startTime: string, endTime: string, purpose: string): MockBooking | null {
  // Reload data from storage
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  
  // Check if time slot is available
  if (!isTimeSlotAvailable(roomId, date, startTime, endTime)) {
    return null
  }
  
  // Calculate duration
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  const duration = (end.getTime() - start.getTime()) / (1000 * 60) // minutes
  
  // Check daily booking limit (2 hours = 120 minutes)
  const dailyHours = getCustomerDailyBookingHours(customerId, date)
  if (dailyHours + duration > 120) {
    return null
  }
  
  const newBooking: MockBooking = {
    id: (mockBookings.length + 1).toString(),
    customerId,
    branchId,
    roomId,
    date,
    startTime,
    endTime,
    duration,
    status: 'Confirmed',
    purpose,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockBookings.push(newBooking)
  saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings)
  console.log('Booking created successfully:', newBooking.id)
  return newBooking
}

export function cancelBooking(bookingId: string): boolean {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  const bookingIndex = mockBookings.findIndex(booking => booking.id === bookingId)
  
  if (bookingIndex === -1) {
    return false
  }
  
  mockBookings[bookingIndex].status = 'Cancelled'
  mockBookings[bookingIndex].updatedAt = new Date().toISOString()
  saveToStorage(STORAGE_KEYS.BOOKINGS, mockBookings)
  return true
}

// Helper function to clear bookings (for testing/reset)
export function clearBookings(): void {
  saveToStorage(STORAGE_KEYS.BOOKINGS, [])
  mockBookings = []
}

// Admin helper functions to get all data

export function getAllTimeEntries(): MockTimeEntry[] {
  mockTimeEntries = getFromStorage(STORAGE_KEYS.TIME_ENTRIES, defaultTimeEntries)
  return mockTimeEntries
}

export function getAllBookings(): MockBooking[] {
  mockBookings = getFromStorage(STORAGE_KEYS.BOOKINGS, defaultBookings)
  return mockBookings
}

// Package limits helper functions
export function getPackageLimitByPackageId(packageId: string): MockPackageLimit | undefined {
  return mockPackageLimits.find(limit => limit.packageId === packageId)
}

export function updatePackageLimit(packageId: string, updates: Partial<MockPackageLimit>): MockPackageLimit | null {
  const limitIndex = mockPackageLimits.findIndex(limit => limit.packageId === packageId)
  if (limitIndex === -1) return null
  
  mockPackageLimits[limitIndex] = { ...mockPackageLimits[limitIndex], ...updates }
  return mockPackageLimits[limitIndex]
}

// Branch management functions
export function getAllBranches(): MockBranch[] {
  mockBranches = getFromStorage(STORAGE_KEYS.BRANCHES, defaultBranches)
  return mockBranches.filter(branch => branch.isActive)
}

export function getBranchById(branchId: string): MockBranch | undefined {
  mockBranches = getFromStorage(STORAGE_KEYS.BRANCHES, defaultBranches)
  return mockBranches.find(branch => branch.id === branchId)
}

export function createBranch(branchData: Omit<MockBranch, 'id' | 'createdAt' | 'updatedAt'>): MockBranch {
  mockBranches = getFromStorage(STORAGE_KEYS.BRANCHES, defaultBranches)
  
  const newBranch: MockBranch = {
    ...branchData,
    id: (mockBranches.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockBranches.push(newBranch)
  saveToStorage(STORAGE_KEYS.BRANCHES, mockBranches)
  return newBranch
}

export function updateBranch(branchId: string, updates: Partial<MockBranch>): MockBranch | null {
  mockBranches = getFromStorage(STORAGE_KEYS.BRANCHES, defaultBranches)
  const branchIndex = mockBranches.findIndex(branch => branch.id === branchId)
  
  if (branchIndex === -1) return null
  
  mockBranches[branchIndex] = {
    ...mockBranches[branchIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveToStorage(STORAGE_KEYS.BRANCHES, mockBranches)
  return mockBranches[branchIndex]
}

export function deleteBranch(branchId: string): boolean {
  mockBranches = getFromStorage(STORAGE_KEYS.BRANCHES, defaultBranches)
  const branchIndex = mockBranches.findIndex(branch => branch.id === branchId)
  
  if (branchIndex === -1) return false
  
  // Soft delete by setting isActive to false
  mockBranches[branchIndex].isActive = false
  mockBranches[branchIndex].updatedAt = new Date().toISOString()
  
  saveToStorage(STORAGE_KEYS.BRANCHES, mockBranches)
  return true
}

// Customer management functions
export function createCustomer(customerData: Omit<MockCustomer, 'id' | 'createdAt' | 'updatedAt'>): MockCustomer {
  const newCustomer: MockCustomer = {
    ...customerData,
    id: (Date.now()).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Since we don't have persistent customer storage yet, we'll add it to a simple array
  // In a real app, this would be stored in the database
  return newCustomer
}


export function getAllCustomers(): MockCustomer[] {
  // For now, return mock customers
  // In a real app, this would fetch from the database
  return [
    {
      id: '1',
      name: 'John Customer',
      email: 'customer@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Example Corp',
      accountStatus: 'Active',
      gatePassId: 'GP-001',
      packageId: 'PKG-001',
      branchId: '1',
      remarks: 'VIP customer',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 (555) 234-5678',
      company: 'Tech Solutions',
      accountStatus: 'Active',
      gatePassId: 'GP-002',
      packageId: 'PKG-002',
      branchId: '2',
      remarks: 'Regular customer',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ]
}


// Room management functions
export function getAllRooms(): MockRoom[] {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  return mockRooms.filter(room => room.isActive)
}

export function getRoomsByBranchId(branchId: string): MockRoom[] {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  return mockRooms.filter(room => room.branchId === branchId && room.isActive)
}

export function getRoomById(roomId: string): MockRoom | undefined {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  return mockRooms.find(room => room.id === roomId)
}

export function getBookableRooms(branchId?: string): MockRoom[] {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  let rooms = mockRooms.filter(room => room.isActive && room.isBookable)
  
  if (branchId) {
    rooms = rooms.filter(room => room.branchId === branchId)
  }
  
  return rooms
}

export function createRoom(roomData: Omit<MockRoom, 'id' | 'createdAt' | 'updatedAt' | 'inventory'>): MockRoom {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  
  const newRoom: MockRoom = {
    ...roomData,
    id: `ROOM-${Date.now()}`,
    inventory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockRooms.push(newRoom)
  saveToStorage(STORAGE_KEYS.ROOMS, mockRooms)
  return newRoom
}

export function updateRoom(roomId: string, updates: Partial<MockRoom>): MockRoom | null {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  const roomIndex = mockRooms.findIndex(room => room.id === roomId)
  
  if (roomIndex === -1) return null
  
  mockRooms[roomIndex] = {
    ...mockRooms[roomIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveToStorage(STORAGE_KEYS.ROOMS, mockRooms)
  return mockRooms[roomIndex]
}

export function deleteRoom(roomId: string): boolean {
  mockRooms = getFromStorage(STORAGE_KEYS.ROOMS, defaultRooms)
  const roomIndex = mockRooms.findIndex(room => room.id === roomId)
  
  if (roomIndex === -1) return false
  
  // Soft delete by setting isActive to false
  mockRooms[roomIndex].isActive = false
  mockRooms[roomIndex].updatedAt = new Date().toISOString()
  
  saveToStorage(STORAGE_KEYS.ROOMS, mockRooms)
  return true
}

// Package management functions
export function getAllPackages(): MockPackage[] {
  mockPackages = getFromStorage(STORAGE_KEYS.PACKAGES, defaultPackages)
  return mockPackages.filter(pkg => pkg.isActive)
}

export function getPackagesByBranchId(branchId: string): MockPackage[] {
  mockPackages = getFromStorage(STORAGE_KEYS.PACKAGES, defaultPackages)
  return mockPackages.filter(pkg => pkg.isActive && pkg.branchIds.includes(branchId))
}

export function getPackageById(packageId: string): MockPackage | undefined {
  mockPackages = getFromStorage(STORAGE_KEYS.PACKAGES, defaultPackages)
  return mockPackages.find(pkg => pkg.id === packageId)
}

export function createPackage(packageData: Omit<MockPackage, 'id' | 'createdAt' | 'updatedAt'>): MockPackage {
  mockPackages = getFromStorage(STORAGE_KEYS.PACKAGES, defaultPackages)
  
  const newPackage: MockPackage = {
    ...packageData,
    id: `PKG-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockPackages.push(newPackage)
  saveToStorage(STORAGE_KEYS.PACKAGES, mockPackages)
  return newPackage
}

export function updatePackage(packageId: string, updates: Partial<MockPackage>): MockPackage | null {
  mockPackages = getFromStorage(STORAGE_KEYS.PACKAGES, defaultPackages)
  const packageIndex = mockPackages.findIndex(pkg => pkg.id === packageId)
  
  if (packageIndex === -1) return null
  
  mockPackages[packageIndex] = {
    ...mockPackages[packageIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveToStorage(STORAGE_KEYS.PACKAGES, mockPackages)
  return mockPackages[packageIndex]
}

// Inventory management functions
export function getInventoryByRoomId(roomId: string): MockRoomInventoryItem[] {
  mockInventory = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)
  return mockInventory.filter(item => item.roomId === roomId)
}

export function getInventoryItemById(itemId: string): MockRoomInventoryItem | undefined {
  mockInventory = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)
  return mockInventory.find(item => item.id === itemId)
}

export function createInventoryItem(itemData: Omit<MockRoomInventoryItem, 'id' | 'createdAt' | 'updatedAt'>): MockRoomInventoryItem {
  mockInventory = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)
  
  const newItem: MockRoomInventoryItem = {
    ...itemData,
    id: `INV-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockInventory.push(newItem)
  saveToStorage(STORAGE_KEYS.INVENTORY, mockInventory)
  return newItem
}

export function updateInventoryItem(itemId: string, updates: Partial<MockRoomInventoryItem>): MockRoomInventoryItem | null {
  mockInventory = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)
  const itemIndex = mockInventory.findIndex(item => item.id === itemId)
  
  if (itemIndex === -1) return null
  
  mockInventory[itemIndex] = {
    ...mockInventory[itemIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveToStorage(STORAGE_KEYS.INVENTORY, mockInventory)
  return mockInventory[itemIndex]
}

export function deleteInventoryItem(itemId: string): boolean {
  mockInventory = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)
  const itemIndex = mockInventory.findIndex(item => item.id === itemId)
  
  if (itemIndex === -1) return false
  
  mockInventory.splice(itemIndex, 1)
  saveToStorage(STORAGE_KEYS.INVENTORY, mockInventory)
  return true
}

// Additional inventory functions for comprehensive management
export function getAllInventoryItems(): MockRoomInventoryItem[] {
  mockInventory = getFromStorage(STORAGE_KEYS.INVENTORY, defaultInventory)
  return mockInventory
}

export function getInventoryItemsByBranch(branchId: string): MockInventoryItem[] {
  // Return empty array for now since we're using room inventory
  return []
}

export function getInventoryItemsByCategory(category: 'fixture' | 'moveable' | 'consumable'): MockInventoryItem[] {
  // Return empty array for now since we're using room inventory
  return []
}

export function getInventoryItemsByLocation(location: 'store_room' | 'branch_room'): MockInventoryItem[] {
  // Return empty array for now since we're using room inventory
  return []
}

// Inventory movement functions
export function getAllInventoryMovements(): MockInventoryMovement[] {
  return getFromStorage('coworking_portal_inventory_movements', [])
}

export function getInventoryMovementsByItem(itemId: string): MockInventoryMovement[] {
  const movements = getAllInventoryMovements()
  return movements.filter(movement => movement.itemId === itemId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getInventoryMovementsByBranch(branchId: string): MockInventoryMovement[] {
  const movements = getAllInventoryMovements()
  return movements.filter(movement => 
    movement.fromBranchId === branchId || movement.toBranchId === branchId
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createInventoryMovement(movementData: Omit<MockInventoryMovement, 'id' | 'createdAt'>): MockInventoryMovement {
  const movements = getAllInventoryMovements()
  const newMovement: MockInventoryMovement = {
    ...movementData,
    id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  }
  
  const updatedMovements = [...movements, newMovement]
  saveToStorage('coworking_portal_inventory_movements', updatedMovements)
  
  return newMovement
}

// Inventory movement operations
export function moveInventoryItem(
  itemId: string, 
  quantity: number, 
  fromLocation: 'store_room' | 'branch_room',
  toLocation: 'store_room' | 'branch_room',
  toBranchId: string,
  performedBy: string,
  performedByName: string,
  toRoomId?: string,
  reason?: string,
  notes?: string
): boolean {
  // This function is for general inventory management, not room inventory
  // Return false for now since we're using room inventory
  return false
}

export function consumeInventoryItem(
  itemId: string,
  quantity: number,
  performedBy: string,
  performedByName: string,
  reason?: string,
  notes?: string
): boolean {
  // This function is for general inventory management, not room inventory
  // Return false for now since we're using room inventory
  return false
}

export function receiveInventoryItem(
  itemId: string,
  quantity: number,
  costPerUnit: number,
  vendorName: string,
  performedBy: string,
  performedByName: string,
  notes?: string
): boolean {
  // This function is for general inventory management, not room inventory
  // Return false for now since we're using room inventory
  return false
}

// Inventory reporting functions
export function getInventoryReport(branchId?: string): MockInventoryReport {
  // Return empty report since we're using room inventory
  return {
    totalItems: 0,
    totalValue: 0,
    itemsByCategory: {
      fixture: { count: 0, value: 0 },
      moveable: { count: 0, value: 0 },
      consumable: { count: 0, value: 0 }
    },
    itemsByLocation: {
      store_room: { count: 0, value: 0 },
      branch_rooms: { count: 0, value: 0 }
    },
    lowStockItems: 0,
    outOfStockItems: 0,
    recentMovements: 0
  }
}

// Export functions for user search
export function getAllManagers() {
  // Return empty array for now
  return []
}

export function getAllAdmins() {
  // Return empty array for now
  return []
}
