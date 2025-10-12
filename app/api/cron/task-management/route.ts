import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Task management cron job completed (mock)',
    overdueTasks: 0,
    appliedFines: 0,
    newRecurringTasks: 0
  })
}