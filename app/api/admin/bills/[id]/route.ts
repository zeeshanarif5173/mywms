import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/bills/[id] - Get specific bill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        vendor: true,
        branch: true,
        items: true,
        payments: true,
      },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/bills/[id] - Update bill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, items, taxRate, notes } = body;

    const existingBill = await prisma.bill.findUnique({
      where: { id: parseInt(params.id) },
      include: { items: true },
    });

    if (!existingBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    let updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    // If items are provided, recalculate totals
    if (items) {
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * ((taxRate || existingBill.taxRate) / 100);
      const total = subtotal + taxAmount;
      
      updateData.subtotal = subtotal;
      updateData.taxRate = taxRate || existingBill.taxRate;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
    }

    const bill = await prisma.bill.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        vendor: true,
        branch: true,
        items: true,
        payments: true,
      },
    });

    // Update items if provided
    if (items) {
      // Delete existing items
      await prisma.billItem.deleteMany({
        where: { billId: parseInt(params.id) },
      });

      // Create new items
      await prisma.billItem.createMany({
        data: items.map((item: any) => ({
          billId: parseInt(params.id),
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.quantity) * parseFloat(item.unitPrice),
        })),
      });

      // Fetch updated bill with items
      const updatedBill = await prisma.bill.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          vendor: true,
          branch: true,
          items: true,
          payments: true,
        },
      });

      return NextResponse.json(updatedBill);
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/bills/[id] - Delete bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Check if bill has payments
    const payments = await prisma.billPayment.count({
      where: { billId: parseInt(params.id) },
    });

    if (payments > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete bill with payments. Mark as cancelled instead.' 
      }, { status: 400 });
    }

    // Delete bill items first
    await prisma.billItem.deleteMany({
      where: { billId: parseInt(params.id) },
    });

    // Delete bill
    await prisma.bill.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
