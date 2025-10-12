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
    title: 'Mock Task',
    description: 'Mock task description',
    status: 'Pending',
    createdAt: new Date().toISOString()
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    id: params.id,
    title: 'Updated Mock Task',
    description: 'Updated mock task description',
    status: 'In Progress',
    updatedAt: new Date().toISOString()
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    message: 'Task deleted successfully (mock)',
    id: params.id
  })
}