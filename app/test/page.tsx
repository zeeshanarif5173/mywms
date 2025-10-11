'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Coworking Portal is Working!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your application is running successfully
        </p>
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Application Status
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Frontend: Running</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Database: SQLite</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">API Endpoints: Ready</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Notifications: Ready</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Cron Jobs: Ready</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <a 
              href="/auth/signin" 
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Sign In
            </a>
            <a 
              href="/dashboard" 
              className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
