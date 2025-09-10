import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Monitor, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
            Digital Waiting Queue Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            Streamline your service operations with our comprehensive queue management solution. Reduce wait times,
            improve customer satisfaction, and optimize staff efficiency.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>Book tokens, track queue status, and receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/customer">
                <Button className="w-full">Access Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Manage queues, staff, and view comprehensive analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full bg-transparent" variant="outline">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Monitor className="h-12 w-12 text-purple-600 mx-auto mb-2" />
              <CardTitle>Public Display</CardTitle>
              <CardDescription>Real-time queue status for waiting areas and lobbies</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/display">
                <Button className="w-full bg-transparent" variant="outline">
                  View Display
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-2" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>Live queue status, notifications, and wait time estimates</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Live Updates
              </Button>
            </CardContent>
          </Card>
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
      </main>
    </div>
  )
}
