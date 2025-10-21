import { NextRequest, NextResponse } from 'next/server'
import { createComplaint } from '@/lib/db-service'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, customerId } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Use customerId from body or default to '1' for testing
    const complaint = await createComplaint(customerId || '1', title, description)
    
    return NextResponse.json(complaint)
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}