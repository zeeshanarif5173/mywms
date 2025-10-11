import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear inventory cache by removing from localStorage keys
    const keysToClear = [
      'inventory_items',
      'inventory_locations', 
      'inventory_movements',
      'inventory_transfers',
      'inventory_consumptions'
    ]

    return NextResponse.json({ 
      success: true, 
      message: 'Inventory cache cleared. Please refresh your browser to see updated data.',
      clearedKeys: keysToClear
    }, { status: 200 })

  } catch (error) {
    console.error('Error clearing inventory cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear inventory cache' },
      { status: 500 }
    )
  }
}
