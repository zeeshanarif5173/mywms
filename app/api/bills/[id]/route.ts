import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/bills/[id] - Get specific bill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = parseInt(params.id)

    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            taxId: true
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
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: bill
    })
  } catch (error) {
    console.error('Error fetching bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bill' },
      { status: 500 }
    )
  }
}

// PUT /api/bills/[id] - Update bill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = parseInt(params.id)
    const body = await request.json()
    const {
      vendorId,
      branchId,
      issueDate,
      dueDate,
      status,
      items,
      taxRate,
      notes
    } = body

    // Check if bill exists
    const existingBill = await prisma.bill.findUnique({
      where: { id: billId }
    })

    if (!existingBill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      )
    }

    // Calculate totals if items are provided
    let subtotal = existingBill.subtotal
    let taxAmount = existingBill.taxAmount
    let total = existingBill.total

    if (items) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      taxAmount = subtotal * ((taxRate || existingBill.taxRate) / 100)
      total = subtotal + taxAmount
    }

    // Update bill
    const bill = await prisma.bill.update({
      where: { id: billId },
      data: {
        ...(vendorId && { vendorId: parseInt(vendorId) }),
        ...(branchId && { branchId: parseInt(branchId) }),
        ...(issueDate && { issueDate: new Date(issueDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
        ...(items && { subtotal, taxAmount, total }),
        ...(taxRate !== undefined && { taxRate }),
        ...(notes !== undefined && { notes }),
        ...(status === 'PAID' && { paidAt: new Date() })
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
        items: true,
        payments: true
      }
    })

    // Update items if provided
    if (items) {
      // Delete existing items
      await prisma.billItem.deleteMany({
        where: { billId }
      })

      // Create new items
      await prisma.billItem.createMany({
        data: items.map((item: any) => ({
          billId,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.quantity) * parseFloat(item.unitPrice)
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: bill
    })
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}

// DELETE /api/bills/[id] - Delete bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const billId = parseInt(params.id)

    // Check if bill exists
    const bill = await prisma.bill.findUnique({
      where: { id: billId }
    })

    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      )
    }

    // Check if bill is paid
    if (bill.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete paid bill' },
        { status: 400 }
      )
    }

    // Delete bill (cascade will delete items and payments)
    await prisma.bill.delete({
      where: { id: billId }
    })

    return NextResponse.json({
      success: true,
      message: 'Bill deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete bill' },
      { status: 500 }
    )
  }
}
