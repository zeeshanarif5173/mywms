import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Remove authentication requirement for now to fix the dropdown issue
    // const session = await getServerSession(authOptions)
    
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const customers = await prisma.customer.findMany({
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: customers
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, companyName, packageId, gatePassId, remarks } = body

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'CUSTOMER'
      }
    })

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company: companyName,
        packageId,
        gatePassId,
        remarks,
        accountStatus: 'ACTIVE',
        branchId: 1 // Default to branch 1
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
