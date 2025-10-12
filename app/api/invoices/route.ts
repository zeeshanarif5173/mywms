import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        branch: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      customerId, 
      branchId, 
      invoiceNumber, 
      issueDate, 
      dueDate, 
      subtotal, 
      taxRate, 
      taxAmount, 
      total, 
      status, 
      notes 
    } = body

    // Validate required fields
    if (!customerId || !branchId || !invoiceNumber || !subtotal || !total) {
      return NextResponse.json({ 
        error: 'Customer ID, Branch ID, Invoice Number, Subtotal, and Total are required' 
      }, { status: 400 })
    }

    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } })
    if (!customerExists) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
    }

    // Check if branch exists
    const branchExists = await prisma.branch.findUnique({ where: { id: parseInt(branchId) } })
    if (!branchExists) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 400 })
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        customerId: parseInt(customerId),
        branchId: parseInt(branchId),
        invoiceNumber,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: parseFloat(subtotal),
        taxRate: parseFloat(taxRate) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        total: parseFloat(total),
        status: status || 'DRAFT',
        notes: notes || ''
      },
      include: {
        customer: true,
        branch: true
      }
    })

    return NextResponse.json({
      id: invoice.id,
      customerId: invoice.customerId,
      branchId: invoice.branchId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      paidAt: invoice.paidAt,
      customer: invoice.customer,
      branch: invoice.branch
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
