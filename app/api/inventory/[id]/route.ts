import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridInventory, savePersistentInventory, InventoryItem } from '@/lib/persistent-inventory'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const itemId = params.id
    const items = getHybridInventory()
    const item = items.find((item: InventoryItem) => item.id === itemId)

    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json(item, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can update inventory items
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const itemId = params.id
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
      imageUrl,
      purchasePrice, 
      currentPrice, 
      supplier, 
      minimumStock, 
      maximumStock, 
      isActive 
    } = body

    if (category && !['fixture', 'moveable', 'consumable'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const items = getHybridInventory()
    const itemIndex = items.findIndex((item: InventoryItem) => item.id === itemId)

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const updatedItem: InventoryItem = {
      ...items[itemIndex],
      name,
      description,
      category,
      subcategory,
      brand,
      model,
      sku,
      unit,
      imageUrl,
      purchasePrice,
      currentPrice,
      supplier,
      minimumStock,
      maximumStock,
      isActive,
      updatedAt: new Date().toISOString()
    }

    items[itemIndex] = updatedItem
    savePersistentInventory(items)

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete inventory items
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete inventory items' }, { status: 403 })
    }

    const itemId = params.id
    const items = getHybridInventory()
    const itemIndex = items.findIndex((item: InventoryItem) => item.id === itemId)

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    // Remove the item from the array
    items.splice(itemIndex, 1)
    savePersistentInventory(items)

    return NextResponse.json({ message: 'Inventory item deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    )
  }
}