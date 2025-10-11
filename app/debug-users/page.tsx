'use client'

import { useState, useEffect } from 'react'

export default function DebugUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Debug: Fetching users from API...')
      const response = await fetch('/api/users')
      console.log('Debug: API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Debug: API response data:', data)
        setUsers(data)
      } else {
        const errorText = await response.text()
        console.error('Debug: API error:', response.status, errorText)
        setError(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (err) {
      console.error('Debug: Fetch error:', err)
      setError(`Fetch Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Debug: Testing search API...')
      const response = await fetch('/api/users/search?q=asim')
      console.log('Debug: Search API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Debug: Search API response data:', data)
        setUsers(data)
      } else {
        const errorText = await response.text()
        console.error('Debug: Search API error:', response.status, errorText)
        setError(`Search API Error: ${response.status} - ${errorText}`)
      }
    } catch (err) {
      console.error('Debug: Search fetch error:', err)
      setError(`Search Fetch Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Users</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load All Users'}
            </button>
            <button
              onClick={testSearch}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Test Search "asim"'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <strong>Total Users: {users.length}</strong>
          </div>
          
          <div className="space-y-2">
            {users.map((user, index) => (
              <div key={user.id} className="border p-3 rounded bg-gray-50">
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm text-gray-500">
                  {user.role} | {user.category} | {user.accountStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Click "Load All Users" to see all users from the API</li>
            <li>Click "Test Search 'asim'" to test the search functionality</li>
            <li>Check the browser console (F12) for detailed logs</li>
            <li>Look for "asim khan" in the results</li>
            <li>Go to <a href="/manager/users" className="text-blue-600 underline">/manager/users</a> to see the users management page</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
