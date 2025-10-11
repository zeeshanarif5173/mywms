'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface DashboardReport {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalPayroll: number;
  };
  invoices: {
    total: number;
    paid: number;
    overdue: number;
    paymentRate: number;
  };
  bills: {
    total: number;
    paid: number;
    overdue: number;
    paymentRate: number;
  };
  recentTransactions: Transaction[];
  topCustomers: TopCustomer[];
}

interface Transaction {
  id: number;
  transactionNumber: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  account: {
    name: string;
    code: string;
  };
  branch: {
    name: string;
  };
}

interface TopCustomer {
  customerId: number;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  _sum: {
    total: number;
  };
}

interface IncomeStatement {
  revenue: {
    grossRevenue: number;
    taxCollected: number;
    netRevenue: number;
  };
  expenses: {
    operational: number;
    payroll: number;
    total: number;
  };
  netIncome: number;
  margin: number;
}

interface BranchPerformance {
  branch: {
    id: number;
    name: string;
  };
  metrics: {
    revenue: number;
    expenses: number;
    payroll: number;
    netIncome: number;
    customerCount: number;
    profitMargin: number;
  };
}

export default function AccountingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardReport | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([]);
  const [filters, setFilters] = useState({
    branchId: '',
    dateFrom: '',
    dateTo: '',
    period: 'monthly',
  });

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER') {
      loadDashboardData();
    } else {
      router.push('/dashboard');
    }
  }, [session, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/accounting/reports?reportType=dashboard&${params}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeStatement = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/accounting/reports?reportType=income-statement&${params}`);
      if (response.ok) {
        const data = await response.json();
        setIncomeStatement(data);
      }
    } catch (error) {
      console.error('Error loading income statement:', error);
    }
  };

  const loadBranchPerformance = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/accounting/reports?reportType=branch-performance&${params}`);
      if (response.ok) {
        const data = await response.json();
        setBranchPerformance(data.branchPerformance);
      }
    } catch (error) {
      console.error('Error loading branch performance:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'income-statement') {
      loadIncomeStatement();
    } else if (activeTab === 'branch-performance') {
      loadBranchPerformance();
    }
  }, [activeTab, filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Accounting Dashboard</h1>
            <p className="mt-2 text-gray-600">Comprehensive financial reports and analytics</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.branchId}
                onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Branches</option>
                <option value="1">Main Branch</option>
                <option value="2">Downtown Branch</option>
                <option value="3">Suburb Branch</option>
              </select>

              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="From Date"
              />

              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
                placeholder="To Date"
              />

              <select
                value={filters.period}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'dashboard', name: 'Dashboard' },
                  { id: 'income-statement', name: 'Income Statement' },
                  { id: 'branch-performance', name: 'Branch Performance' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && dashboardData && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">$</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatCurrency(dashboardData.summary.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">-</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-red-600">Total Expenses</p>
                          <p className="text-2xl font-bold text-red-900">
                            {formatCurrency(dashboardData.summary.totalExpenses)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg ${dashboardData.summary.netIncome >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            dashboardData.summary.netIncome >= 0 ? 'bg-blue-500' : 'bg-red-500'
                          }`}>
                            <span className="text-white text-sm font-bold">
                              {dashboardData.summary.netIncome >= 0 ? '+' : '-'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm font-medium ${
                            dashboardData.summary.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>Net Income</p>
                          <p className={`text-2xl font-bold ${
                            dashboardData.summary.netIncome >= 0 ? 'text-blue-900' : 'text-red-900'
                          }`}>
                            {formatCurrency(dashboardData.summary.netIncome)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">👥</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-600">Total Payroll</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {formatCurrency(dashboardData.summary.totalPayroll)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoices and Bills Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Invoices Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Invoices</span>
                          <span className="font-medium">{dashboardData.invoices.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid</span>
                          <span className="font-medium text-green-600">{dashboardData.invoices.paid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overdue</span>
                          <span className="font-medium text-red-600">{dashboardData.invoices.overdue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Rate</span>
                          <span className="font-medium">{formatPercentage(dashboardData.invoices.paymentRate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Bills Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bills</span>
                          <span className="font-medium">{dashboardData.bills.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid</span>
                          <span className="font-medium text-green-600">{dashboardData.bills.paid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overdue</span>
                          <span className="font-medium text-red-600">{dashboardData.bills.overdue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Rate</span>
                          <span className="font-medium">{formatPercentage(dashboardData.bills.paymentRate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Account
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.recentTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(transaction.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.account.code} - {transaction.account.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.type === 'DEBIT' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(transaction.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Customers */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers by Revenue</h3>
                    <div className="space-y-3">
                      {dashboardData.topCustomers.map((customer) => (
                        <div key={customer.customerId} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{customer.customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.customer.email}</p>
                          </div>
                          <span className="font-medium text-green-600">
                            {formatCurrency(customer._sum.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Income Statement Tab */}
              {activeTab === 'income-statement' && incomeStatement && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Income Statement</h3>
                    
                    <div className="space-y-4">
                      {/* Revenue Section */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Revenue</h4>
                        <div className="ml-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gross Revenue</span>
                            <span className="font-medium">{formatCurrency(incomeStatement.revenue.grossRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax Collected</span>
                            <span className="font-medium">{formatCurrency(incomeStatement.revenue.taxCollected)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-medium text-gray-900">Net Revenue</span>
                            <span className="font-bold text-green-600">{formatCurrency(incomeStatement.revenue.netRevenue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expenses Section */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-2">Expenses</h4>
                        <div className="ml-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Operational Expenses</span>
                            <span className="font-medium">{formatCurrency(incomeStatement.expenses.operational)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payroll Expenses</span>
                            <span className="font-medium">{formatCurrency(incomeStatement.expenses.payroll)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-medium text-gray-900">Total Expenses</span>
                            <span className="font-bold text-red-600">{formatCurrency(incomeStatement.expenses.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Income */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-gray-900">Net Income</span>
                          <span className={`text-lg font-bold ${
                            incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(incomeStatement.netIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-gray-600">Profit Margin</span>
                          <span className={`text-sm font-medium ${
                            incomeStatement.margin >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(incomeStatement.margin)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Branch Performance Tab */}
              {activeTab === 'branch-performance' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Branch Performance</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Revenue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Expenses
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payroll
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Net Income
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customers
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Margin
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {branchPerformance.map((branch) => (
                            <tr key={branch.branch.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {branch.branch.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {formatCurrency(branch.metrics.revenue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {formatCurrency(branch.metrics.expenses)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                                {formatCurrency(branch.metrics.payroll)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`font-medium ${
                                  branch.metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(branch.metrics.netIncome)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {branch.metrics.customerCount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`font-medium ${
                                  branch.metrics.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatPercentage(branch.metrics.profitMargin)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
