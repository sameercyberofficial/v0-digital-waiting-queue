"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ArrowLeft, QrCode } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TrackToken() {
  const [tokenNumber, setTokenNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleTrackToken = async () => {
    if (!tokenNumber || !phoneNumber) {
      alert("Please enter both token number and phone number")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tokens/track?token=${tokenNumber}&phone=${phoneNumber}`)

      if (response.ok) {
        const token = await response.json()
        router.push(`/customer/token/${token.id}`)
      } else {
        alert("Token not found. Please check your token number and phone number.")
      }
    } catch (error) {
      console.error("Error tracking token:", error)
      alert("Failed to track token. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/customer" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Token</h1>
          <p className="text-gray-600">Enter your token details to check status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Token Tracking</span>
            </CardTitle>
            <CardDescription>Enter your token number and phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="token">Token Number</Label>
              <Input
                id="token"
                type="text"
                placeholder="e.g., A001, B025"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button onClick={handleTrackToken} className="w-full" disabled={isLoading || !tokenNumber || !phoneNumber}>
              {isLoading ? "Tracking..." : "Track Token"}
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Don't have a token yet?</p>
              <Link href="/customer">
                <Button variant="outline" size="sm">
                  Book New Token
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
