import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/invoices/[id] - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true
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

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)
    const body = await request.json()
    const {
      customerId,
      branchId,
      issueDate,
      dueDate,
      status,
      items,
      taxRate,
      notes
    } = body

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Calculate totals if items are provided
    let subtotal = existingInvoice.subtotal
    let taxAmount = existingInvoice.taxAmount
    let total = existingInvoice.total

    if (items) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      taxAmount = subtotal * ((taxRate || existingInvoice.taxRate) / 100)
      total = subtotal + taxAmount
    }

    // Update invoice
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(customerId && { customerId: parseInt(customerId) }),
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
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true
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
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId }
      })

      // Create new items
      await prisma.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.quantity) * parseFloat(item.unitPrice)
        }))
      })
    }

    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice is paid
    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete paid invoice' },
        { status: 400 }
      )
    }

    // Delete invoice (cascade will delete items and payments)
    await prisma.invoice.delete({
      where: { id: invoiceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
