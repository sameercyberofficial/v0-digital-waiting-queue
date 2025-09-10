"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Monitor, Users, Bell, MapPin } from "lucide-react"
import { useParams } from "next/navigation"

interface DisplayToken {
  id: number
  token_number: string
  customer_name: string
  service_name: string
  status: string
  counter_name?: string
  estimated_wait_time: number
  position_in_queue: number
}

interface NowServing {
  token_number: string
  counter_name: string
  service_name: string
}

interface BranchInfo {
  id: number
  name: string
  address: string
}

export default function BranchDisplay() {
  const params = useParams()
  const [branch, setBranch] = useState<BranchInfo | null>(null)
  const [nowServing, setNowServing] = useState<NowServing[]>([])
  const [waitingQueue, setWaitingQueue] = useState<DisplayToken[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchBranchInfo()
      fetchDisplayData()
      startRealTimeUpdates()
      startClock()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeRef.current) {
        clearInterval(timeRef.current)
      }
    }
  }, [params.id])

  const fetchBranchInfo = async () => {
    try {
      const response = await fetch(`/api/branches/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBranch(data)
      }
    } catch (error) {
      console.error("Error fetching branch info:", error)
    }
  }

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(() => {
      fetchDisplayData()
    }, 2000)
  }

  const startClock = () => {
    timeRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
  }

  const fetchDisplayData = async () => {
    try {
      const [servingResponse, queueResponse] = await Promise.all([
        fetch(`/api/display/now-serving?branchId=${params.id}`),
        fetch(`/api/display/waiting-queue?branchId=${params.id}`),
      ])

      if (servingResponse.ok) {
        const servingData = await servingResponse.json()
        setNowServing(servingData)
      }

      if (queueResponse.ok) {
        const queueData = await queueResponse.json()
        setWaitingQueue(queueData)
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error fetching display data:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Monitor className="h-16 w-16 text-slate-200" />
          <div>
            <h1 className="text-6xl font-bold">QueueFlow</h1>
            {branch && (
              <div className="flex items-center justify-center space-x-2 text-2xl text-slate-300 mt-2">
                <MapPin className="h-6 w-6" />
                <span>{branch.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center space-x-8 text-xl">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Updates</span>
          </div>
          <div className="text-slate-200">Last Updated: {lastUpdate.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Now Serving */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold text-white flex items-center justify-center space-x-4">
              <Bell className="h-10 w-10 text-yellow-300" />
              <span>NOW SERVING</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {nowServing.length > 0 ? (
              nowServing.map((token, index) => (
                <div
                  key={index}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-yellow-300/50"
                >
                  <div className="text-8xl font-bold text-yellow-300 mb-4 font-mono">{token.token_number}</div>
                  <div className="text-3xl font-semibold mb-2">Counter {token.counter_name}</div>
                  <div className="text-xl text-slate-100">{token.service_name}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl text-white/50 mb-4">---</div>
                <div className="text-2xl text-white/70">No tokens being served</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting Queue */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold text-white flex items-center justify-center space-x-4">
              <Users className="h-10 w-10 text-slate-300" />
              <span>WAITING QUEUE</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {waitingQueue.slice(0, 8).map((token) => (
                <div
                  key={token.id}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-4xl font-bold font-mono text-slate-200">{token.token_number}</div>
                    <div>
                      <div className="text-xl font-semibold">{token.service_name}</div>
                      <div className="text-lg text-slate-200">Position: {token.position_in_queue}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">~{token.estimated_wait_time}m</div>
                    <div className="text-sm text-slate-200">Est. Wait</div>
                  </div>
                </div>
              ))}

              {waitingQueue.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-4xl text-white/50 mb-4">No tokens waiting</div>
                  <div className="text-xl text-white/70">Queue is empty</div>
                </div>
              )}

              {waitingQueue.length > 8 && (
                <div className="text-center py-4 text-xl text-slate-200">
                  +{waitingQueue.length - 8} more tokens waiting...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="mt-12 grid md:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-300">{nowServing.length}</div>
            <div className="text-lg text-white/80">Being Served</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-slate-300">{waitingQueue.length}</div>
            <div className="text-lg text-white/80">In Queue</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-300">
              {waitingQueue.length > 0
                ? Math.round(waitingQueue.reduce((acc, t) => acc + t.estimated_wait_time, 0) / waitingQueue.length)
                : 0}
              m
            </div>
            <div className="text-lg text-white/80">Avg Wait</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-300">{currentTime.toLocaleDateString()}</div>
            <div className="text-lg text-white/80">Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 inline-block">
          <CardContent className="p-6">
            <div className="text-xl text-white/90">
              📱 Book your token at <span className="font-mono font-bold">QueueFlow.com/customer</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
