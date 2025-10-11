import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  createInventoryTransfer, 
  getInventoryTransfers, 
  updateInventoryTransfer 
} from '@/lib/inventory-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transfers = getInventoryTransfers()
    return NextResponse.json(transfers, { status: 200 })
  } catch (error) {
    console.error('Error fetching inventory transfers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory transfers' },
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

    // Only admins and managers can create inventory transfers
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      itemId, 
      fromLocation, 
      toLocation, 
      quantity, 
      notes 
    } = body

    if (!itemId || !fromLocation || !toLocation || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    const newTransfer = createInventoryTransfer({
      itemId,
      fromLocation,
      toLocation,
      quantity,
      status: 'pending',
      requestedBy: session.user.email || 'unknown',
      notes
    })

    return NextResponse.json(newTransfer, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory transfer:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory transfer' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can update inventory transfers
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      transferId, 
      status, 
      notes 
    } = body

    if (!transferId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['pending', 'in_transit', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updates: any = { status }
    
    if (status === 'approved' || status === 'in_transit') {
      updates.approvedBy = session.user.email || 'unknown'
      updates.approvedAt = new Date().toISOString()
    } else if (status === 'completed') {
      updates.completedBy = session.user.email || 'unknown'
      updates.completedAt = new Date().toISOString()
    }

    if (notes) {
      updates.notes = notes
    }

    const updatedTransfer = updateInventoryTransfer(transferId, updates)

    if (!updatedTransfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }

    return NextResponse.json(updatedTransfer, { status: 200 })
  } catch (error) {
    console.error('Error updating inventory transfer:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory transfer' },
      { status: 500 }
    )
  }
}
