'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  UserGroupIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArchiveBoxIcon,
  CubeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const navigation = [
    {
      name: 'Branches',
      href: '/admin/branches',
      icon: BuildingOfficeIcon,
      current: pathname === '/admin/branches'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserGroupIcon,
      current: pathname === '/admin/users'
    },
    {
      name: 'Complaints',
      href: '/admin/complaints',
      icon: ExclamationTriangleIcon,
      current: pathname === '/admin/complaints'
    },
    {
      name: 'Tasks',
      href: '/admin/tasks',
      icon: ClipboardDocumentListIcon,
      current: pathname === '/admin/tasks'
    },
    {
      name: 'Staff Attendance',
      href: '/admin/staff-attendance',
      icon: ClockIcon,
      current: pathname === '/admin/staff-attendance'
    },
    {
      name: 'Inventory',
      href: '/admin/inventory',
      icon: CubeIcon,
      current: pathname === '/admin/inventory'
    },
    {
      name: 'Rooms',
      href: '/admin/rooms',
      icon: BuildingOfficeIcon,
      current: pathname.startsWith('/admin/rooms')
    },
    {
      name: 'Packages',
      href: '/admin/packages',
      icon: TagIcon,
      current: pathname === '/admin/packages'
    },
    {
      name: 'Meeting Rooms',
      href: '/admin/meeting-rooms',
      icon: BuildingOfficeIcon,
      current: pathname.startsWith('/admin/meeting-rooms')
    },
    // Accounting Section
    {
      name: 'Accounting',
      href: '/admin/accounting',
      icon: CalculatorIcon,
      current: pathname === '/admin/accounting'
    },
    {
      name: 'Invoices',
      href: '/admin/invoices',
      icon: DocumentTextIcon,
      current: pathname === '/admin/invoices'
    },
    {
      name: 'Vendors',
      href: '/admin/vendors',
      icon: BuildingOfficeIcon,
      current: pathname === '/admin/vendors'
    },
    {
      name: 'Bills',
      href: '/admin/bills',
      icon: ReceiptPercentIcon,
      current: pathname === '/admin/bills'
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: CurrencyDollarIcon,
      current: pathname === '/admin/transactions'
    },
    {
      name: 'Payroll',
      href: '/admin/payroll',
      icon: BanknotesIcon,
      current: pathname === '/admin/payroll'
    },
    {
      name: 'System',
      href: '/admin/system-status',
      icon: CogIcon,
      current: pathname === '/admin/system-status'
    }
  ]

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <CogIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-white">Admin Portal</h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      item.current
                        ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">ADMIN</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                title="Sign Out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        {/* Mobile sidebar overlay */}
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true"></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <CogIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
                  </div>
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        item.current
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`mr-4 flex-shrink-0 h-6 w-6 ${
                          item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">ADMIN</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-3 text-lg font-semibold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{session.user?.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
