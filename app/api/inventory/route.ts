import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridInventory, savePersistentInventory, InventoryItem } from '@/lib/persistent-inventory'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const report = searchParams.get('report')

    // Get inventory items from persistent storage
    let items = getHybridInventory()

    if (report === 'true') {
      // Return inventory items formatted for reports
      const reportData = items.map(item => ({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        totalStock: item.quantity || 0,
        storeRoomStock: item.quantity || 0, // Assuming all stock is in store room for now
        branchStock: 0,
        reservedStock: 0,
        availableStock: item.quantity || 0,
         lastMovement: item.updatedAt || new Date().toISOString(),
        lowStockAlert: (item.quantity || 0) < (item.minimumStock || 10)
      }))
      return NextResponse.json(reportData, { status: 200 })
    }

    // Return all inventory items
    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can create inventory items
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      category, 
      subcategory, 
      brand, 
      model, 
      sku, 
      unit, 
      quantity,
      imageUrl,
      purchasePrice, 
      currentPrice, 
      supplier, 
      minimumStock, 
      maximumStock, 
      isActive = true 
    } = body

    if (!name || !description || !category || !subcategory || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['fixture', 'moveable', 'consumable'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Get existing items from persistent storage
    const existingItems = getHybridInventory()
    
    // Create new item
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name,
      description,
      category,
      subcategory,
      brand,
      model,
      sku,
      unit,
      quantity: quantity || 0,
      imageUrl,
      purchasePrice,
      currentPrice,
      supplier,
      minimumStock: minimumStock || 0,
      maximumStock: maximumStock || 1000,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedItems = [...existingItems, newItem]
    savePersistentInventory(updatedItems)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    )
  }
}