import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  createInventoryMovement, 
  getInventoryMovements, 
  getInventoryMovementsByItem,
  updateInventoryLocation 
} from '@/lib/inventory-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    let movements
    if (itemId) {
      movements = getInventoryMovementsByItem(itemId)
    } else {
      movements = getInventoryMovements()
    }

    return NextResponse.json(movements, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory movements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory movements' },
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

    // Only admins and managers can create inventory movements
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      itemId, 
      movementType, 
      fromLocation, 
      toLocation, 
      quantity, 
      reason, 
      reference, 
      notes 
    } = body

    if (!itemId || !movementType || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['in', 'out', 'transfer', 'adjustment', 'consumption'].includes(movementType)) {
      return NextResponse.json(
        { error: 'Invalid movement type' },
        { status: 400 }
      )
    }

    // Create the movement record
    const newMovement = createInventoryMovement({
      itemId,
      movementType,
      fromLocation,
      toLocation,
      quantity,
      reason,
      reference,
      performedBy: session.user.email || 'unknown',
      notes
    })

    // Update inventory locations based on movement type
    if (movementType === 'in' && toLocation) {
      // Add stock to location
      updateInventoryLocation(itemId, toLocation, quantity, session.user.email || 'unknown')
    } else if (movementType === 'out' && fromLocation) {
      // Remove stock from location (assuming current quantity is available)
      updateInventoryLocation(itemId, fromLocation, -quantity, session.user.email || 'unknown')
    } else if (movementType === 'transfer' && fromLocation && toLocation) {
      // Transfer stock between locations
      updateInventoryLocation(itemId, fromLocation, -quantity, session.user.email || 'unknown')
      updateInventoryLocation(itemId, toLocation, quantity, session.user.email || 'unknown')
    }

    return NextResponse.json(newMovement, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory movement:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory movement' },
      { status: 500 }
    )
  }
}