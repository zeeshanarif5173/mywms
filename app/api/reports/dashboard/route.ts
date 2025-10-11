import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/reports/dashboard - Get accounts dashboard summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (branchId) where.branchId = parseInt(branchId)

    const dateWhere: any = {}
    if (startDate || endDate) {
      dateWhere.date = {}
      if (startDate) dateWhere.date.gte = new Date(startDate)
      if (endDate) dateWhere.date.lte = new Date(endDate)
    }

    // Get current month's data for comparison
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)

    // Parallel queries for better performance
    const [
      invoices,
      bills,
      payroll,
      transactions,
      cashFlow,
      vendors,
      customers,
      branches
    ] = await Promise.all([
      // Invoices
      prisma.invoice.findMany({
        where: {
          ...where,
          ...(startDate && endDate ? {
            issueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          payments: true
        }
      }),
      
      // Bills
      prisma.bill.findMany({
        where: {
          ...where,
          ...(startDate && endDate ? {
            issueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          payments: true
        }
      }),

      // Payroll
      prisma.payroll.findMany({
        where: {
          ...where,
          ...(startDate && endDate ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        }
      }),

      // Transactions
      prisma.transaction.findMany({
        where: {
          ...where,
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        }
      }),

      // Cash Flow
      prisma.cashFlow.findMany({
        where: {
          ...where,
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        }
      }),

      // Vendors
      prisma.vendor.findMany({
        where: { ...where, isActive: true }
      }),

      // Customers
      prisma.customer.findMany({
        where: { ...where, accountStatus: 'Active' }
      }),

      // Branches
      prisma.branch.findMany({
        where: { isActive: true }
      })
    ])

    // Calculate financial metrics
    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)

    const totalExpenses = [
      ...bills.filter(bill => bill.status === 'PAID').map(bill => bill.total),
      ...payroll.filter(p => p.status === 'PAID').map(p => p.netPay)
    ].reduce((sum, amount) => sum + amount, 0)

    const outstandingInvoices = invoices
      .filter(inv => inv.status !== 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)

    const outstandingBills = bills
      .filter(bill => bill.status !== 'PAID')
      .reduce((sum, bill) => sum + bill.total, 0)

    const netProfit = totalRevenue - totalExpenses

    // Cash flow metrics
    const totalCashIn = cashFlow.reduce((sum, cf) => sum + cf.cashIn, 0)
    const totalCashOut = cashFlow.reduce((sum, cf) => sum + cf.cashOut, 0)
    const netCashFlow = totalCashIn - totalCashOut

    // Transaction breakdown
    const transactionBreakdown = transactions.reduce((acc, txn) => {
      if (!acc[txn.category]) {
        acc[txn.category] = { debit: 0, credit: 0, count: 0 }
      }
      acc[txn.category][txn.type.toLowerCase()] += txn.amount
      acc[txn.category].count += 1
      return acc
    }, {} as any)

    // Invoice status breakdown
    const invoiceStatusBreakdown = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1
      return acc
    }, {} as any)

    // Bill status breakdown
    const billStatusBreakdown = bills.reduce((acc, bill) => {
      acc[bill.status] = (acc[bill.status] || 0) + 1
      return acc
    }, {} as any)

    // Branch-wise summary
    const branchSummary = branches.map(branch => {
      const branchInvoices = invoices.filter(inv => inv.branchId === branch.id)
      const branchBills = bills.filter(bill => bill.branchId === branch.id)
      const branchPayroll = payroll.filter(p => p.branchId === branch.id)
      const branchCashFlow = cashFlow.filter(cf => cf.branchId === branch.id)

      const branchRevenue = branchInvoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.total, 0)

      const branchExpenses = [
        ...branchBills.filter(bill => bill.status === 'PAID').map(bill => bill.total),
        ...branchPayroll.filter(p => p.status === 'PAID').map(p => p.netPay)
      ].reduce((sum, amount) => sum + amount, 0)

      return {
        id: branch.id,
        name: branch.name,
        revenue: branchRevenue,
        expenses: branchExpenses,
        profit: branchRevenue - branchExpenses,
        invoiceCount: branchInvoices.length,
        billCount: branchBills.length,
        payrollCount: branchPayroll.length,
        cashFlow: branchCashFlow.reduce((sum, cf) => sum + (cf.cashIn - cf.cashOut), 0)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalExpenses,
          netProfit,
          outstandingInvoices,
          outstandingBills,
          totalCashIn,
          totalCashOut,
          netCashFlow,
          profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        },
        counts: {
          invoices: invoices.length,
          bills: bills.length,
          payrollRecords: payroll.length,
          transactions: transactions.length,
          vendors: vendors.length,
          customers: customers.length,
          branches: branches.length
        },
        breakdowns: {
          invoiceStatus: invoiceStatusBreakdown,
          billStatus: billStatusBreakdown,
          transactions: transactionBreakdown
        },
        branchSummary,
        period: {
          startDate,
          endDate
        }
      }
    })
  } catch (error) {
    console.error('Error generating dashboard report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate dashboard report' },
      { status: 500 }
    )
  }
}
