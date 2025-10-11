import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/payroll/[id] - Get specific payroll record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payrollId = parseInt(params.id)

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        },
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!payroll) {
      return NextResponse.json(
        { success: false, error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: payroll
    })
  } catch (error) {
    console.error('Error fetching payroll record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll record' },
      { status: 500 }
    )
  }
}

// PUT /api/payroll/[id] - Update payroll record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payrollId = parseInt(params.id)
    const body = await request.json()
    const {
      employeeId,
      branchId,
      payPeriod,
      baseSalary,
      overtime,
      bonus,
      deductions,
      status,
      items
    } = body

    // Check if payroll record exists
    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: payrollId }
    })

    if (!existingPayroll) {
      return NextResponse.json(
        { success: false, error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    // Calculate net pay if any financial fields are updated
    let netPay = existingPayroll.netPay
    if (baseSalary !== undefined || overtime !== undefined || bonus !== undefined || deductions !== undefined) {
      const grossPay = (baseSalary !== undefined ? parseFloat(baseSalary) : existingPayroll.baseSalary) +
                      (overtime !== undefined ? parseFloat(overtime) : existingPayroll.overtime) +
                      (bonus !== undefined ? parseFloat(bonus) : existingPayroll.bonus)
      netPay = grossPay - (deductions !== undefined ? parseFloat(deductions) : existingPayroll.deductions)
    }

    // Update payroll record
    const payroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        ...(employeeId && { employeeId }),
        ...(branchId && { branchId: parseInt(branchId) }),
        ...(payPeriod && { payPeriod }),
        ...(baseSalary !== undefined && { baseSalary: parseFloat(baseSalary) }),
        ...(overtime !== undefined && { overtime: parseFloat(overtime) }),
        ...(bonus !== undefined && { bonus: parseFloat(bonus) }),
        ...(deductions !== undefined && { deductions: parseFloat(deductions) }),
        ...(status && { status }),
        ...(netPay !== existingPayroll.netPay && { netPay }),
        ...(status === 'PAID' && { paidAt: new Date() })
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

    // Update items if provided
    if (items) {
      // Delete existing items
      await prisma.payrollItem.deleteMany({
        where: { payrollId }
      })

      // Create new items
      await prisma.payrollItem.createMany({
        data: items.map((item: any) => ({
          payrollId,
          type: item.type,
          description: item.description,
          amount: parseFloat(item.amount),
          isDeduction: item.isDeduction || false
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: payroll
    })
  } catch (error) {
    console.error('Error updating payroll record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update payroll record' },
      { status: 500 }
    )
  }
}

// DELETE /api/payroll/[id] - Delete payroll record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payrollId = parseInt(params.id)

    // Check if payroll record exists
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId }
    })

    if (!payroll) {
      return NextResponse.json(
        { success: false, error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    // Check if payroll is paid
    if (payroll.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete paid payroll record' },
        { status: 400 }
      )
    }

    // Delete payroll record (cascade will delete items)
    await prisma.payroll.delete({
      where: { id: payrollId }
    })

    return NextResponse.json({
      success: true,
      message: 'Payroll record deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting payroll record:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete payroll record' },
      { status: 500 }
    )
  }
}
