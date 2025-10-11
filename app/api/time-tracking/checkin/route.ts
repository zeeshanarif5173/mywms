import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getCustomerByEmail, checkIn, getCurrentTimeEntry } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can check in
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can check in' }, { status: 403 })
    }

    const body = await request.json()
    const { notes } = body

    // Find customer by email
    const customer = getCustomerByEmail(session.user.email)

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check if customer account is locked
    if (customer.accountStatus === 'Locked') {
      return NextResponse.json(
        { error: 'Your account is locked. Cannot check in. Please contact support.' },
        { status: 403 }
      )
    }

    // Check if already checked in
    const currentEntry = getCurrentTimeEntry(customer.id)
    if (currentEntry) {
      return NextResponse.json(
        { error: 'You are already checked in' },
        { status: 400 }
      )
    }

    // Check in
    const newEntry = checkIn(customer.id, notes)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Error checking in:', error)
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    )
  }
}
