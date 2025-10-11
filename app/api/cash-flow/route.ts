import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/cash-flow - List cash flow records with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const branchId = searchParams.get('branchId')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (branchId) where.branchId = parseInt(branchId)
    if (category) where.category = category
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [cashFlowRecords, total] = await Promise.all([
      prisma.cashFlow.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.cashFlow.count({ where })
    ])

    // Calculate summary statistics
    const summary = await prisma.cashFlow.aggregate({
      where,
      _sum: {
        cashIn: true,
        cashOut: true,
        balance: true
      }
    })

    return NextResponse.json({
      success: true,
      data: cashFlowRecords,
      summary: summary._sum,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching cash flow records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cash flow records' },
      { status: 500 }
    )
  }
}

// POST /api/cash-flow - Create new cash flow record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branchId,
      date,
      cashIn = 0,
      cashOut = 0,
      description,
      category
    } = body

    // Validate required fields
    if (!branchId || !date || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(branchId) }
    })

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Calculate balance
    const balance = parseFloat(cashIn) - parseFloat(cashOut)

    // Create cash flow record
    const cashFlow = await prisma.cashFlow.create({
      data: {
        branchId: parseInt(branchId),
        date: new Date(date),
        cashIn: parseFloat(cashIn),
        cashOut: parseFloat(cashOut),
        balance,
        description,
        category
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: cashFlow
    })
  } catch (error) {
    console.error('Error creating cash flow record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create cash flow record' },
      { status: 500 }
    )
  }
}
