import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/account-chart - List chart of accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    const where: any = { isActive: true }
    
    if (branchId) where.branchId = parseInt(branchId)
    if (type) where.type = type
    if (category) where.category = category

    const accounts = await prisma.accountChart.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        },
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            category: true,
            balance: true
          },
          orderBy: { code: 'asc' }
        },
        _count: {
          select: {
            children: true,
            transactions: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: accounts
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

    // Check if code is unique
    const existingAccount = await prisma.accountChart.findUnique({
      where: { code }
    })

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: 'Account code already exists' },
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

    // Check if parent account exists (if provided)
    if (parentId) {
      const parentAccount = await prisma.accountChart.findUnique({
        where: { id: parseInt(parentId) }
      })

      if (!parentAccount) {
        return NextResponse.json(
          { success: false, error: 'Parent account not found' },
          { status: 404 }
        )
      }
    }

    // Create account
    const account = await prisma.accountChart.create({
      data: {
        code,
        name,
        type,
        category,
        parentId: parentId ? parseInt(parentId) : null,
        branchId: parseInt(branchId),
        balance: 0,
        isActive: true
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        },
        parent: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: account
    })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
