import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/transactions - List all transactions with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const branchId = searchParams.get('branchId');
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (branchId) where.branchId = parseInt(branchId);
    if (accountId) where.accountId = parseInt(accountId);
    if (type) where.type = type;
    if (category) where.category = category;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          branch: true,
          account: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      branchId,
      accountId,
      type,
      amount,
      description,
      category,
      reference,
      date,
    } = body;

    // Validate required fields
    if (!branchId || !accountId || !type || !amount || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate transaction number
    const transactionCount = await prisma.transaction.count();
    const transactionNumber = `TXN-${String(transactionCount + 1).padStart(6, '0')}`;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        transactionNumber,
        branchId: parseInt(branchId),
        accountId: parseInt(accountId),
        type,
        amount: parseFloat(amount),
        description,
        category,
        reference,
        date: date ? new Date(date) : new Date(),
        createdBy: session.user?.id,
      },
      include: {
        branch: true,
        account: true,
      },
    });

    // Update account balance
    const balanceChange = type === 'DEBIT' ? parseFloat(amount) : -parseFloat(amount);
    await prisma.accountChart.update({
      where: { id: parseInt(accountId) },
      data: { balance: { increment: balanceChange } },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
