import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  category: 'fixture' | 'moveable' | 'consumable'
  subcategory: string
  brand?: string
  model?: string
  sku?: string
  unit: string
  quantity?: number
  imageUrl?: string
  purchasePrice?: number
  currentPrice?: number
  supplier?: string
  minimumStock?: number
  maximumStock?: number
  isActive: boolean
  branchId?: string
  createdAt: string
  updatedAt: string
}

// Default inventory items (only used if no persistent data exists)
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

export function getPersistentInventory(): InventoryItem[] {
  try {
    if (fs.existsSync(INVENTORY_FILE)) {
      const data = fs.readFileSync(INVENTORY_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading persistent inventory:', error)
  }
  return []
}

export function savePersistentInventory(items: InventoryItem[]): void {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(items, null, 2))
  } catch (error) {
    console.error('Error saving persistent inventory:', error)
  }
}

export function getHybridInventory(): InventoryItem[] {
  const persistentItems = getPersistentInventory()
  
  // If we have persistent items, use them
  if (persistentItems.length > 0) {
    return persistentItems
  }
  
  // Otherwise, return empty array (no default items)
  return []
}
