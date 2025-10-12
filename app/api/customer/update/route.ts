import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function PUT(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    id: 1,
    name: 'Updated Mock Customer',
    email: 'mock@example.com',
    phone: '123-456-7890',
    company: 'Updated Mock Company',
    accountStatus: 'Active',
    branchId: 1,
    branch: {
      id: 1,
      name: 'Mock Branch'
    },
    updatedAt: new Date().toISOString()
  })
}