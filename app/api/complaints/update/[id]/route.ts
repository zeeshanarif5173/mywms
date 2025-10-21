import { NextRequest, NextResponse } from 'next/server'
import { updateComplaint } from '@/lib/db-service'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const complaintId = params.id

    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 })
    }

    const updatedComplaint = await updateComplaint(complaintId, body)
    
    if (!updatedComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    return NextResponse.json(updatedComplaint)
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}