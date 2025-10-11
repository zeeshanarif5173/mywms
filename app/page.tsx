'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      setRedirecting(true)
      router.push('/auth/signin')
    } else {
      setRedirecting(true)
      router.push('/dashboard')
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
