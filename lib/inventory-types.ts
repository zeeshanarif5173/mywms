export interface InventoryItem {
  id: string
  name: string
  description: string
  category: 'fixture' | 'moveable' | 'consumable'
  subcategory: string
  brand?: string
  model?: string
  sku?: string
  unit: string // pieces, kg, liters, etc.
  imageUrl?: string
  purchasePrice?: number
  currentPrice?: number
  supplier?: string
  minimumStock: number
  maximumStock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface InventoryLocation {
  id: string
  itemId: string
  locationType: 'store_room' | 'branch_room' | 'office'
  locationId: string // branch ID or room ID
  quantity: number
  reservedQuantity: number // for pending transfers
  lastUpdated: string
  lastUpdatedBy: string
}

export interface InventoryMovement {
  id: string
  itemId: string
  movementType: 'in' | 'out' | 'transfer' | 'adjustment' | 'consumption'
  fromLocation?: string
  toLocation?: string
  quantity: number
  reason: string
  reference?: string // PO number, transfer ID, etc.
  performedBy: string
  performedAt: string
  notes?: string
}

export interface InventoryTransfer {
  id: string
  itemId: string
  fromLocation: string
  toLocation: string
  quantity: number
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  completedBy?: string
  completedAt?: string
  notes?: string
}

export interface InventoryReport {
  itemId: string
  itemName: string
  category: string
  totalStock: number
  storeRoomStock: number
  branchStock: number
  reservedStock: number
  availableStock: number
  lastMovement: string
  lowStockAlert: boolean
}

export interface InventoryConsumption {
  id: string
  itemId: string
  locationId: string
  quantity: number
  consumedBy: string
  consumedAt: string
  purpose: string
  notes?: string
}

// Category configurations
export const INVENTORY_CATEGORIES = {
  fixture: {
    name: 'Fixture',
    description: 'Fixed installations like panels, lighting, etc.',
    subcategories: ['Lighting', 'Panels', 'Electrical', 'Plumbing', 'HVAC', 'Security Systems']
  },
  moveable: {
    name: 'Moveable',
    description: 'Portable items like chairs, tables, fans, etc.',
    subcategories: ['Furniture', 'Electronics', 'Appliances', 'Tools', 'Equipment']
  },
  consumable: {
    name: 'Consumable',
    description: 'Items that get consumed like tea, coffee, supplies, etc.',
    subcategories: ['Beverages', 'Office Supplies', 'Cleaning Supplies', 'Food Items', 'Maintenance Supplies']
  }
}

export const MOVEMENT_TYPES = {
  in: 'Stock In',
  out: 'Stock Out',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
  consumption: 'Consumption'
}

export const LOCATION_TYPES = {
  store_room: 'Store Room',
  branch_room: 'Branch Room',
  office: 'Office'
}
