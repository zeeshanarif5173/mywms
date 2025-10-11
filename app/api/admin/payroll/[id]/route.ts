import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/payroll/[id] - Get specific payroll record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        employee: true,
        branch: true,
        items: true,
      },
    });

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/payroll/[id] - Update payroll record
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
    const { status, baseSalary, overtime, bonus, items } = body;

    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: parseInt(params.id) },
      include: { items: true },
    });

    if (!existingPayroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    let updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (baseSalary !== undefined) updateData.baseSalary = parseFloat(baseSalary);
    if (overtime !== undefined) updateData.overtime = parseFloat(overtime);
    if (bonus !== undefined) updateData.bonus = parseFloat(bonus);

    // Recalculate if salary components changed
    if (baseSalary !== undefined || overtime !== undefined || bonus !== undefined || items) {
      const newBaseSalary = baseSalary !== undefined ? parseFloat(baseSalary) : existingPayroll.baseSalary;
      const newOvertime = overtime !== undefined ? parseFloat(overtime) : existingPayroll.overtime;
      const newBonus = bonus !== undefined ? parseFloat(bonus) : existingPayroll.bonus;
      
      const deductions = items 
        ? items.filter((item: any) => item.isDeduction).reduce((sum: number, item: any) => sum + parseFloat(item.amount), 0)
        : existingPayroll.deductions;
      
      updateData.deductions = deductions;
      updateData.netPay = newBaseSalary + newOvertime + newBonus - deductions;
    }

    const payroll = await prisma.payroll.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        employee: true,
        branch: true,
        items: true,
      },
    });

    // Update items if provided
    if (items) {
      // Delete existing items
      await prisma.payrollItem.deleteMany({
        where: { payrollId: parseInt(params.id) },
      });

      // Create new items
      await prisma.payrollItem.createMany({
        data: items.map((item: any) => ({
          payrollId: parseInt(params.id),
          type: item.type,
          description: item.description,
          amount: parseFloat(item.amount),
          isDeduction: item.isDeduction || false,
        })),
      });

      // Fetch updated payroll with items
      const updatedPayroll = await prisma.payroll.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          employee: true,
          branch: true,
          items: true,
        },
      });

      return NextResponse.json(updatedPayroll);
    }

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error updating payroll:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/payroll/[id]/pay - Process payroll payment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    if (payroll.status === 'PAID') {
      return NextResponse.json({ error: 'Payroll already paid' }, { status: 400 });
    }

    // Update payroll status to paid
    const updatedPayroll = await prisma.payroll.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        employee: true,
        branch: true,
        items: true,
      },
    });

    // Create transaction record for accounting
    const expenseAccount = await prisma.accountChart.findFirst({
      where: {
        branchId: payroll.branchId,
        type: 'EXPENSE',
        category: 'Payroll',
        name: { contains: 'Salary' },
      },
    });

    if (expenseAccount) {
      await prisma.transaction.create({
        data: {
          transactionNumber: `PAYROLL-${Date.now()}`,
          branchId: payroll.branchId,
          accountId: expenseAccount.id,
          type: 'DEBIT',
          amount: payroll.netPay,
          description: `Payroll payment for ${updatedPayroll.employee.name}`,
          category: 'PAYROLL',
          reference: `PAYROLL-${payroll.id}`,
          date: new Date(),
          createdBy: session.user?.id,
        },
      });

      // Update account balance
      await prisma.accountChart.update({
        where: { id: expenseAccount.id },
        data: { balance: { increment: payroll.netPay } },
      });
    }

    return NextResponse.json(updatedPayroll);
  } catch (error) {
    console.error('Error processing payroll payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
