import { NextRequest, NextResponse } from 'next/server'

// GET /api/account-chart - List chart of accounts
export async function GET(request: NextRequest) {
  try {
    // For build-time compatibility, return mock data
    // In production, this should connect to the actual database
    const mockAccounts = [
      {
        id: 1,
        code: '1000',
        name: 'Assets',
        type: 'ASSET',
        category: 'Current Asset',
        balance: 0,
        isActive: true,
        branch: { id: 1, name: 'Main Branch' },
        parent: null,
        children: [
          {
            id: 2,
            code: '1100',
            name: 'Cash and Cash Equivalents',
            type: 'ASSET',
            category: 'Current Asset',
            balance: 50000
          },
          {
            id: 3,
            code: '1200',
            name: 'Accounts Receivable',
            type: 'ASSET',
            category: 'Current Asset',
            balance: 25000
          }
        ],
        _count: {
          children: 2,
          transactions: 0
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockAccounts
    })
  } catch (error) {
    console.error('Error fetching chart of accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chart of accounts' },
      { status: 500 }
    )
  }
}

// POST /api/account-chart - Create new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      name,
      type,
      category,
      parentId,
      branchId
    } = body

    // Validate required fields
    if (!code || !name || !type || !category || !branchId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid account type' },
        { status: 400 }
      )
    }

    // For build-time compatibility, return mock response
    // In production, this should connect to the actual database
    const mockAccount = {
      id: Date.now(), // Generate a unique ID
      code,
      name,
      type,
      category,
      parentId: parentId ? parseInt(parentId) : null,
      branchId: parseInt(branchId),
      balance: 0,
      isActive: true,
      branch: { id: parseInt(branchId), name: 'Main Branch' },
      parent: parentId ? { id: parseInt(parentId), code: 'PARENT', name: 'Parent Account' } : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockAccount
    })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
