"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalTokensToday: number
  activeTokens: number
  completedTokens: number
  averageWaitTime: number
  activeBranches: number
  activeStaff: number
}

interface RecentToken {
  id: number
  token_number: string
  customer_name: string
  service_name: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTokens, setRecentTokens] = useState<RecentToken[]>([])
  const [adminUser, setAdminUser] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    const user = localStorage.getItem("adminUser")

    if (!token || !user) {
      router.push("/admin")
      return
    }

    setAdminUser(JSON.parse(user))
    fetchDashboardData()
    startRealTimeUpdates()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [router])

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      fetchDashboardData(true)
    }, 10000)
  }

  const fetchDashboardData = async (silent = false) => {
    try {
      const [statsResponse, tokensResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/recent-tokens"),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (tokensResponse.ok) {
        const tokensData = await tokensResponse.json()
        setRecentTokens(tokensData)
      }
    } catch (error) {
      if (!silent) {
        console.error("Error fetching dashboard data:", error)
      }
    }
  }

  const handleLogout = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    router.push("/admin")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
      case "in_progress":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
      case "completed":
        return "bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
      case "cancelled":
        return "bg-red-100 text-red-800 px-2 py-1 rounded text-xs"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
    }
  }

  if (!adminUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {adminUser.branch_name || "Main Branch"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {adminUser.name || "Admin"}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/queue" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer text-center">
              <div className="text-3xl mb-2">👁️</div>
              <h3 className="font-semibold">Queue Management</h3>
              <p className="text-sm text-gray-600">Manage active tokens</p>
              {stats && stats.activeTokens > 0 && (
                <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  {stats.activeTokens} Active
                </span>
              )}
            </div>
          </Link>

          <Link href="/admin/staff" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold">Staff Management</h3>
              <p className="text-sm text-gray-600">Manage staff & counters</p>
            </div>
          </Link>

          <Link href="/admin/services" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer text-center">
              <div className="text-3xl mb-2">⚙️</div>
              <h3 className="font-semibold">Services</h3>
              <p className="text-sm text-gray-600">Manage services</p>
            </div>
          </Link>

          <Link href="/admin/analytics" className="block">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-gray-600">View reports</p>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Tokens</p>
                  <p className="text-2xl font-bold">{stats.totalTokensToday}</p>
                  <p className="text-xs text-gray-500">Total tokens issued today</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Queue</p>
                  <p className="text-2xl font-bold">{stats.activeTokens}</p>
                  <p className="text-xs text-gray-500">Tokens waiting or in progress</p>
                  {stats.activeTokens > 0 && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-600">Live Queue</span>
                    </div>
                  )}
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedTokens}</p>
                  <p className="text-xs text-gray-500">Tokens completed today</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                  <p className="text-2xl font-bold">{stats.averageWaitTime}m</p>
                  <p className="text-xs text-gray-500">Average wait time today</p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-2xl font-bold">{stats.activeStaff}</p>
                  <p className="text-xs text-gray-500">Staff currently working</p>
                </div>
                <div className="text-3xl">👨‍💼</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Branches</p>
                  <p className="text-2xl font-bold">{stats.activeBranches}</p>
                  <p className="text-xs text-gray-500">Active branch locations</p>
                </div>
                <div className="text-3xl">🏢</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Tokens */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Tokens</h2>
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Latest token activities across all services</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="font-mono font-bold text-lg">{token.token_number}</div>
                    <div>
                      <p className="font-medium">{token.customer_name}</p>
                      <p className="text-sm text-gray-600">{token.service_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={getStatusColor(token.status)}>{token.status.replace("_", " ").toUpperCase()}</span>
                    <span className="text-sm text-gray-500">{new Date(token.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {recentTokens.length === 0 && (
                <div className="text-center py-8 text-gray-500">No recent tokens found</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
