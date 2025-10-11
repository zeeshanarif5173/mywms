'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Employee {
  id: number
  name: string
  email: string
  role: string
}

interface Branch {
  id: number
  name: string
}

interface PayrollItem {
  type: string
  description: string
  amount: number
  isDeduction: boolean
}

export default function CreatePayrollPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: '',
    branchId: '',
    payPeriod: '',
    baseSalary: '',
    overtime: '',
    bonus: '',
    deductions: ''
  })

  const [items, setItems] = useState<PayrollItem[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchEmployeesAndBranches()
  }, [])

  const fetchEmployeesAndBranches = async () => {
    try {
      setLoading(true)
      const [employeesRes, branchesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/branches')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        // Filter for employees only (not customers)
        const employeeUsers = employeesData.filter((user: any) => 
          user.role === 'STAFF' || user.role === 'MANAGER' || user.role === 'ADMIN'
        )
        setEmployees(employeeUsers)
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json()
        setBranches(branchesData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, {
      type: 'OTHER',
      description: '',
      amount: 0,
      isDeduction: false
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PayrollItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  const calculateNetPay = () => {
    const baseSalary = parseFloat(formData.baseSalary) || 0
    const overtime = parseFloat(formData.overtime) || 0
    const bonus = parseFloat(formData.bonus) || 0
    const deductions = parseFloat(formData.deductions) || 0
    
    const additionalIncome = items
      .filter(item => !item.isDeduction)
      .reduce((sum, item) => sum + item.amount, 0)
    
    const additionalDeductions = items
      .filter(item => item.isDeduction)
      .reduce((sum, item) => sum + item.amount, 0)
    
    const grossPay = baseSalary + overtime + bonus + additionalIncome
    const totalDeductions = deductions + additionalDeductions
    
    return grossPay - totalDeductions
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) newErrors.employeeId = 'Employee is required'
    if (!formData.branchId) newErrors.branchId = 'Branch is required'
    if (!formData.payPeriod) newErrors.payPeriod = 'Pay period is required'
    if (!formData.baseSalary || parseFloat(formData.baseSalary) < 0) {
      newErrors.baseSalary = 'Valid base salary is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          employeeId: parseInt(formData.employeeId),
          branchId: parseInt(formData.branchId),
          baseSalary: parseFloat(formData.baseSalary),
          overtime: parseFloat(formData.overtime) || 0,
          bonus: parseFloat(formData.bonus) || 0,
          deductions: parseFloat(formData.deductions) || 0,
          items: items.filter(item => item.description.trim() !== '' && item.amount > 0)
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/admin/payroll')
      } else {
        alert(data.error || 'Failed to create payroll record')
      }
    } catch (error) {
      console.error('Error creating payroll record:', error)
      alert('Failed to create payroll record')
    } finally {
      setSubmitting(false)
    }
  }

  const generatePayPeriods = () => {
    const periods = []
    const currentYear = new Date().getFullYear()
    
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(currentYear, month - 1).toLocaleDateString('en-US', { month: 'long' })
      periods.push({
        value: `${currentYear}-${month.toString().padStart(2, '0')}`,
        label: `${monthName} ${currentYear}`
      })
    }
    
    return periods
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/payroll')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Payroll
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Payroll Record</h1>
            <p className="text-gray-600">Add a new payroll record for an employee</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee & Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee *
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.employeeId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.email}) - {employee.role}
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch *
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.branchId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Period *
              </label>
              <select
                value={formData.payPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, payPeriod: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.payPeriod ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Pay Period</option>
                {generatePayPeriods().map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              {errors.payPeriod && (
                <p className="mt-1 text-sm text-red-600">{errors.payPeriod}</p>
              )}
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary & Compensation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Salary *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.baseSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.baseSalary ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
              {errors.baseSalary && (
                <p className="mt-1 text-sm text-red-600">{errors.baseSalary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overtime
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.overtime}
                onChange={(e) => setFormData(prev => ({ ...prev, overtime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.bonus}
                onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deductions
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.deductions}
                onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Additional Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={item.type}
                  onChange={(e) => updateItem(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BONUS">Bonus</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="OVERTIME">Overtime</option>
                  <option value="ALLOWANCE">Allowance</option>
                  <option value="TAX">Tax</option>
                  <option value="INSURANCE">Insurance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={item.isDeduction ? 'deduction' : 'addition'}
                    onChange={(e) => updateItem(index, 'isDeduction', e.target.value === 'deduction')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="addition">Addition</option>
                    <option value="deduction">Deduction</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Gross Pay</h4>
              <p className="text-2xl font-bold text-green-600">
                Rs {(parseFloat(formData.baseSalary) || 0) + (parseFloat(formData.overtime) || 0) + (parseFloat(formData.bonus) || 0) + items.filter(item => !item.isDeduction).reduce((sum, item) => sum + item.amount, 0)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Total Deductions</h4>
              <p className="text-2xl font-bold text-red-600">
                Rs {(parseFloat(formData.deductions) || 0) + items.filter(item => item.isDeduction).reduce((sum, item) => sum + item.amount, 0)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Net Pay</h4>
              <p className="text-2xl font-bold text-blue-600">
                Rs {calculateNetPay().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/payroll')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            {submitting ? 'Creating...' : 'Create Payroll'}
          </button>
        </div>
      </form>
    </div>
  )
}
