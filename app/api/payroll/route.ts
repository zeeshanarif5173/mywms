import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/payroll - List all payroll records with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const branchId = searchParams.get('branchId')
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const payPeriod = searchParams.get('payPeriod')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (branchId) where.branchId = parseInt(branchId)
    if (employeeId) where.employeeId = parseInt(employeeId)
    if (status) where.status = status
    if (payPeriod) where.payPeriod = payPeriod

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          },
          items: true,
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payroll.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: payrolls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching payroll records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll records' },
      { status: 500 }
    )
  }
}

// POST /api/payroll - Create new payroll record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      branchId,
      payPeriod,
      baseSalary,
      overtime = 0,
      bonus = 0,
      deductions = 0,
      items
    } = body

    // Validate required fields
    if (!employeeId || !branchId || !payPeriod || baseSalary === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if employee and branch exist
    const [employee, branch] = await Promise.all([
      prisma.user.findUnique({ where: { id: employeeId } }),
      prisma.branch.findUnique({ where: { id: parseInt(branchId) } })
    ])

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Calculate net pay
    const grossPay = parseFloat(baseSalary) + parseFloat(overtime) + parseFloat(bonus)
    const netPay = grossPay - parseFloat(deductions)

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        branchId: parseInt(branchId),
        payPeriod,
        baseSalary: parseFloat(baseSalary),
        overtime: parseFloat(overtime),
        bonus: parseFloat(bonus),
        deductions: parseFloat(deductions),
        netPay,
        status: 'PENDING',
        items: {
          create: items?.map((item: any) => ({
            type: item.type,
            description: item.description,
            amount: parseFloat(item.amount),
            isDeduction: item.isDeduction || false
          })) || []
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true
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
      data: payroll
    })
  } catch (error) {
    console.error('Error creating payroll record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payroll record' },
      { status: 500 }
    )
  }
}
