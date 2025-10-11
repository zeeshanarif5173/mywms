import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/bills - List all bills with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const branchId = searchParams.get('branchId')
    const vendorId = searchParams.get('vendorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (status) where.status = status
    if (branchId) where.branchId = parseInt(branchId)
    if (vendorId) where.vendorId = parseInt(vendorId)
    if (startDate || endDate) {
      where.issueDate = {}
      if (startDate) where.issueDate.gte = new Date(startDate)
      if (endDate) where.issueDate.lte = new Date(endDate)
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          items: true,
          payments: true,
          _count: {
            select: {
              items: true,
              payments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.bill.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: bills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

// POST /api/bills - Create new bill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vendorId,
      branchId,
      issueDate,
      dueDate,
      items,
      taxRate = 0,
      notes
    } = body

    // Validate required fields
    if (!vendorId || !branchId || !issueDate || !dueDate || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount

    // Generate bill number
    const billCount = await prisma.bill.count()
    const billNumber = `BILL-${String(billCount + 1).padStart(6, '0')}`

    // Create bill with items
    const bill = await prisma.bill.create({
      data: {
        billNumber,
        vendorId: parseInt(vendorId),
        branchId: parseInt(branchId),
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status: 'PENDING',
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            amount: parseFloat(item.quantity) * parseFloat(item.unitPrice)
          }))
        }
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        },
        items: true
      }
    })

    return NextResponse.json({
      success: true,
      data: bill
    })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
