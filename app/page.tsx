import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⏰</div>
              <h1 className="text-xl font-bold text-gray-900">QueueFlow</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/customer" className="text-gray-600 hover:text-gray-900">
                Customer Portal
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Portal
              </Link>
              <Link href="/display" className="text-gray-600 hover:text-gray-900">
                Display
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Digital Waiting Queue Management System</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your service operations with our comprehensive queue management solution. Reduce wait times,
            improve customer satisfaction, and optimize staff efficiency.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Customer Portal</h3>
              <p className="text-gray-600 text-sm mb-4">Book tokens, track queue status, and receive notifications</p>
              <Link
                href="/customer"
                className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
              >
                Access Portal
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Admin Dashboard</h3>
              <p className="text-gray-600 text-sm mb-4">Manage queues, staff, and view comprehensive analytics</p>
              <Link
                href="/admin"
                className="inline-block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors text-center"
              >
                Admin Login
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🖥️</div>
              <h3 className="text-lg font-semibold mb-2">Public Display</h3>
              <p className="text-gray-600 text-sm mb-4">Real-time queue status for waiting areas and lobbies</p>
              <Link
                href="/display"
                className="inline-block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors text-center"
              >
                View Display
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600 text-sm mb-4">Live queue status, notifications, and wait time estimates</p>
              <Link
                href="/updates"
                className="inline-block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors text-center"
              >
                Live Updates
              </Link>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Token Booking</h4>
                <p className="text-gray-600 text-sm">Easy online token booking with QR codes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Real-time Tracking</h4>
                <p className="text-gray-600 text-sm">Live queue status and wait time estimates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Multi-branch Support</h4>
                <p className="text-gray-600 text-sm">Manage multiple locations from one dashboard</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Staff Management</h4>
                <p className="text-gray-600 text-sm">Role-based access and staff scheduling</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Analytics & Reports</h4>
                <p className="text-gray-600 text-sm">Comprehensive analytics and performance metrics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Notifications</h4>
                <p className="text-gray-600 text-sm">SMS, email, and push notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🎫 Get a Token
            </Link>
            <Link
              href="/updates"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              📱 Check Queue Status
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
