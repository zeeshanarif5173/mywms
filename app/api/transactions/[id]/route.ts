import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/transactions/[id] - Get specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id)

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        },
        account: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            category: true,
            balance: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id)
    const body = await request.json()
    const {
      accountId,
      type,
      amount,
      description,
      category,
      reference,
      date
    } = body

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Validate type if provided
    if (type && !['DEBIT', 'CREDIT'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be DEBIT or CREDIT' },
        { status: 400 }
      )
    }

    // Revert old transaction's effect on account balance
    const oldBalanceChange = existingTransaction.type === 'DEBIT' 
      ? -existingTransaction.amount 
      : existingTransaction.amount
    
    await prisma.accountChart.update({
      where: { id: existingTransaction.accountId },
      data: {
        balance: {
          increment: oldBalanceChange
        }
      }
    })

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(accountId && { accountId: parseInt(accountId) }),
        ...(type && { type }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(category && { category }),
        ...(reference !== undefined && { reference }),
        ...(date && { date: new Date(date) })
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

    // Apply new transaction's effect on account balance
    const newBalanceChange = (type || existingTransaction.type) === 'DEBIT' 
      ? parseFloat(amount || existingTransaction.amount.toString())
      : -parseFloat(amount || existingTransaction.amount.toString())
    
    await prisma.accountChart.update({
      where: { id: parseInt(accountId || existingTransaction.accountId.toString()) },
      data: {
        balance: {
          increment: newBalanceChange
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id)

    // Check if transaction exists
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Revert transaction's effect on account balance
    const balanceChange = transaction.type === 'DEBIT' 
      ? -transaction.amount 
      : transaction.amount
    
    await prisma.accountChart.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    })

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
