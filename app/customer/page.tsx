"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, QrCode, MapPin, Phone, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Branch {
  id: number
  name: string
  address: string
  phone: string
}

interface Service {
  id: number
  name: string
  description: string
  estimated_duration: number
}

export default function CustomerPortal() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchServices(selectedBranch)
    }
  }, [selectedBranch])

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches")
      const data = await response.json()
      setBranches(data)
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  const fetchServices = async (branchId: string) => {
    try {
      const response = await fetch(`/api/services?branchId=${branchId}`)
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const handleBookToken = async () => {
    if (!selectedBranch || !selectedService || !customerName || !customerPhone) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchId: Number.parseInt(selectedBranch),
          serviceId: Number.parseInt(selectedService),
          customerName,
          customerPhone,
        }),
      })

      if (response.ok) {
        const token = await response.json()
        router.push(`/customer/token/${token.id}`)
      } else {
        alert("Failed to book token. Please try again.")
      }
    } catch (error) {
      console.error("Error booking token:", error)
      alert("Failed to book token. Please try again.")
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
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2 ml-6">
              <Clock className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Your Token</h2>
          <p className="text-gray-600">Select a branch and service to get your queue token</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Token Booking</span>
              </CardTitle>
              <CardDescription>Fill in your details to book a token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="branch">Select Branch *</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBranch && (
                <div>
                  <Label htmlFor="service">Select Service *</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-500">Est. {service.estimated_duration} minutes</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <Button
                onClick={handleBookToken}
                className="w-full"
                disabled={isLoading || !selectedBranch || !selectedService || !customerName || !customerPhone}
              >
                {isLoading ? "Booking..." : "Book Token"}
              </Button>
            </CardContent>
          </Card>

          {/* Branch Info */}
          {selectedBranch && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Branch Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {branches
                  .filter((branch) => branch.id.toString() === selectedBranch)
                  .map((branch) => (
                    <div key={branch.id} className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{branch.name}</h3>
                        <p className="text-gray-600 flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{branch.address}</span>
                        </p>
                        <p className="text-gray-600 flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{branch.phone}</span>
                        </p>
                      </div>

                      {selectedService && (
                        <div className="border-t pt-3">
                          <h4 className="font-medium mb-2">Selected Service</h4>
                          {services
                            .filter((service) => service.id.toString() === selectedService)
                            .map((service) => (
                              <div key={service.id} className="bg-blue-50 p-3 rounded-lg">
                                <h5 className="font-medium">{service.name}</h5>
                                <p className="text-sm text-gray-600">{service.description}</p>
                                <p className="text-sm text-blue-600 mt-1">
                                  Estimated Duration: {service.estimated_duration} minutes
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Already have a token?</h3>
              <Link href="/customer/track">
                <Button variant="outline">Track Your Token</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
