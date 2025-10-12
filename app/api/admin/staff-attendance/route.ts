import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Return mock data immediately during build - no imports or database calls
  return NextResponse.json({
    staffAttendanceData: [],
    totalStaff: 0,
    presentToday: 0,
    absentToday: 0,
    averageHours: 0
  })
}