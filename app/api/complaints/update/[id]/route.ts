import { NextRequest, NextResponse } from 'next/server'
import { getPersistentComplaints, savePersistentComplaints } from '@/lib/persistent-complaints'

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

    const complaints = getPersistentComplaints()
    const complaintIndex = complaints.findIndex(c => c.id === complaintId)
    
    if (complaintIndex === -1) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    // Update the complaint
    const updatedComplaint = {
      ...complaints[complaintIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    // If status is being changed to Resolved, set resolvedAt
    if (body.status === 'Resolved' && complaints[complaintIndex].status !== 'Resolved') {
      updatedComplaint.resolvedAt = new Date().toISOString()
    }

    complaints[complaintIndex] = updatedComplaint
    savePersistentComplaints(complaints)

    return NextResponse.json(updatedComplaint)
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}