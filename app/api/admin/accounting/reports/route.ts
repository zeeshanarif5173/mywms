import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/accounting/reports - Get comprehensive accounting reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'MANAGER'].includes(session.user?.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('reportType') || 'dashboard';
    const branchId = searchParams.get('branchId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly, yearly

    const where: any = {};
    if (branchId) where.branchId = parseInt(branchId);
    
    let dateFilter: any = {};
    if (dateFrom || dateTo) {
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
    }

    switch (reportType) {
      case 'dashboard':
        return await getDashboardReport(where, dateFilter);
      
      case 'income-statement':
        return await getIncomeStatement(where, dateFilter);
      
      case 'balance-sheet':
        return await getBalanceSheet(where);
      
      case 'cash-flow':
        return await getCashFlowReport(where, dateFilter);
      
      case 'accounts-receivable':
        return await getAccountsReceivable(where, dateFilter);
      
      case 'accounts-payable':
        return await getAccountsPayable(where, dateFilter);
      
      case 'payroll-summary':
        return await getPayrollSummary(where, dateFilter);
      
      case 'branch-performance':
        return await getBranchPerformance(dateFilter, period);
      
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getDashboardReport(where: any, dateFilter: any) {
  const [
    totalRevenue,
    totalExpenses,
    totalInvoices,
    paidInvoices,
    overdueInvoices,
    totalBills,
    paidBills,
    overdueBills,
    totalPayroll,
    recentTransactions,
    topCustomers,
  ] = await Promise.all([
    // Total Revenue
    prisma.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { total: true },
    }),

    // Total Expenses
    prisma.bill.aggregate({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { total: true },
    }),

    // Invoice counts
    prisma.invoice.count({
      where: {
        ...where,
        ...(Object.keys(dateFilter).length > 0 && { issueDate: dateFilter }),
      },
    }),

    prisma.invoice.count({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
    }),

    prisma.invoice.count({
      where: {
        ...where,
        status: 'OVERDUE',
      },
    }),

    // Bill counts
    prisma.bill.count({
      where: {
        ...where,
        ...(Object.keys(dateFilter).length > 0 && { issueDate: dateFilter }),
      },
    }),

    prisma.bill.count({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
    }),

    prisma.bill.count({
      where: {
        ...where,
        status: 'OVERDUE',
      },
    }),

    // Payroll total
    prisma.payroll.aggregate({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { netPay: true },
    }),

    // Recent transactions
    prisma.transaction.findMany({
      where: {
        ...where,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        account: true,
        branch: true,
      },
      orderBy: { date: 'desc' },
      take: 10,
    }),

    // Top customers by revenue
    prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
  ]);

  // Get customer details for top customers
  const topCustomerIds = topCustomers.map(c => c.customerId);
  const customerDetails = await prisma.customer.findMany({
    where: { id: { in: topCustomerIds } },
    select: { id: true, name: true, email: true },
  });

  const topCustomersWithDetails = topCustomers.map(customer => {
    const details = customerDetails.find(d => d.id === customer.customerId);
    return {
      ...customer,
      customer: details,
    };
  });

  return NextResponse.json({
    summary: {
      totalRevenue: totalRevenue._sum.total || 0,
      totalExpenses: totalExpenses._sum.total || 0,
      netIncome: (totalRevenue._sum.total || 0) - (totalExpenses._sum.total || 0),
      totalPayroll: totalPayroll._sum.netPay || 0,
    },
    invoices: {
      total: totalInvoices,
      paid: paidInvoices,
      overdue: overdueInvoices,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0,
    },
    bills: {
      total: totalBills,
      paid: paidBills,
      overdue: overdueBills,
      paymentRate: totalBills > 0 ? (paidBills / totalBills) * 100 : 0,
    },
    recentTransactions,
    topCustomers: topCustomersWithDetails,
  });
}

async function getIncomeStatement(where: any, dateFilter: any) {
  const [
    revenue,
    expenses,
    payroll,
  ] = await Promise.all([
    // Revenue from invoices
    prisma.invoice.aggregate({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { total: true },
    }),

    // Expenses from bills
    prisma.bill.aggregate({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { total: true },
    }),

    // Payroll expenses
    prisma.payroll.aggregate({
      where: {
        ...where,
        status: 'PAID',
        ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
      },
      _sum: { netPay: true },
    }),
  ]);

  const grossRevenue = revenue._sum.total || 0;
  const totalExpenses = (expenses._sum.total || 0) + (payroll._sum.netPay || 0);
  const netIncome = grossRevenue - totalExpenses;

  return NextResponse.json({
    revenue: {
      grossRevenue,
      taxCollected: 0, // Calculate from invoices if needed
      netRevenue: grossRevenue,
    },
    expenses: {
      operational: expenses._sum.total || 0,
      payroll: payroll._sum.netPay || 0,
      total: totalExpenses,
    },
    netIncome,
    margin: grossRevenue > 0 ? (netIncome / grossRevenue) * 100 : 0,
  });
}

async function getBalanceSheet(where: any) {
  const accounts = await prisma.accountChart.findMany({
    where: {
      ...where,
      isActive: true,
    },
    orderBy: [{ type: 'asc' }, { code: 'asc' }],
  });

  const balanceSheet = {
    assets: accounts.filter(a => a.type === 'ASSET'),
    liabilities: accounts.filter(a => a.type === 'LIABILITY'),
    equity: accounts.filter(a => a.type === 'EQUITY'),
  };

  const totalAssets = balanceSheet.assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = balanceSheet.equity.reduce((sum, a) => sum + a.balance, 0);

  return NextResponse.json({
    ...balanceSheet,
    totals: {
      totalAssets,
      totalLiabilities,
      totalEquity,
      balanceCheck: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    },
  });
}

async function getCashFlowReport(where: any, dateFilter: any) {
  const cashFlow = await prisma.cashFlow.findMany({
    where: {
      ...where,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
    include: {
      branch: true,
    },
    orderBy: { date: 'desc' },
  });

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
}

async function getAccountsReceivable(where: any, dateFilter: any) {
  const invoices = await prisma.invoice.findMany({
    where: {
      ...where,
      status: { in: ['SENT', 'OVERDUE'] },
      ...(Object.keys(dateFilter).length > 0 && { issueDate: dateFilter }),
    },
    include: {
      customer: true,
      branch: true,
      payments: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const totalReceivable = invoices.reduce((sum, invoice) => {
    const paidAmount = invoice.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
    return sum + (invoice.total - paidAmount);
  }, 0);

  return NextResponse.json({
    invoices,
    totalReceivable,
    count: invoices.length,
  });
}

async function getAccountsPayable(where: any, dateFilter: any) {
  const bills = await prisma.bill.findMany({
    where: {
      ...where,
      status: { in: ['PENDING', 'OVERDUE'] },
      ...(Object.keys(dateFilter).length > 0 && { issueDate: dateFilter }),
    },
    include: {
      vendor: true,
      branch: true,
      payments: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  const totalPayable = bills.reduce((sum, bill) => {
    const paidAmount = bill.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
    return sum + (bill.total - paidAmount);
  }, 0);

  return NextResponse.json({
    bills,
    totalPayable,
    count: bills.length,
  });
}

async function getPayrollSummary(where: any, dateFilter: any) {
  const payroll = await prisma.payroll.findMany({
    where: {
      ...where,
      ...(Object.keys(dateFilter).length > 0 && { payPeriod: dateFilter }),
    },
    include: {
      employee: true,
      branch: true,
      items: true,
    },
    orderBy: { payPeriod: 'desc' },
  });

  const summary = payroll.reduce((acc, record) => {
    acc.totalBaseSalary += record.baseSalary;
    acc.totalOvertime += record.overtime;
    acc.totalBonus += record.bonus;
    acc.totalDeductions += record.deductions;
    acc.totalNetPay += record.netPay;
    return acc;
  }, {
    totalBaseSalary: 0,
    totalOvertime: 0,
    totalBonus: 0,
    totalDeductions: 0,
    totalNetPay: 0,
  });

  return NextResponse.json({
    payroll,
    summary,
    count: payroll.length,
  });
}

async function getBranchPerformance(dateFilter: any, period: string) {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
  });

  const branchPerformance = await Promise.all(
    branches.map(async (branch) => {
      const [
        revenue,
        expenses,
        payroll,
        customerCount,
      ] = await Promise.all([
        prisma.invoice.aggregate({
          where: {
            branchId: branch.id,
            status: 'PAID',
            ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
          },
          _sum: { total: true },
        }),
        prisma.bill.aggregate({
          where: {
            branchId: branch.id,
            status: 'PAID',
            ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
          },
          _sum: { total: true },
        }),
        prisma.payroll.aggregate({
          where: {
            branchId: branch.id,
            status: 'PAID',
            ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
          },
          _sum: { netPay: true },
        }),
        prisma.customer.count({
          where: {
            branchId: branch.id,
            accountStatus: 'Active',
          },
        }),
      ]);

      const totalRevenue = revenue._sum.total || 0;
      const totalExpenses = (expenses._sum.total || 0) + (payroll._sum.netPay || 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        branch,
        metrics: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          payroll: payroll._sum.netPay || 0,
          netIncome,
          customerCount,
          profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
        },
      };
    })
  );

  return NextResponse.json({
    branchPerformance,
    summary: {
      totalRevenue: branchPerformance.reduce((sum, bp) => sum + bp.metrics.revenue, 0),
      totalExpenses: branchPerformance.reduce((sum, bp) => sum + bp.metrics.expenses, 0),
      totalNetIncome: branchPerformance.reduce((sum, bp) => sum + bp.metrics.netIncome, 0),
      totalCustomers: branchPerformance.reduce((sum, bp) => sum + bp.metrics.customerCount, 0),
    },
  });
}
