import { 
  InventoryItem, 
  InventoryLocation, 
  InventoryMovement, 
  InventoryTransfer,
  InventoryConsumption 
} from './inventory-types'

// Storage keys for persistent data
const STORAGE_KEYS = {
  INVENTORY_ITEMS: 'inventory_items',
  INVENTORY_LOCATIONS: 'inventory_locations',
  INVENTORY_MOVEMENTS: 'inventory_movements',
  INVENTORY_TRANSFERS: 'inventory_transfers',
  INVENTORY_CONSUMPTIONS: 'inventory_consumptions'
}

// Default inventory items
const defaultInventoryItems: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    category: 'moveable',
    subcategory: 'Furniture',
    brand: 'Herman Miller',
    model: 'Aeron',
    sku: 'CHAIR-001',
    unit: 'pieces',
    purchasePrice: 180000, // Rs 180,000 (approximately $1,200 converted to PKR)
    currentPrice: 180000,
    supplier: 'Office Furniture Co.',
    minimumStock: 5,
    maximumStock: 50,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'item-2',
    name: 'Coffee Beans',
    description: 'Premium arabica coffee beans',
    category: 'consumable',
    subcategory: 'Beverages',
    brand: 'Blue Mountain',
    sku: 'COFFEE-001',
    unit: 'kg',
    purchasePrice: 3750, // Rs 3,750 (approximately $25 converted to PKR)
    currentPrice: 3750,
    supplier: 'Coffee Suppliers Ltd.',
    minimumStock: 10,
    maximumStock: 100,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'item-3',
    name: 'LED Panel Light',
    description: 'Energy efficient LED panel light',
    category: 'fixture',
    subcategory: 'Lighting',
    brand: 'Philips',
    model: 'CoreLine',
    sku: 'LIGHT-001',
    unit: 'pieces',
    purchasePrice: 22500, // Rs 22,500 (approximately $150 converted to PKR)
    currentPrice: 22500,
    supplier: 'Lighting Solutions',
    minimumStock: 10,
    maximumStock: 100,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// Default inventory locations
const defaultInventoryLocations: InventoryLocation[] = [
  {
    id: 'loc-1',
    itemId: 'item-1',
    locationType: 'store_room',
    locationId: 'store-room-1',
    quantity: 25,
    reservedQuantity: 0,
    lastUpdated: '2024-01-01T00:00:00Z',
    lastUpdatedBy: 'admin'
  },
  {
    id: 'loc-2',
    itemId: 'item-1',
    locationType: 'branch_room',
    locationId: '1', // Downtown Branch
    quantity: 15,
    reservedQuantity: 0,
    lastUpdated: '2024-01-01T00:00:00Z',
    lastUpdatedBy: 'admin'
  },
  {
    id: 'loc-3',
    itemId: 'item-2',
    locationType: 'store_room',
    locationId: 'store-room-1',
    quantity: 50,
    reservedQuantity: 0,
    lastUpdated: '2024-01-01T00:00:00Z',
    lastUpdatedBy: 'admin'
  },
  {
    id: 'loc-4',
    itemId: 'item-3',
    locationType: 'store_room',
    locationId: 'store-room-1',
    quantity: 30,
    reservedQuantity: 0,
    lastUpdated: '2024-01-01T00:00:00Z',
    lastUpdatedBy: 'admin'
  }
]

// Default inventory movements
const defaultInventoryMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    itemId: 'item-1',
    movementType: 'in',
    quantity: 40,
    reason: 'Initial stock',
    reference: 'PO-001',
    performedBy: 'admin',
    performedAt: '2024-01-01T00:00:00Z',
    notes: 'Initial stock setup'
  },
  {
    id: 'mov-2',
    itemId: 'item-1',
    movementType: 'transfer',
    fromLocation: 'store-room-1',
    toLocation: '1',
    quantity: 15,
    reason: 'Branch setup',
    reference: 'TRF-001',
    performedBy: 'admin',
    performedAt: '2024-01-01T00:00:00Z',
    notes: 'Transferred to Downtown Branch'
  }
]

// Helper functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// Inventory Items Management
export const getInventoryItems = (): InventoryItem[] => {
  return getFromStorage(STORAGE_KEYS.INVENTORY_ITEMS, defaultInventoryItems)
}

export const saveInventoryItems = (items: InventoryItem[]): void => {
  saveToStorage(STORAGE_KEYS.INVENTORY_ITEMS, items)
}

export const getInventoryItemById = (id: string): InventoryItem | undefined => {
  const items = getInventoryItems()
  return items.find(item => item.id === id)
}

export const createInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): InventoryItem => {
  const items = getInventoryItems()
  const newItem: InventoryItem = {
    ...item,
    id: `item-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  items.push(newItem)
  saveInventoryItems(items)
  return newItem
}

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): InventoryItem | null => {
  const items = getInventoryItems()
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return null
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  saveInventoryItems(items)
  return items[index]
}

export const deleteInventoryItem = (id: string): boolean => {
  const items = getInventoryItems()
  const filteredItems = items.filter(item => item.id !== id)
  if (filteredItems.length === items.length) return false
  
  saveInventoryItems(filteredItems)
  return true
}

// Inventory Locations Management
export const getInventoryLocations = (): InventoryLocation[] => {
  return getFromStorage(STORAGE_KEYS.INVENTORY_LOCATIONS, defaultInventoryLocations)
}

export const saveInventoryLocations = (locations: InventoryLocation[]): void => {
  saveToStorage(STORAGE_KEYS.INVENTORY_LOCATIONS, locations)
}

export const getInventoryLocationsByItem = (itemId: string): InventoryLocation[] => {
  const locations = getInventoryLocations()
  return locations.filter(loc => loc.itemId === itemId)
}

export const getInventoryLocationsByLocation = (locationId: string): InventoryLocation[] => {
  const locations = getInventoryLocations()
  return locations.filter(loc => loc.locationId === locationId)
}

export const updateInventoryLocation = (
  itemId: string, 
  locationId: string, 
  quantity: number, 
  updatedBy: string
): InventoryLocation | null => {
  const locations = getInventoryLocations()
  const index = locations.findIndex(loc => loc.itemId === itemId && loc.locationId === locationId)
  
  if (index === -1) {
    // Create new location entry
    const newLocation: InventoryLocation = {
      id: `loc-${Date.now()}`,
      itemId,
      locationType: 'store_room', // Default, should be specified
      locationId,
      quantity,
      reservedQuantity: 0,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: updatedBy
    }
    locations.push(newLocation)
    saveInventoryLocations(locations)
    return newLocation
  }
  
  locations[index] = {
    ...locations[index],
    quantity,
    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: updatedBy
  }
  saveInventoryLocations(locations)
  return locations[index]
}

// Inventory Movements Management
export const getInventoryMovements = (): InventoryMovement[] => {
  return getFromStorage(STORAGE_KEYS.INVENTORY_MOVEMENTS, defaultInventoryMovements)
}

export const saveInventoryMovements = (movements: InventoryMovement[]): void => {
  saveToStorage(STORAGE_KEYS.INVENTORY_MOVEMENTS, movements)
}

export const createInventoryMovement = (movement: Omit<InventoryMovement, 'id' | 'performedAt'>): InventoryMovement => {
  const movements = getInventoryMovements()
  const newMovement: InventoryMovement = {
    ...movement,
    id: `mov-${Date.now()}`,
    performedAt: new Date().toISOString()
  }
  movements.push(newMovement)
  saveInventoryMovements(movements)
  return newMovement
}

export const getInventoryMovementsByItem = (itemId: string): InventoryMovement[] => {
  const movements = getInventoryMovements()
  return movements.filter(mov => mov.itemId === itemId)
}

// Inventory Transfers Management
export const getInventoryTransfers = (): InventoryTransfer[] => {
  return getFromStorage(STORAGE_KEYS.INVENTORY_TRANSFERS, [])
}

export const saveInventoryTransfers = (transfers: InventoryTransfer[]): void => {
  saveToStorage(STORAGE_KEYS.INVENTORY_TRANSFERS, transfers)
}

export const createInventoryTransfer = (transfer: Omit<InventoryTransfer, 'id' | 'requestedAt'>): InventoryTransfer => {
  const transfers = getInventoryTransfers()
  const newTransfer: InventoryTransfer = {
    ...transfer,
    id: `trf-${Date.now()}`,
    requestedAt: new Date().toISOString()
  }
  transfers.push(newTransfer)
  saveInventoryTransfers(transfers)
  return newTransfer
}

export const updateInventoryTransfer = (id: string, updates: Partial<InventoryTransfer>): InventoryTransfer | null => {
  const transfers = getInventoryTransfers()
  const index = transfers.findIndex(transfer => transfer.id === id)
  if (index === -1) return null
  
  transfers[index] = {
    ...transfers[index],
    ...updates
  }
  saveInventoryTransfers(transfers)
  return transfers[index]
}

// Inventory Consumption Management
export const getInventoryConsumptions = (): InventoryConsumption[] => {
  return getFromStorage(STORAGE_KEYS.INVENTORY_CONSUMPTIONS, [])
}

export const saveInventoryConsumptions = (consumptions: InventoryConsumption[]): void => {
  saveToStorage(STORAGE_KEYS.INVENTORY_CONSUMPTIONS, consumptions)
}

export const createInventoryConsumption = (consumption: Omit<InventoryConsumption, 'id' | 'consumedAt'>): InventoryConsumption => {
  const consumptions = getInventoryConsumptions()
  const newConsumption: InventoryConsumption = {
    ...consumption,
    id: `cons-${Date.now()}`,
    consumedAt: new Date().toISOString()
  }
  consumptions.push(newConsumption)
  saveInventoryConsumptions(consumptions)
  return newConsumption
}

// Utility functions
export const getTotalStockByItem = (itemId: string): number => {
  const locations = getInventoryLocations()
  return locations
    .filter(loc => loc.itemId === itemId)
    .reduce((total, loc) => total + loc.quantity, 0)
}

export const getAvailableStockByItem = (itemId: string): number => {
  const locations = getInventoryLocations()
  return locations
    .filter(loc => loc.itemId === itemId)
    .reduce((total, loc) => total + (loc.quantity - loc.reservedQuantity), 0)
}

export const getLowStockItems = (): InventoryItem[] => {
  const items = getInventoryItems()
  return items.filter(item => {
    const totalStock = getTotalStockByItem(item.id)
    return totalStock <= item.minimumStock
  })
}

export const getInventoryReport = (): any[] => {
  const items = getInventoryItems()
  const locations = getInventoryLocations()
  
  return items.map(item => {
    const itemLocations = locations.filter(loc => loc.itemId === item.id)
    const totalStock = itemLocations.reduce((sum, loc) => sum + loc.quantity, 0)
    const reservedStock = itemLocations.reduce((sum, loc) => sum + loc.reservedQuantity, 0)
    const storeRoomStock = itemLocations
      .filter(loc => loc.locationType === 'store_room')
      .reduce((sum, loc) => sum + loc.quantity, 0)
    const branchStock = itemLocations
      .filter(loc => loc.locationType === 'branch_room')
      .reduce((sum, loc) => sum + loc.quantity, 0)
    
    const lastMovement = getInventoryMovementsByItem(item.id)
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0]
    
    return {
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      totalStock,
      storeRoomStock,
      branchStock,
      reservedStock,
      availableStock: totalStock - reservedStock,
      lastMovement: lastMovement?.performedAt || item.createdAt,
      lowStockAlert: totalStock <= item.minimumStock
    }
  })
}
