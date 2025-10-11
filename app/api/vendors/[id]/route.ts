import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vendors/[id] - Get specific vendor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = parseInt(params.id)

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true
          }
        },
        bills: {
          include: {
            items: true,
            payments: true,
            _count: {
              select: {
                items: true,
                payments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Calculate vendor statistics
    const totalBills = vendor.bills.length
    const totalBillsAmount = vendor.bills.reduce((sum, bill) => sum + bill.total, 0)
    const paidBills = vendor.bills.filter(bill => bill.status === 'PAID').length
    const pendingBills = vendor.bills.filter(bill => bill.status === 'PENDING').length

    const vendorWithStats = {
      ...vendor,
      stats: {
        totalBills,
        totalBillsAmount,
        paidBills,
        pendingBills,
        overdueBills: vendor.bills.filter(bill => 
          bill.status === 'OVERDUE' || 
          (bill.status === 'PENDING' && new Date(bill.dueDate) < new Date())
        ).length
      }
    }

    return NextResponse.json({
      success: true,
      data: vendorWithStats
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = parseInt(params.id)
    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      taxId,
      branchId,
      isActive
    } = body

    // Check if vendor exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { id: vendorId }
    })

    if (!existingVendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check if branch exists (if branchId is provided)
    if (branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: parseInt(branchId) }
      })

      if (!branch) {
        return NextResponse.json(
          { success: false, error: 'Branch not found' },
          { status: 404 }
        )
      }
    }

    // Update vendor
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(taxId !== undefined && { taxId }),
        ...(branchId && { branchId: parseInt(branchId) }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = parseInt(params.id)

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        _count: {
          select: {
            bills: true
          }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check if vendor has associated bills or invoices
    if (vendor._count.bills > 0) {
      // Soft delete - mark as inactive instead
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Vendor deactivated (has associated records)'
      })
    }

    // Hard delete if no associated records
    await prisma.vendor.delete({
      where: { id: vendorId }
    })

    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
