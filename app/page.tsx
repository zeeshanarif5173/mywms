'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    console.log('Home page - Session status:', { status, session })
    
    if (status === 'loading') return // Still loading
    
    if (!session) {
      console.log('No session, redirecting to signin')
      setRedirecting(true)
      router.push('/auth/signin')
    } else {
      console.log('Session found, redirecting based on role:', session.user?.role)
      setRedirecting(true)
      // Redirect based on user role
      if (session?.user?.role) {
        switch (session.user.role) {
          case 'CUSTOMER':
            router.push('/customer/dashboard')
            break
          case 'MANAGER':
            router.push('/manager/customers')
            break
          case 'STAFF':
            router.push('/staff/dashboard')
            break
          case 'ADMIN':
            router.push('/admin/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      } else {
        console.log('No role found, redirecting to dashboard')
        // Fallback if no role found
        router.push('/dashboard')
      }
    }
  }, [session, status, router])

  if (status === 'loading' || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === 'loading' ? 'Loading...' : 'Redirecting...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Coworking Portal
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to your coworking management portal
        </p>
        <div className="space-y-4">
          <a 
            href="/auth/signin" 
            className="block w-full max-w-xs mx-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔐 Sign In to Portal
          </a>
          <a 
            href="/test" 
            className="block w-full max-w-xs mx-auto bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Test Page
          </a>
        </div>
      </div>
    </div>
  )
}
