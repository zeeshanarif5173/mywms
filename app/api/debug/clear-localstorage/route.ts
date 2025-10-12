import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // This endpoint is just for documentation - actual localStorage clearing
    // needs to be done on the client side
    return NextResponse.json({
      success: true,
      message: 'To clear localStorage, run this in browser console: localStorage.removeItem("coworking_portal_additional_users")',
      instructions: [
        '1. Open browser developer tools (F12)',
        '2. Go to Console tab',
        '3. Run: localStorage.removeItem("coworking_portal_additional_users")',
        '4. Refresh the admin users page'
      ]
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to provide instructions' },
      { status: 500 }
    )
  }
}
