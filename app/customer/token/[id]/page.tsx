"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, QrCode, MapPin, Phone, User, ArrowLeft, RefreshCw, Bell } from "lucide-react"
import { useParams } from "next/navigation"

interface Token {
  id: number
  token_number: string
  status: string
  customer_name: string
  customer_phone: string
  estimated_wait_time: number
  position_in_queue: number
  branch_name: string
  service_name: string
  created_at: string
}

export default function TokenDetails() {
  const params = useParams()
  const [token, setToken] = useState<Token | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastStatus, setLastStatus] = useState<string>("")
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchToken()
      startRealTimeUpdates()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [params.id])

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      fetchToken(true) // Silent fetch for real-time updates
    }, 5000) // Update every 5 seconds
  }

  const fetchToken = async (silent = false) => {
    try {
      const response = await fetch(`/api/tokens/${params.id}`)
      if (response.ok) {
        const data = await response.json()

        if (token && data.status !== lastStatus && lastStatus !== "") {
          showStatusNotification(data.status)
        }

        setToken(data)
        setLastStatus(data.status)
      } else {
        console.error("Token not found")
      }
    } catch (error) {
      console.error("Error fetching token:", error)
    } finally {
      if (!silent) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }

  const showStatusNotification = (newStatus: string) => {
    let message = ""
    switch (newStatus) {
      case "in_progress":
        message = "🔔 Your service is starting! Please proceed to the counter."
        break
      case "completed":
        message = "✅ Your service has been completed. Thank you!"
        break
      case "cancelled":
        message = "❌ Your token has been cancelled."
        break
      default:
        return
    }

    setNotificationMessage(message)
    setShowNotification(true)

    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setShowNotification(false)
    }, 10000)

    // Browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Queue Update", {
        body: message.replace(/[🔔✅❌]/gu, "").trim(),
        icon: "/favicon.ico",
      })
    }
  }

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchToken()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading token details...</p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Token Not Found</h2>
            <p className="text-gray-600 mb-4">The token you're looking for doesn't exist or has been removed.</p>
            <Link href="/customer">
              <Button>Book New Token</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 text-center animate-in slide-in-from-top">
          <div className="flex items-center justify-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{notificationMessage}</span>
            <Button
              onClick={() => setShowNotification(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700 ml-4"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/customer" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Portal</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Token</h1>
          <p className="text-gray-600">Keep this page open for real-time updates</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Info */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-6 bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{token.token_number}</span>
              </div>
              <CardTitle className="text-2xl">Token #{token.token_number}</CardTitle>
              <CardDescription>
                <Badge className={getStatusColor(token.status)}>{token.status.replace("_", " ").toUpperCase()}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{token.position_in_queue}</div>
                <p className="text-gray-600">Position in Queue</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900 mb-1">~{token.estimated_wait_time} min</div>
                <p className="text-gray-600">Estimated Wait Time</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{token.customer_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{token.customer_phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service & Branch Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Service Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{token.service_name}</h3>
                <p className="text-gray-600">Service</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-1">{token.branch_name}</h3>
                <p className="text-gray-600">Branch Location</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Booked At</h3>
                <p className="text-gray-600">{new Date(token.created_at).toLocaleString()}</p>
              </div>

              <div className="border-t pt-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <QrCode className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Show this token number at the counter when called</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        <Card className="mt-8">
          <CardContent className="p-6">
            {token.status === "waiting" && (
              <div className="text-center text-yellow-700 bg-yellow-50 p-4 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Please wait for your turn</p>
                <p className="text-sm">You will be notified when it's your turn</p>
              </div>
            )}

            {token.status === "in_progress" && (
              <div className="text-center text-blue-700 bg-blue-50 p-4 rounded-lg">
                <User className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Your service is in progress</p>
                <p className="text-sm">Please proceed to the assigned counter</p>
              </div>
            )}

            {token.status === "completed" && (
              <div className="text-center text-green-700 bg-green-50 p-4 rounded-lg">
                <p className="font-medium">Service completed successfully</p>
                <p className="text-sm">Thank you for using our service!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
