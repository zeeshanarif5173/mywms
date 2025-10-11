import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/transactions - List all transactions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const branchId = searchParams.get('branchId')
    const accountId = searchParams.get('accountId')
    const type = searchParams.get('type') // DEBIT, CREDIT
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (branchId) where.branchId = parseInt(branchId)
    if (accountId) where.accountId = parseInt(accountId)
    if (type) where.type = type
    if (category) where.category = category
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          account: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              category: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      branchId,
      accountId,
      type,
      amount,
      description,
      category,
      reference,
      date
    } = body

    // Validate required fields
    if (!branchId || !accountId || !type || !amount || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['DEBIT', 'CREDIT'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be DEBIT or CREDIT' },
        { status: 400 }
      )
    }

    // Check if branch and account exist
    const [branch, account] = await Promise.all([
      prisma.branch.findUnique({ where: { id: parseInt(branchId) } }),
      prisma.accountChart.findUnique({ where: { id: parseInt(accountId) } })
    ])

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    // Generate transaction number
    const transactionCount = await prisma.transaction.count()
    const transactionNumber = `TXN-${String(transactionCount + 1).padStart(8, '0')}`

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        branchId: parseInt(branchId),
        accountId: parseInt(accountId),
        type,
        amount: parseFloat(amount),
        description,
        category,
        reference,
        date: date ? new Date(date) : new Date()
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        },
        account: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            category: true
          }
        }
      }
    })

    // Update account balance
    const balanceChange = type === 'DEBIT' ? parseFloat(amount) : -parseFloat(amount)
    await prisma.accountChart.update({
      where: { id: parseInt(accountId) },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
