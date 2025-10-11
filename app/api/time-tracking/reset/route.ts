import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { clearTimeEntries } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow reset for testing purposes
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can reset time entries' }, { status: 403 })
    }

    clearTimeEntries()

    return NextResponse.json({ message: 'Time entries cleared successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error clearing time entries:', error)
    return NextResponse.json(
      { error: 'Failed to clear time entries' },
      { status: 500 }
    )
  }
}
