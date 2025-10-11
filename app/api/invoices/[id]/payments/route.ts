import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// POST /api/invoices/[id]/payments - Record payment for invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)
    const body = await request.json()
    const { amount, method, reference } = body

    // Validate required fields
    if (!amount || !method) {
      return NextResponse.json(
        { success: false, error: 'Amount and payment method are required' },
        { status: 400 }
      )
    }

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Calculate total paid amount
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const newTotalPaid = totalPaid + parseFloat(amount)

    // Check if payment exceeds invoice total
    if (newTotalPaid > invoice.total) {
      return NextResponse.json(
        { success: false, error: 'Payment amount exceeds invoice total' },
        { status: 400 }
      )
    }

    // Record payment
    const payment = await prisma.invoicePayment.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        method,
        reference,
        paidAt: new Date()
      }
    })

    // Update invoice status if fully paid
    const status = newTotalPaid >= invoice.total ? 'PAID' : 'PARTIAL'
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        ...(status === 'PAID' && { paidAt: new Date() })
      }
    })

    return NextResponse.json({
      success: true,
      data: payment,
      message: status === 'PAID' ? 'Invoice fully paid' : 'Partial payment recorded'
    })
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}

// GET /api/invoices/[id]/payments - Get all payments for invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)

    const payments = await prisma.invoicePayment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: payments
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
