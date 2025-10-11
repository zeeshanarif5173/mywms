import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getComplaintsByCustomerId } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.customerId

    // Check if user can access this customer's complaints
    if (session.user.role === 'CUSTOMER' && session.user.id !== customerId) {
      return NextResponse.json(
        { error: 'You can only access your own complaints' },
        { status: 403 }
      )
    }

    // Get complaints from mock data
    const complaints = getComplaintsByCustomerId(customerId)

    return NextResponse.json(complaints, { status: 200 })
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}
