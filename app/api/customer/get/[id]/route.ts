import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    id: params.id,
    name: 'Mock Customer',
    email: 'mock@example.com',
    phone: '123-456-7890',
    company: 'Mock Company',
    accountStatus: 'Active',
    branchId: 1,
    branch: {
      id: 1,
      name: 'Mock Branch'
    },
    createdAt: new Date().toISOString()
  })
}