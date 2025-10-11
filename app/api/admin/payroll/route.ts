import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/payroll - List payroll records with filtering
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
    const employeeId = searchParams.get('employeeId');
    const payPeriod = searchParams.get('payPeriod');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (branchId) where.branchId = parseInt(branchId);
    if (employeeId) where.employeeId = employeeId;
    if (payPeriod) where.payPeriod = payPeriod;
    if (status) where.status = status;

    const [payroll, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          employee: true,
          branch: true,
          items: true,
        },
        orderBy: { payPeriod: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payroll.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      payroll,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/payroll - Create new payroll record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      employeeId,
      branchId,
      payPeriod,
      baseSalary,
      overtime = 0,
      bonus = 0,
      items = [],
    } = body;

    // Validate required fields
    if (!employeeId || !branchId || !payPeriod || !baseSalary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if payroll already exists for this employee and period
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        employeeId,
        payPeriod,
      },
    });

    if (existingPayroll) {
      return NextResponse.json({ 
        error: 'Payroll record already exists for this employee and period' 
      }, { status: 400 });
    }

    // Calculate deductions from items
    const deductions = items
      .filter((item: any) => item.isDeduction)
      .reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0);

    const netPay = parseFloat(baseSalary) + parseFloat(overtime) + parseFloat(bonus) - deductions;

    // Create payroll record
    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        branchId: parseInt(branchId),
        payPeriod,
        baseSalary: parseFloat(baseSalary),
        overtime: parseFloat(overtime),
        bonus: parseFloat(bonus),
        deductions,
        netPay,
        items: {
          create: items.map((item: any) => ({
            type: item.type,
            description: item.description,
            amount: parseFloat(item.amount),
            isDeduction: item.isDeduction || false,
          })),
        },
      },
      include: {
        employee: true,
        branch: true,
        items: true,
      },
    });

    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
