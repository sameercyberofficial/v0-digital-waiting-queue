"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface QueueToken {
  id: number
  token_number: string
  customer_name: string
  service_name: string
  status: string
  counter_number?: string
  estimated_wait_time?: number
  created_at: string
}

export default function RealTimeUpdates() {
  const [tokens, setTokens] = useState<QueueToken[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchTokens()
    startRealTimeUpdates()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      fetchTokens(true)
    }, 5000) // Update every 5 seconds
  }

  const fetchTokens = async (silent = false) => {
    try {
      const response = await fetch("/api/queue/active")
      if (response.ok) {
        const data = await response.json()
        setTokens(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching tokens:", error)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return "⏳"
      case "in_progress":
        return "🔄"
      case "completed":
        return "✅"
      case "cancelled":
        return "❌"
      default:
        return "📋"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg">Loading queue updates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Back to Home
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Real-Time Queue Updates</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
              <span>•</span>
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Queue Status Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tokens.filter((t) => t.status === "waiting").length}
              </div>
              <div className="text-sm text-gray-600">Waiting</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {tokens.filter((t) => t.status === "in_progress").length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tokens.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{tokens.length}</div>
              <div className="text-sm text-gray-600">Total Active</div>
            </div>
          </div>
        </div>

        {/* Active Tokens */}
        <div className="space-y-4">
          {tokens.length > 0 ? (
            tokens.map((token) => (
              <div
                key={token.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getStatusColor(token.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getStatusIcon(token.status)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold font-mono">{token.token_number}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(token.status)}`}>
                          {token.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-gray-900">{token.customer_name}</p>
                      <p className="text-sm text-gray-600">{token.service_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {token.counter_number && (
                      <div className="text-lg font-semibold text-gray-900">Counter {token.counter_number}</div>
                    )}
                    {token.estimated_wait_time && token.status === "waiting" && (
                      <div className="text-sm text-gray-600">Est. wait: {token.estimated_wait_time} min</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">{new Date(token.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Tokens</h3>
              <p className="text-gray-600">All customers have been served. Great job!</p>
              <Link
                href="/"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Get a New Token
              </Link>
            </div>
          )}
        </div>

        {/* Auto-refresh notice */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This page automatically refreshes every 5 seconds to show the latest queue status.</p>
        </div>
      </main>
    </div>
  )
}
