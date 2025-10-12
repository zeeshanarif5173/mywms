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
    name: 'Mock Package',
    price: 99.99,
    duration: 30,
    status: 'ACTIVE',
    startDate: null,
    expiryDate: null
  })
}