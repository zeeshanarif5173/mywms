import { NextRequest, NextResponse } from 'next/server'
import { getPersistentPayments, savePersistentPayments } from '@/lib/persistent-payments'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const payments = getPersistentPayments()
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, invoiceId, amount, paymentMethod, notes } = body

    // Validate required fields
    if (!customerId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Customer ID, amount, and payment method are required' }, { status: 400 })
    }

    // Get existing payments from persistent storage
    const existingPayments = getPersistentPayments()
    
    // Generate payment reference
    const paymentRef = `PAY-${Date.now()}`
    
    // Create new payment
    const newPayment = {
      id: `payment-${Date.now()}`,
      customerId: parseInt(customerId),
      invoiceId: invoiceId ? parseInt(invoiceId) : null,
      amount: parseFloat(amount),
      paymentMethod,
      paymentRef,
      status: 'COMPLETED',
      notes: notes || '',
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedPayments = [...existingPayments, newPayment]
    savePersistentPayments(updatedPayments)

    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, amount, paymentMethod, status, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Get existing payments from persistent storage
    const existingPayments = getPersistentPayments()
    
    // Find the payment to update
    const paymentIndex = existingPayments.findIndex(payment => payment.id === id)
    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment
    const updatedPayment = {
      ...existingPayments[paymentIndex],
      amount: amount !== undefined ? parseFloat(amount) : existingPayments[paymentIndex].amount,
      paymentMethod: paymentMethod || existingPayments[paymentIndex].paymentMethod,
      status: status || existingPayments[paymentIndex].status,
      notes: notes !== undefined ? notes : existingPayments[paymentIndex].notes,
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    const updatedPayments = [...existingPayments]
    updatedPayments[paymentIndex] = updatedPayment
    savePersistentPayments(updatedPayments)

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Get existing payments from persistent storage
    const existingPayments = getPersistentPayments()
    
    // Find the payment to delete
    const paymentIndex = existingPayments.findIndex(payment => payment.id === id)
    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Remove payment from persistent storage
    const updatedPayments = existingPayments.filter(payment => payment.id !== id)
    savePersistentPayments(updatedPayments)

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
