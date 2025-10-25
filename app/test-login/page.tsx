'use client'

import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

export default function TestLogin() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Not Logged In</h1>
        <p>Please sign in to test the authentication.</p>
        <a href="/auth/signin" className="text-blue-600 hover:underline">
          Go to Sign In
        </a>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Login Test - Success!</h1>
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold text-green-800">Session Data:</h2>
        <pre className="text-sm text-green-700 mt-2">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="space-y-2">
        <p><strong>Name:</strong> {session.user?.name}</p>
        <p><strong>Email:</strong> {session.user?.email}</p>
        <p><strong>Role:</strong> {session.user?.role}</p>
        <p><strong>ID:</strong> {session.user?.id}</p>
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Sign Out
        </button>
        <a
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
        >
          Go to Home
        </a>
      </div>
    </div>
  )
}
