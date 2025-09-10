"use client"

import { useState, useEffect, useRef } from "react"

interface UseRealTimeQueueOptions {
  endpoint: string
  interval?: number
  onUpdate?: (data: any) => void
}

export function useRealTimeQueue<T>({ endpoint, interval = 5000, onUpdate }: UseRealTimeQueueOptions) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async (silent = false) => {
    try {
      const response = await fetch(endpoint)
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
        if (onUpdate) {
          onUpdate(newData)
        }
        setError(null)
      } else {
        throw new Error("Failed to fetch data")
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchData()

    // Start real-time updates
    intervalRef.current = setInterval(() => {
      fetchData(true)
    }, interval)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [endpoint, interval])

  const refresh = () => {
    setIsLoading(true)
    fetchData()
  }

  return { data, isLoading, error, refresh }
}
