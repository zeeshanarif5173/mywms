import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { gatePassId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gatePassId = params.gatePassId

    if (!gatePassId) {
      return NextResponse.json(
        { error: 'Gate Pass ID is required' },
        { status: 400 }
      )
    }

    // Look up customer by gatePassId
    const customer = await prisma.customer.findUnique({
      where: { gatePassId },
      include: {
        package: true
      }
    })

    // Check if gate pass is valid
    if (!customer) {
      return NextResponse.json(
        { 
          valid: false,
          status: 'INVALID',
          message: 'Gate Pass ID not found'
        },
        { status: 404 }
      )
    }

    // Check account status
    if (customer.accountStatus === 'Locked') {
      return NextResponse.json({
        valid: false,
        status: 'LOCKED',
        message: 'Account is locked. Gate pass access denied.',
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          gatePassId: customer.gatePassId,
          accountStatus: customer.accountStatus,
          company: customer.company,
          package: customer.package
        }
      }, { status: 200 })
    }

    // Gate pass is valid and account is active
    return NextResponse.json({
      valid: true,
      status: 'ACTIVE',
      message: 'Gate pass access granted',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        gatePassId: customer.gatePassId,
        accountStatus: customer.accountStatus,
        company: customer.company,
        package: customer.package
      },
      accessTime: new Date().toISOString()
    }, { status: 200 })

  } catch (error) {
    console.error('Error validating gate pass:', error)
    return NextResponse.json(
      { error: 'Failed to validate gate pass' },
      { status: 500 }
    )
  }
}
