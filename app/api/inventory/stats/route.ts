import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridInventory } from '@/lib/persistent-inventory'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = getHybridInventory()

    // Calculate statistics
    const totalItems = items.length
    const activeItems = items.filter(item => item.isActive).length
    const totalStockValue = items.reduce((sum, item) => {
      const quantity = item.quantity || 0
      const price = item.currentPrice || 0
      return sum + (quantity * price)
    }, 0)
    
    // Calculate low stock items
    const lowStockItems = items.filter(item => {
      const quantity = item.quantity || 0
      const minimumStock = item.minimumStock || 0
      return quantity <= minimumStock
    })
    const lowStockCount = lowStockItems.length
    const totalCategories = new Set(items.map(item => item.category)).size

    // Category breakdown
    const categoryStats = {
      fixture: items.filter(item => item.category === 'fixture').length,
      moveable: items.filter(item => item.category === 'moveable').length,
      consumable: items.filter(item => item.category === 'consumable').length
    }

    // Stock value by category
    const categoryValue = {
      fixture: items
        .filter(item => item.category === 'fixture')
        .reduce((sum, item) => sum + ((item.quantity || 0) * (item.currentPrice || 0)), 0),
      moveable: items
        .filter(item => item.category === 'moveable')
        .reduce((sum, item) => sum + ((item.quantity || 0) * (item.currentPrice || 0)), 0),
      consumable: items
        .filter(item => item.category === 'consumable')
        .reduce((sum, item) => sum + ((item.quantity || 0) * (item.currentPrice || 0)), 0)
    }

    const stats = {
      totalItems,
      activeItems,
      totalStockValue,
      lowStockCount,
      totalCategories,
      categoryStats,
      categoryValue,
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.quantity || 0,
        minimumStock: item.minimumStock || 0
      }))
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory stats' },
      { status: 500 }
    )
  }
}
