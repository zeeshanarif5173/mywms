import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getCustomerByEmail, checkOut, getCurrentTimeEntry } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can check out
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can check out' }, { status: 403 })
    }

    // Find customer by email
    const customer = getCustomerByEmail(session.user.email)

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check if currently checked in
    const currentEntry = getCurrentTimeEntry(customer.id)
    if (!currentEntry) {
      return NextResponse.json(
        { error: 'You are not currently checked in' },
        { status: 400 }
      )
    }

    // Check out
    const updatedEntry = checkOut(customer.id)

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Failed to check out' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedEntry, { status: 200 })
  } catch (error) {
    console.error('Error checking out:', error)
    return NextResponse.json(
      { error: 'Failed to check out' },
      { status: 500 }
    )
  }
}
