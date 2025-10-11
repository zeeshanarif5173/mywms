import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can leave feedback
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can leave feedback' }, { status: 403 })
    }

    const complaintId = params.id
    const body = await request.json()
    const { rating, comment } = body

    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required' },
        { status: 400 }
      )
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Check if the complaint is resolved
    // 2. Check if the customer owns this complaint
    // 3. Update the complaint with feedback
    // For demo purposes, we'll return a mock response
    const feedback = {
      rating: parseInt(rating),
      comment: comment || '',
      submittedAt: new Date().toISOString()
    }

    const updatedComplaint = {
      id: complaintId,
      customerId: session.user.id,
      title: 'AC not working',
      description: 'The air conditioning in my workspace is not cooling properly.',
      photo: null,
      status: 'Resolved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      workCompletionImage: 'https://example.com/completion.jpg',
      feedback,
      resolvingTime: 4 * 24 * 60 * 60 * 1000 // 4 days in milliseconds
    }

    return NextResponse.json(updatedComplaint, { status: 200 })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
