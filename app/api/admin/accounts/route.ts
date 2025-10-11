import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/accounts - List chart of accounts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    const where: any = { isActive: true };
    
    if (branchId) where.branchId = parseInt(branchId);
    if (type) where.type = type;
    if (category) where.category = category;

    const accounts = await prisma.accountChart.findMany({
      where,
      include: {
        branch: true,
        parent: true,
        children: true,
      },
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/accounts - Create new account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      name,
      type,
      category,
      parentId,
      branchId,
    } = body;

    // Validate required fields
    if (!code || !name || !type || !branchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if account code already exists
    const existingAccount = await prisma.accountChart.findUnique({
      where: { code },
    });

    if (existingAccount) {
      return NextResponse.json({ error: 'Account code already exists' }, { status: 400 });
    }

    const account = await prisma.accountChart.create({
      data: {
        code,
        name,
        type,
        category,
        parentId: parentId ? parseInt(parentId) : null,
        branchId: parseInt(branchId),
      },
      include: {
        branch: true,
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
