"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Clock,
  TrendingUp,
  Building,
  Settings,
  LogOut,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
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

  if (!adminUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <Badge variant="outline">{adminUser.branch_name}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {adminUser.name}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/queue">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">Queue Management</h3>
                <p className="text-sm text-gray-600">Manage active tokens</p>
                {stats && stats.activeTokens > 0 && (
                  <Badge className="mt-2 bg-red-100 text-red-800">{stats.activeTokens} Active</Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">Staff Management</h3>
                <p className="text-sm text-gray-600">Manage staff & counters</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/services">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold">Services</h3>
                <p className="text-sm text-gray-600">Manage services</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View reports</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Tokens</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTokensToday}</div>
                <p className="text-xs text-muted-foreground">Total tokens issued today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Queue</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTokens}</div>
                <p className="text-xs text-muted-foreground">Tokens waiting or in progress</p>
                {stats.activeTokens > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-orange-600">Live Queue</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTokens}</div>
                <p className="text-xs text-muted-foreground">Tokens completed today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageWaitTime}m</div>
                <p className="text-xs text-muted-foreground">Average wait time today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeStaff}</div>
                <p className="text-xs text-muted-foreground">Staff currently working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Branches</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeBranches}</div>
                <p className="text-xs text-muted-foreground">Active branch locations</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Tokens</span>
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </CardTitle>
            <CardDescription>Latest token activities across all services</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <Badge className={getStatusColor(token.status)}>
                      {token.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(token.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {recentTokens.length === 0 && (
                <div className="text-center py-8 text-gray-500">No recent tokens found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
