import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/bills - List all bills with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const branchId = searchParams.get('branchId');
    const vendorId = searchParams.get('vendorId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) where.status = status;
    if (branchId) where.branchId = parseInt(branchId);
    if (vendorId) where.vendorId = parseInt(vendorId);
    if (dateFrom || dateTo) {
      where.issueDate = {};
      if (dateFrom) where.issueDate.gte = new Date(dateFrom);
      if (dateTo) where.issueDate.lte = new Date(dateTo);
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          vendor: true,
          branch: true,
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bill.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      bills,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/bills - Create new bill
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vendorId,
      branchId,
      issueDate,
      dueDate,
      items,
      taxRate = 0,
      notes,
    } = body;

    // Validate required fields
    if (!vendorId || !branchId || !issueDate || !dueDate || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Generate bill number
    const billCount = await prisma.bill.count();
    const billNumber = `BILL-${String(billCount + 1).padStart(6, '0')}`;

    // Create bill with items
    const bill = await prisma.bill.create({
      data: {
        billNumber,
        vendorId: parseInt(vendorId),
        branchId: parseInt(branchId),
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            amount: parseFloat(item.quantity) * parseFloat(item.unitPrice),
          })),
        },
      },
      include: {
        vendor: true,
        branch: true,
        items: true,
      },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
