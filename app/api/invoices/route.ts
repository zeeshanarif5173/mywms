import { NextRequest, NextResponse } from 'next/server'
import { getPersistentInvoices, savePersistentInvoices } from '@/lib/persistent-invoices'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const invoices = getPersistentInvoices()
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, branchId, subtotal, taxRate, notes, dueDate } = body

    // Validate required fields
    if (!customerId || !branchId || !subtotal) {
      return NextResponse.json({ error: 'Customer ID, branch ID, and subtotal are required' }, { status: 400 })
    }

    // Get existing invoices from persistent storage
    const existingInvoices = getPersistentInvoices()
    
    // Generate invoice number
    const invoiceNumber = `INV-${String(existingInvoices.length + 1).padStart(3, '0')}`
    
    // Calculate tax and total
    const taxAmount = subtotal * (taxRate || 0.1)
    const total = subtotal + taxAmount

    // Create new invoice
    const newInvoice = {
      id: `invoice-${Date.now()}`,
      customerId: parseInt(customerId),
      branchId: parseInt(branchId),
      invoiceNumber,
      issueDate: new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subtotal: parseFloat(subtotal),
      taxRate: taxRate || 0.1,
      taxAmount,
      total,
      status: 'DRAFT',
      notes: notes || '',
      paidAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedInvoices = [...existingInvoices, newInvoice]
    savePersistentInvoices(updatedInvoices)

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, customerId, branchId, subtotal, taxRate, notes, dueDate, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Get existing invoices from persistent storage
    const existingInvoices = getPersistentInvoices()
    
    // Find the invoice to update
    const invoiceIndex = existingInvoices.findIndex(invoice => invoice.id === id)
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Calculate new totals if subtotal or tax rate changed
    let newSubtotal = subtotal !== undefined ? parseFloat(subtotal) : existingInvoices[invoiceIndex].subtotal
    let newTaxRate = taxRate !== undefined ? taxRate : existingInvoices[invoiceIndex].taxRate
    let newTaxAmount = newSubtotal * newTaxRate
    let newTotal = newSubtotal + newTaxAmount

    // Update invoice
    const updatedInvoice = {
      ...existingInvoices[invoiceIndex],
      customerId: customerId !== undefined ? parseInt(customerId) : existingInvoices[invoiceIndex].customerId,
      branchId: branchId !== undefined ? parseInt(branchId) : existingInvoices[invoiceIndex].branchId,
      subtotal: newSubtotal,
      taxRate: newTaxRate,
      taxAmount: newTaxAmount,
      total: newTotal,
      notes: notes !== undefined ? notes : existingInvoices[invoiceIndex].notes,
      dueDate: dueDate !== undefined ? dueDate : existingInvoices[invoiceIndex].dueDate,
      status: status || existingInvoices[invoiceIndex].status,
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    const updatedInvoices = [...existingInvoices]
    updatedInvoices[invoiceIndex] = updatedInvoice
    savePersistentInvoices(updatedInvoices)

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Get existing invoices from persistent storage
    const existingInvoices = getPersistentInvoices()
    
    // Find the invoice to delete
    const invoiceIndex = existingInvoices.findIndex(invoice => invoice.id === id)
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Remove invoice from persistent storage
    const updatedInvoices = existingInvoices.filter(invoice => invoice.id !== id)
    savePersistentInvoices(updatedInvoices)

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}