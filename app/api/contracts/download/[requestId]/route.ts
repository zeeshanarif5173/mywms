import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestId = params.requestId

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Check if the contract request exists
    // 2. Verify the user has access to this contract
    // 3. Get the file from storage
    // 4. Return the file as a download
    
    // Mock contract request data
    const mockContractRequest = {
      id: requestId,
      customerId: session.user.id,
      status: 'Completed',
      requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      contractFileName: 'contract_2024_001.pdf',
      contractFileUrl: '/uploads/contracts/contract_2024_001.pdf',
      uploadedBy: 'manager@example.com'
    }

    // Check if user can access this contract
    if (session.user.role === 'CUSTOMER' && session.user.id !== mockContractRequest.customerId) {
      return NextResponse.json(
        { error: 'You can only download your own contracts' },
        { status: 403 }
      )
    }

    // Check if contract is available for download
    if (mockContractRequest.status !== 'Completed' || !mockContractRequest.contractFileUrl) {
      return NextResponse.json(
        { error: 'Contract is not available for download' },
        { status: 404 }
      )
    }

    // In a real application, you would:
    // 1. Get the file from cloud storage
    // 2. Return the file with proper headers
    // For demo purposes, we'll return a mock response with download URL
    
    return NextResponse.json({
      downloadUrl: mockContractRequest.contractFileUrl,
      fileName: mockContractRequest.contractFileName,
      uploadedAt: mockContractRequest.uploadedAt
    }, { status: 200 })
  } catch (error) {
    console.error('Error downloading contract:', error)
    return NextResponse.json(
      { error: 'Failed to download contract' },
      { status: 500 }
    )
  }
}
