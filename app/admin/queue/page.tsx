"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, RefreshCw, Play, CheckCircle, XCircle, Clock, User, Bell } from "lucide-react"

interface QueueToken {
  id: number
  token_number: string
  customer_name: string
  customer_phone: string
  service_name: string
  status: string
  estimated_wait_time: number
  position_in_queue: number
  created_at: string
  counter_id?: number
  counter_name?: string
}

export default function QueueManagement() {
  const [tokens, setTokens] = useState<QueueToken[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastTokenCount, setLastTokenCount] = useState(0)
  const [newTokenAlert, setNewTokenAlert] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchTokens()
    startRealTimeUpdates()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [selectedStatus])

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      fetchTokens(true) // Silent fetch for real-time updates
    }, 3000) // Update every 3 seconds for admin
  }

  const fetchTokens = async (silent = false) => {
    try {
      const response = await fetch(`/api/admin/tokens?status=${selectedStatus}`)
      if (response.ok) {
        const data = await response.json()

        if (silent && data.length > lastTokenCount && lastTokenCount > 0) {
          setNewTokenAlert(true)
          setTimeout(() => setNewTokenAlert(false), 3000)
        }

        setTokens(data)
        setLastTokenCount(data.length)
      }
    } catch (error) {
      console.error("Error fetching tokens:", error)
    } finally {
      if (!silent) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchTokens()
  }

  const updateTokenStatus = async (tokenId: number, newStatus: string, counterId?: number) => {
    try {
      const response = await fetch(`/api/admin/tokens/${tokenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          counter_id: counterId,
        }),
      })

      if (response.ok) {
        fetchTokens()
      } else {
        alert("Failed to update token status")
      }
    } catch (error) {
      console.error("Error updating token:", error)
      alert("Failed to update token status")
    }
  }

  const callNextToken = async () => {
    try {
      const response = await fetch("/api/admin/tokens/call-next", {
        method: "POST",
      })

      if (response.ok) {
        fetchTokens()
        alert("Next token called successfully")
      } else {
        alert("No tokens in queue")
      }
    } catch (error) {
      console.error("Error calling next token:", error)
      alert("Failed to call next token")
    }
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

  const filteredTokens = tokens.filter((token) => {
    if (selectedStatus === "all") return true
    return token.status === selectedStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {newTokenAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-3 text-center animate-in slide-in-from-top">
          <div className="flex items-center justify-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>New token added to queue!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Queue Management</h1>
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={callNextToken} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Call Next
              </Button>
              <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Filter by Status:</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tokens</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">Showing {filteredTokens.length} tokens</div>
            </div>
          </CardContent>
        </Card>

        {/* Tokens List */}
        <div className="space-y-4">
          {filteredTokens.map((token) => (
            <Card key={token.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono">{token.token_number}</div>
                      <Badge className={getStatusColor(token.status)}>
                        {token.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{token.customer_name}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{token.customer_phone}</div>
                      <div className="text-sm font-medium">{token.service_name}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Position: {token.position_in_queue}</span>
                      </div>
                      <div className="text-sm text-gray-600">Est. Wait: {token.estimated_wait_time}m</div>
                    </div>

                    {token.counter_name && (
                      <div className="text-center">
                        <div className="text-sm font-medium">Counter</div>
                        <div className="text-sm text-gray-600">{token.counter_name}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {token.status === "waiting" && (
                      <Button
                        onClick={() => updateTokenStatus(token.id, "in_progress", 1)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Service
                      </Button>
                    )}

                    {token.status === "in_progress" && (
                      <Button
                        onClick={() => updateTokenStatus(token.id, "completed")}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}

                    {(token.status === "waiting" || token.status === "in_progress") && (
                      <Button
                        onClick={() => updateTokenStatus(token.id, "cancelled")}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}

                    <div className="text-xs text-gray-500">{new Date(token.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTokens.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tokens found</h3>
                  <p>No tokens match the selected filter criteria.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
