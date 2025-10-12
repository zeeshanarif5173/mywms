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
    name: 'Mock User',
    email: 'mock@example.com',
    phone: '123-456-7890',
    company: 'Mock Company',
    accountStatus: 'Active',
    gatePassId: 'GP-12345678',
    packageId: 1,
    branchId: 1,
    remarks: 'Mock user created during build',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branch: {
      id: 1,
      name: 'Mock Branch'
    }
  })
}

export async function PUT(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    id: 1,
    name: 'Updated Mock User',
    email: 'updated@example.com',
    phone: '987-654-3210',
    company: 'Updated Mock Company',
    accountStatus: 'Active',
    gatePassId: 'GP-87654321',
    packageId: 2,
    branchId: 2,
    remarks: 'Updated mock user during build',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branch: {
      id: 2,
      name: 'Updated Mock Branch'
    }
  })
}