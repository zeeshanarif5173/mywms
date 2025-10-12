import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Check if Prisma client is initialized
    if (!prisma || typeof prisma.customer === 'undefined') {
      return NextResponse.json({
        success: false,
        error: 'Prisma client not initialized',
        prismaType: typeof prisma,
        hasCustomer: !!prisma?.customer
      }, { status: 500 })
    }

    // Test database connection
    const [customerCount, userCount, branchCount] = await Promise.all([
      prisma.customer.count(),
      prisma.user.count(),
      prisma.branch.count()
    ])

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      counts: {
        customers: customerCount,
        users: userCount,
        branches: branchCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    })

  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: typeof error,
      stack: error.stack
    }, { status: 500 })
  }
}
