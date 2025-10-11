import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/cash-flow - Get cash flow data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const category = searchParams.get('category');

    const where: any = {};
    
    if (branchId) where.branchId = parseInt(branchId);
    if (category) where.category = category;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const cashFlow = await prisma.cashFlow.findMany({
      where,
      include: {
        branch: true,
      },
      orderBy: { date: 'desc' },
    });

    // Calculate summary
    const summary = cashFlow.reduce((acc, entry) => {
      acc.totalCashIn += entry.cashIn;
      acc.totalCashOut += entry.cashOut;
      acc.netCashFlow += entry.cashIn - entry.cashOut;
      return acc;
    }, { totalCashIn: 0, totalCashOut: 0, netCashFlow: 0 });

    return NextResponse.json({
      cashFlow,
      summary,
    });
  } catch (error) {
    console.error('Error fetching cash flow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/cash-flow - Record cash flow entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      branchId,
      date,
      cashIn = 0,
      cashOut = 0,
      description,
      category,
    } = body;

    // Validate required fields
    if (!branchId || !date || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (cashIn < 0 || cashOut < 0) {
      return NextResponse.json({ error: 'Cash amounts cannot be negative' }, { status: 400 });
    }

    const balance = cashIn - cashOut;

    const cashFlowEntry = await prisma.cashFlow.create({
      data: {
        branchId: parseInt(branchId),
        date: new Date(date),
        cashIn,
        cashOut,
        balance,
        description,
        category,
      },
      include: {
        branch: true,
      },
    });

    return NextResponse.json(cashFlowEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating cash flow entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
