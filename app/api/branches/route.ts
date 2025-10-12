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
    name: 'Mock Branch',
    address: 'Mock Address',
    city: 'Mock City',
    state: 'Mock State',
    zipCode: '12345',
    phone: '123-456-7890',
    email: 'mock@branch.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
}

export async function PUT(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    id: 1,
    name: 'Updated Mock Branch',
    address: 'Updated Mock Address',
    city: 'Updated Mock City',
    state: 'Updated Mock State',
    zipCode: '54321',
    phone: '987-654-3210',
    email: 'updated@branch.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
}
