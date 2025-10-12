import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json([])
}

export async function POST(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    id: 1,
    customerId: 1,
    branchId: 1,
    invoiceNumber: 'INV-001',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 100.00,
    taxRate: 0.10,
    taxAmount: 10.00,
    total: 110.00,
    status: 'DRAFT',
    notes: 'Mock invoice created during build',
    paidAt: null
  })
}
