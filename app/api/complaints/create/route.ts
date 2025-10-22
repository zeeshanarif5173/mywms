import { NextRequest, NextResponse } from 'next/server'
import { getPersistentComplaints, savePersistentComplaints } from '@/lib/persistent-complaints'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, customerId, imageUrl } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    // Get existing complaints from persistent storage
    const existingComplaints = getPersistentComplaints()
    
    // Create new complaint
    const newComplaint = {
      id: `complaint-${Date.now()}`,
      customerId: customerId || '1',
      title,
      description,
      status: 'Open',
      remarks: null,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null
    }

    // Add to persistent storage
    const updatedComplaints = [...existingComplaints, newComplaint]
    savePersistentComplaints(updatedComplaints)
    
    return NextResponse.json(newComplaint, { status: 201 })
  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}