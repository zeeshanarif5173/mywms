import { NextRequest, NextResponse } from 'next/server'
import { getPersistentBranches } from '@/lib/persistent-branches'
import { getPersistentRooms } from '@/lib/persistent-rooms'
import { getPersistentInventory } from '@/lib/persistent-inventory'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all data
    const branches = getPersistentBranches()
    const rooms = getPersistentRooms()
    const inventory = getPersistentInventory()
    
    // Find the branch
    const branch = branches.find(b => b.id === params.id)
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }
    
    // Filter rooms for this branch
    const branchRooms = rooms.filter(room => room.branchId === params.id)
    
    // Filter inventory items for this branch
    const branchInventory = inventory.filter(item => 
      item.isActive && (item.branchId === params.id || !item.branchId)
    )
    
    // Categorize inventory by type
    const inventoryByCategory = {
      fixture: branchInventory.filter(item => item.category === 'fixture'),
      moveable: branchInventory.filter(item => item.category === 'moveable'),
      consumable: branchInventory.filter(item => item.category === 'consumable')
    }
    
    // Calculate inventory statistics
    const totalItems = branchInventory.length
    const totalQuantity = branchInventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
    const totalValue = branchInventory.reduce((sum, item) => sum + ((item.currentPrice || 0) * (item.quantity || 0)), 0)
    
    // Room statistics
    const totalRooms = branchRooms.length
    const activeRooms = branchRooms.filter(room => room.isActive).length
    const bookableRooms = branchRooms.filter(room => room.isBookable).length
    
    return NextResponse.json({
      branch: {
        id: branch.id,
        name: branch.name,
        address: branch.address,
        city: branch.city,
        state: branch.state
      },
      inventory: {
        totalItems,
        totalQuantity,
        totalValue,
        byCategory: inventoryByCategory,
        items: branchInventory
      },
      rooms: {
        total: totalRooms,
        active: activeRooms,
        bookable: bookableRooms,
        list: branchRooms
      }
    })
  } catch (error) {
    console.error('Error fetching branch inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch branch inventory' }, { status: 500 })
  }
}
