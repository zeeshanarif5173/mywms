import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/branches - List all branches
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            customers: true,
            vendors: true,
            invoices: true,
            bills: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/branches - Create new branch
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
    } = body;

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
      },
    });

    // Create default chart of accounts for the branch
    await createDefaultAccounts(branch.id);

    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createDefaultAccounts(branchId: number) {
  const defaultAccounts = [
    // Assets
    { code: '1000', name: 'Cash', type: 'ASSET', category: 'Current Asset' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET', category: 'Current Asset' },
    { code: '1200', name: 'Inventory', type: 'ASSET', category: 'Current Asset' },
    { code: '1500', name: 'Equipment', type: 'ASSET', category: 'Fixed Asset' },
    { code: '1600', name: 'Furniture & Fixtures', type: 'ASSET', category: 'Fixed Asset' },
    
    // Liabilities
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY', category: 'Current Liability' },
    { code: '2100', name: 'Accrued Expenses', type: 'LIABILITY', category: 'Current Liability' },
    { code: '2200', name: 'Payroll Liabilities', type: 'LIABILITY', category: 'Current Liability' },
    
    // Equity
    { code: '3000', name: 'Owner Equity', type: 'EQUITY', category: 'Equity' },
    { code: '3100', name: 'Retained Earnings', type: 'EQUITY', category: 'Equity' },
    
    // Revenue
    { code: '4000', name: 'Service Revenue', type: 'REVENUE', category: 'Operating Revenue' },
    { code: '4100', name: 'Rental Revenue', type: 'REVENUE', category: 'Operating Revenue' },
    
    // Expenses
    { code: '5000', name: 'Salaries & Wages', type: 'EXPENSE', category: 'Payroll' },
    { code: '5100', name: 'Rent Expense', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5200', name: 'Utilities', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5300', name: 'Office Supplies', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5400', name: 'Marketing', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5500', name: 'Insurance', type: 'EXPENSE', category: 'Operating Expense' },
    { code: '5600', name: 'Depreciation', type: 'EXPENSE', category: 'Operating Expense' },
  ];

  await prisma.accountChart.createMany({
    data: defaultAccounts.map(account => ({
      ...account,
      branchId,
    })),
  });
}
