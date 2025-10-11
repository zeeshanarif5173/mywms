'use client'

import { useState, useEffect } from 'react'

interface ReportData {
  incomeStatement?: any
  balanceSheet?: any
  cashFlowStatement?: any
  profitLossStatement?: any
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState('income_statement')
  const [reportData, setReportData] = useState<ReportData>({})
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    branchId: '',
    startDate: '',
    endDate: ''
  })

  const generateReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: reportType,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
      })

      const response = await fetch(`/api/reports/financial?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setReportData(prev => ({ ...prev, [reportType]: data.data }))
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reportType && (filters.startDate || filters.endDate)) {
      generateReport()
    }
  }, [reportType, filters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const renderIncomeStatement = () => {
    const data = reportData.incomeStatement
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
          <div className="space-y-2">
            {data.revenue?.accounts?.map((account: any, index: number) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">{account.name}</span>
                <span className="font-medium text-green-600">{formatCurrency(account.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold text-lg">
              <span>Total Revenue</span>
              <span className="text-green-600">{formatCurrency(data.revenue?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
          <div className="space-y-2">
            {data.expenses?.accounts?.map((account: any, index: number) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">{account.name}</span>
                <span className="font-medium text-red-600">{formatCurrency(account.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold text-lg">
              <span>Total Expenses</span>
              <span className="text-red-600">{formatCurrency(data.expenses?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between py-2 font-bold text-xl">
            <span>Net Income</span>
            <span className={`${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netIncome || 0)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderBalanceSheet = () => {
    const data = reportData.balanceSheet
    if (!data) return null

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets</h3>
          <div className="space-y-2">
            {data.assets?.accounts?.map((account: any, index: number) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">{account.name}</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold text-lg">
              <span>Total Assets</span>
              <span className="text-blue-600">{formatCurrency(data.assets?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Liabilities</h3>
          <div className="space-y-2">
            {data.liabilities?.accounts?.map((account: any, index: number) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">{account.name}</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold text-lg">
              <span>Total Liabilities</span>
              <span className="text-orange-600">{formatCurrency(data.liabilities?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equity</h3>
          <div className="space-y-2">
            {data.equity?.accounts?.map((account: any, index: number) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-700">{account.name}</span>
                <span className="font-medium">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold text-lg">
              <span>Total Equity</span>
              <span className="text-green-600">{formatCurrency(data.equity?.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCashFlowStatement = () => {
    const data = reportData.cashFlowStatement
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Cash In</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary?.totalCashIn || 0)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Cash Out</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary?.totalCashOut || 0)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Net Cash Flow</p>
              <p className={`text-2xl font-bold ${(data.summary?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.summary?.netCashFlow || 0)}
              </p>
            </div>
          </div>
        </div>

        {data.byCategory && Object.keys(data.byCategory).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow by Category</h3>
            <div className="space-y-4">
              {Object.entries(data.byCategory).map(([category, flow]: [string, any]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Cash In</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(flow.cashIn)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cash Out</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(flow.cashOut)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderProfitLossStatement = () => {
    const data = reportData.profitLossStatement
    if (!data) return null

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-green-600">{data.revenue?.invoices || 0}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.revenue?.totalAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span>Bills ({data.expenses?.bills?.count || 0})</span>
              <span className="font-medium text-red-600">{formatCurrency(data.expenses?.bills?.amount || 0)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span>Payroll ({data.expenses?.payroll?.count || 0})</span>
              <span className="font-medium text-red-600">{formatCurrency(data.expenses?.payroll?.amount || 0)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-semibold text-lg">
              <span>Total Expenses</span>
              <span className="text-red-600">{formatCurrency(data.expenses?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span>Gross Profit</span>
              <span className={`font-medium ${data.profit?.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.profit?.grossProfit || 0)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Net Profit</span>
              <span className={`font-medium text-lg ${data.profit?.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.profit?.netProfit || 0)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Profit Margin</span>
              <span className="font-medium">{formatPercentage(data.profit?.margin || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderReport = () => {
    switch (reportType) {
      case 'income_statement':
        return renderIncomeStatement()
      case 'balance_sheet':
        return renderBalanceSheet()
      case 'cash_flow':
        return renderCashFlowStatement()
      case 'profit_loss':
        return renderProfitLossStatement()
      default:
        return <div>Select a report type to generate</div>
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
      </div>

      {/* Report Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="income_statement">Income Statement</option>
            <option value="balance_sheet">Balance Sheet</option>
            <option value="cash_flow">Cash Flow Statement</option>
            <option value="profit_loss">Profit & Loss Statement</option>
          </select>

          <select
            value={filters.branchId}
            onChange={(e) => setFilters(prev => ({ ...prev, branchId: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Branches</option>
            {/* Add branch options here */}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End Date"
          />
        </div>

        <button
          onClick={generateReport}
          disabled={loading || (!filters.startDate && !filters.endDate)}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating report...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {reportData[reportType as keyof ReportData] ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {reportType.replace('_', ' ')}
                </h2>
                <div className="text-sm text-gray-500">
                  {filters.startDate && filters.endDate && (
                    <span>
                      Period: {new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {renderReport()}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Select a report type and date range to generate a report</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
