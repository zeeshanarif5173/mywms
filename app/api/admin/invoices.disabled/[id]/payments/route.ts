import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/invoices/[id]/payments - Record payment for invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method, reference } = body;

    if (!amount || !method) {
      return NextResponse.json({ error: 'Amount and method are required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(params.id) },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Calculate total paid amount
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = invoice.total - totalPaid;

    if (parseFloat(amount) > remainingAmount) {
      return NextResponse.json({ 
        error: `Payment amount exceeds remaining balance of $${remainingAmount.toFixed(2)}` 
      }, { status: 400 });
    }

    // Create payment record
    const payment = await prisma.invoicePayment.create({
      data: {
        invoiceId: parseInt(params.id),
        amount: parseFloat(amount),
        method,
        reference,
        paidAt: new Date(),
      },
    });

    // Update invoice status based on total paid
    const newTotalPaid = totalPaid + parseFloat(amount);
    let newStatus = invoice.status;
    
    if (newTotalPaid >= invoice.total) {
      newStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      newStatus = 'PARTIAL';
    }

    await prisma.invoice.update({
      where: { id: parseInt(params.id) },
      data: { 
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null,
      },
    });

    // Create transaction record for accounting
    const account = await prisma.accountChart.findFirst({
      where: {
        branchId: invoice.branchId,
        type: 'ASSET',
        category: 'Current Asset',
        name: { contains: 'Cash' },
      },
    });

    if (account) {
      await prisma.transaction.create({
        data: {
          transactionNumber: `PAY-${Date.now()}`,
          branchId: invoice.branchId,
          accountId: account.id,
          type: 'DEBIT',
          amount: parseFloat(amount),
          description: `Payment received for invoice ${invoice.invoiceNumber}`,
          category: 'PAYMENT_RECEIVED',
          reference: invoice.invoiceNumber,
          date: new Date(),
          createdBy: session.user?.id,
        },
      });

      // Update account balance
      await prisma.accountChart.update({
        where: { id: account.id },
        data: { balance: { increment: parseFloat(amount) } },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/invoices/[id]/payments - Get invoice payments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.invoicePayment.findMany({
      where: { invoiceId: parseInt(params.id) },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
