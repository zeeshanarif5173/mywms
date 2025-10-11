import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { sendNotificationEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can upload contracts
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only managers can upload contracts' }, { status: 403 })
    }

    const requestId = params.requestId

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('contract') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Contract file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Get the contract request
    const contractRequest = await prisma.contract.findUnique({
      where: { id: parseInt(requestId) },
      include: {
        customer: true
      }
    })

    if (!contractRequest) {
      return NextResponse.json(
        { error: 'Contract request not found' },
        { status: 404 }
      )
    }

    // Update contract in database
    const updatedContract = await prisma.contract.update({
      where: { id: parseInt(requestId) },
      data: {
        fileUrl: `/uploads/contracts/${file.name}`,
        status: 'Completed'
      },
      include: {
        customer: true
      }
    })

    // Send email notification
    try {
      await sendNotificationEmail(
        contractRequest.customer.email,
        contractRequest.customer.name,
        'contractReady',
        {
          contractFileName: file.name
        }
      )
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        customerId: contractRequest.customerId,
        type: 'ContractReady',
        title: 'Contract Ready for Download',
        message: `Your requested contract "${file.name}" is now ready for download.`,
        isRead: false
      }
    })

    return NextResponse.json(updatedContract, { status: 200 })
  } catch (error) {
    console.error('Error uploading contract:', error)
    return NextResponse.json(
      { error: 'Failed to upload contract' },
      { status: 500 }
    )
  }
}
