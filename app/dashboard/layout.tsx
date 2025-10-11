'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  UserIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  QrCodeIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to sign in if no session
  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const userRole = session.user?.role || 'CUSTOMER'

  // Navigation items based on role
  const getNavigationItems = () => {
    if (userRole === 'CUSTOMER') {
      return [
        { name: 'Profile', href: '/customer/profile', icon: UserIcon },
        { name: 'Complaints', href: '/customer/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Contracts', href: '/customer/contracts', icon: DocumentTextIcon },
        { name: 'Gate Pass', href: '/customer/gatepass', icon: QrCodeIcon },
        { name: 'Time Tracking', href: '/customer/time-tracking', icon: ClockIcon },
        { name: 'Meeting Rooms', href: '/customer/meeting-rooms', icon: BuildingOfficeIcon },
      ]
    } else if (userRole === 'MANAGER') {
      return [
        { name: 'Customers', href: '/manager/customers', icon: UserGroupIcon },
        { name: 'Complaints', href: '/manager/complaints', icon: ChatBubbleLeftRightIcon },
        { name: 'Contracts', href: '/manager/contracts', icon: DocumentTextIcon },
        { name: 'Gate Scanner', href: '/manager/gatepass', icon: QrCodeIcon },
        { name: 'Meeting Rooms', href: '/admin/meeting-rooms', icon: BuildingOfficeIcon },
      ]
    } else if (userRole === 'ADMIN') {
      return [
        { name: 'Admin Portal', href: '/admin/dashboard', icon: UserIcon },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
        { name: 'Branches', href: '/admin/branches', icon: BuildingOfficeIcon },
        { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
        { name: 'Complaints', href: '/admin/complaints', icon: ExclamationTriangleIcon },
        { name: 'Tasks', href: '/admin/tasks', icon: ClipboardDocumentListIcon },
        { name: 'Rooms', href: '/admin/rooms', icon: BuildingOfficeIcon },
        { name: 'Meeting Rooms', href: '/admin/meeting-rooms', icon: BuildingOfficeIcon },
        { name: 'System', href: '/admin/system-status', icon: CogIcon },
        { name: 'Admin Users', href: '/admin/users', icon: UserIcon },
      ]
    }
    return []
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {userRole === 'CUSTOMER' ? 'Customer Portal' : 
               userRole === 'MANAGER' ? 'Manager Portal' : 'Admin Portal'}
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">
              {userRole === 'CUSTOMER' ? 'Customer Portal' : 
               userRole === 'MANAGER' ? 'Manager Portal' : 'Admin Portal'}
            </h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"></div>
              <div className="flex items-center gap-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-700">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
