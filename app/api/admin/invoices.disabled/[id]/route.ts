import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/invoices/[id] - Get specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        customer: true,
        branch: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/invoices/[id] - Update invoice
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

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(params.id) },
      include: { items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    // If items are provided, recalculate totals
    if (items) {
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * ((taxRate || existingInvoice.taxRate) / 100);
      const total = subtotal + taxAmount;
      
      updateData.subtotal = subtotal;
      updateData.taxRate = taxRate || existingInvoice.taxRate;
      updateData.taxAmount = taxAmount;
      updateData.total = total;
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        customer: true,
        branch: true,
        items: true,
        payments: true,
      },
    });

    // Update items if provided
    if (items) {
      // Delete existing items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: parseInt(params.id) },
      });

      // Create new items
      await prisma.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: parseInt(params.id),
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          amount: parseFloat(item.quantity) * parseFloat(item.unitPrice),
        })),
      });

      // Fetch updated invoice with items
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          customer: true,
          branch: true,
          items: true,
          payments: true,
        },
      });

      return NextResponse.json(updatedInvoice);
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if invoice has payments
    const payments = await prisma.invoicePayment.count({
      where: { invoiceId: parseInt(params.id) },
    });

    if (payments > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete invoice with payments. Mark as cancelled instead.' 
      }, { status: 400 });
    }

    // Delete invoice items first
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: parseInt(params.id) },
    });

    // Delete invoice
    await prisma.invoice.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
