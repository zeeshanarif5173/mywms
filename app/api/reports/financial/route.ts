import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/reports/financial - Generate financial reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') // 'income_statement', 'balance_sheet', 'cash_flow', 'profit_loss'
    const branchId = searchParams.get('branchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'Report type is required' },
        { status: 400 }
      )
    }

    const where: any = {}
    if (branchId) where.branchId = parseInt(branchId)
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    let reportData: any = {}

    switch (reportType) {
      case 'income_statement':
        reportData = await generateIncomeStatement(where, startDate || undefined, endDate || undefined)
        break
      case 'balance_sheet':
        reportData = await generateBalanceSheet(where)
        break
      case 'cash_flow':
        reportData = await generateCashFlowStatement(where, startDate || undefined, endDate || undefined)
        break
      case 'profit_loss':
        reportData = await generateProfitLossStatement(where, startDate || undefined, endDate || undefined)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      filters: {
        branchId,
        startDate,
        endDate,
        reportType
      }
    })
  } catch (error) {
    console.error('Error generating financial report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate financial report' },
      { status: 500 }
    )
  }
}

async function generateIncomeStatement(where: any, startDate?: string, endDate?: string) {
  // Revenue accounts
  const revenueAccounts = await prisma.accountChart.findMany({
    where: { ...where, type: 'REVENUE', isActive: true },
    include: {
      transactions: {
        where: {
          ...(startDate && endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          })
        }
      }
    }
  })

  // Expense accounts
  const expenseAccounts = await prisma.accountChart.findMany({
    where: { ...where, type: 'EXPENSE', isActive: true },
    include: {
      transactions: {
        where: {
          ...(startDate && endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          })
        }
      }
    }
  })

  // Calculate totals
  const totalRevenue = revenueAccounts.reduce((sum, account) => {
    const revenue = account.transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((accSum, t) => accSum + t.amount, 0)
    return sum + revenue
  }, 0)

  const totalExpenses = expenseAccounts.reduce((sum, account) => {
    const expense = account.transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((accSum, t) => accSum + t.amount, 0)
    return sum + expense
  }, 0)

  const netIncome = totalRevenue - totalExpenses

  return {
    reportType: 'Income Statement',
    period: { startDate, endDate },
    revenue: {
      accounts: revenueAccounts.map(account => ({
        code: account.code,
        name: account.name,
        amount: account.transactions
          .filter(t => t.type === 'CREDIT')
          .reduce((sum, t) => sum + t.amount, 0)
      })),
      total: totalRevenue
    },
    expenses: {
      accounts: expenseAccounts.map(account => ({
        code: account.code,
        name: account.name,
        amount: account.transactions
          .filter(t => t.type === 'DEBIT')
          .reduce((sum, t) => sum + t.amount, 0)
      })),
      total: totalExpenses
    },
    netIncome
  }
}

async function generateBalanceSheet(where: any) {
  // Asset accounts
  const assetAccounts = await prisma.accountChart.findMany({
    where: { ...where, type: 'ASSET', isActive: true }
  })

  // Liability accounts
  const liabilityAccounts = await prisma.accountChart.findMany({
    where: { ...where, type: 'LIABILITY', isActive: true }
  })

  // Equity accounts
  const equityAccounts = await prisma.accountChart.findMany({
    where: { ...where, type: 'EQUITY', isActive: true }
  })

  const totalAssets = assetAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + account.balance, 0)
  const totalEquity = equityAccounts.reduce((sum, account) => sum + account.balance, 0)

  return {
    reportType: 'Balance Sheet',
    assets: {
      accounts: assetAccounts.map(account => ({
        code: account.code,
        name: account.name,
        balance: account.balance
      })),
      total: totalAssets
    },
    liabilities: {
      accounts: liabilityAccounts.map(account => ({
        code: account.code,
        name: account.name,
        balance: account.balance
      })),
      total: totalLiabilities
    },
    equity: {
      accounts: equityAccounts.map(account => ({
        code: account.code,
        name: account.name,
        balance: account.balance
      })),
      total: totalEquity
    },
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity
  }
}

async function generateCashFlowStatement(where: any, startDate?: string, endDate?: string) {
  const cashFlowRecords = await prisma.cashFlow.findMany({
    where: {
      ...where,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    },
    orderBy: { date: 'asc' }
  })

  const totalCashIn = cashFlowRecords.reduce((sum, record) => sum + record.cashIn, 0)
  const totalCashOut = cashFlowRecords.reduce((sum, record) => sum + record.cashOut, 0)
  const netCashFlow = totalCashIn - totalCashOut

  // Group by category
  const cashFlowByCategory = cashFlowRecords.reduce((acc, record) => {
    if (!acc[record.category]) {
      acc[record.category] = { cashIn: 0, cashOut: 0, records: [] }
    }
    acc[record.category].cashIn += record.cashIn
    acc[record.category].cashOut += record.cashOut
    acc[record.category].records.push(record)
    return acc
  }, {} as any)

  return {
    reportType: 'Cash Flow Statement',
    period: { startDate, endDate },
    summary: {
      totalCashIn,
      totalCashOut,
      netCashFlow
    },
    byCategory: cashFlowByCategory,
    records: cashFlowRecords
  }
}

async function generateProfitLossStatement(where: any, startDate?: string, endDate?: string) {
  // Get invoices (revenue)
  const invoices = await prisma.invoice.findMany({
    where: {
      ...where,
      ...(startDate && endDate && {
        issueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      status: { in: ['PAID', 'PARTIAL'] }
    },
    include: {
      payments: true
    }
  })

  // Get bills (expenses)
  const bills = await prisma.bill.findMany({
    where: {
      ...where,
      ...(startDate && endDate && {
        issueDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      status: { in: ['PAID', 'PARTIAL'] }
    },
    include: {
      payments: true
    }
  })

  // Get payroll expenses
  const payroll = await prisma.payroll.findMany({
    where: {
      ...where,
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      status: 'PAID'
    }
  })

  const totalRevenue = invoices.reduce((sum, invoice) => {
    const paidAmount = invoice.payments.reduce((paySum, payment) => paySum + payment.amount, 0)
    return sum + paidAmount
  }, 0)

  const totalBillsExpense = bills.reduce((sum, bill) => {
    const paidAmount = bill.payments.reduce((paySum, payment) => paySum + payment.amount, 0)
    return sum + paidAmount
  }, 0)

  const totalPayrollExpense = payroll.reduce((sum, record) => sum + record.netPay, 0)

  const totalExpenses = totalBillsExpense + totalPayrollExpense
  const grossProfit = totalRevenue - totalBillsExpense
  const netProfit = totalRevenue - totalExpenses

  return {
    reportType: 'Profit & Loss Statement',
    period: { startDate, endDate },
    revenue: {
      invoices: invoices.length,
      totalAmount: totalRevenue
    },
    expenses: {
      bills: {
        count: bills.length,
        amount: totalBillsExpense
      },
      payroll: {
        count: payroll.length,
        amount: totalPayrollExpense
      },
      total: totalExpenses
    },
    profit: {
      grossProfit,
      netProfit,
      margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    }
  }
}
