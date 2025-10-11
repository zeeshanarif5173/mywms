import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const dbAvailable = isDatabaseAvailable()
    
    if (!dbAvailable) {
      return NextResponse.json({
        success: false,
        message: 'Database not available',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Test database connection
    const userCount = await prisma.user.count()
    const branchCount = await prisma.branch.count()
    const customerCount = await prisma.customer.count()

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
        branchCount,
        customerCount
      },
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    }, { status: 200 })

  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed'
    }, { status: 500 })
  }
}
