"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react"

interface Staff {
  id: number
  name: string
  email: string
  role: string
  status: string
  branch_name: string
  counter_name?: string
  created_at: string
}

interface Counter {
  id: number
  name: string
  status: string
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [counters, setCounters] = useState<Counter[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff",
    counter_id: "0", // Updated default value to be a non-empty string
  })

  useEffect(() => {
    fetchStaff()
    fetchCounters()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff")
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error("Error fetching staff:", error)
    }
  }

  const fetchCounters = async () => {
    try {
      const response = await fetch("/api/admin/counters")
      if (response.ok) {
        const data = await response.json()
        setCounters(data)
      }
    } catch (error) {
      console.error("Error fetching counters:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingStaff ? `/api/admin/staff/${editingStaff.id}` : "/api/admin/staff"
      const method = editingStaff ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchStaff()
        setShowAddForm(false)
        setEditingStaff(null)
        setFormData({ name: "", email: "", role: "staff", counter_id: "0" }) // Updated default value to be a non-empty string
      } else {
        alert("Failed to save staff member")
      }
    } catch (error) {
      console.error("Error saving staff:", error)
      alert("Failed to save staff member")
    }
  }

  const toggleStaffStatus = async (staffId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"

    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchStaff()
      } else {
        alert("Failed to update staff status")
      }
    } catch (error) {
      console.error("Error updating staff status:", error)
      alert("Failed to update staff status")
    }
  }

  const deleteStaff = async (staffId: number) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return

    try {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchStaff()
      } else {
        alert("Failed to delete staff member")
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      alert("Failed to delete staff member")
    }
  }

  const startEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      counter_id: staffMember.counter_name ? staffMember.counter_name : "0", // Updated default value to be a non-empty string
    })
    setShowAddForm(true)
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "supervisor":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Staff Management</h1>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</CardTitle>
              <CardDescription>
                {editingStaff ? "Update staff member information" : "Add a new staff member to the system"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="counter">Assigned Counter (Optional)</Label>
                    <Select
                      value={formData.counter_id}
                      onValueChange={(value) => setFormData({ ...formData, counter_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select counter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Counter</SelectItem> {/* Updated value to be a non-empty string */}
                        {counters.map((counter) => (
                          <SelectItem key={counter.id} value={counter.id.toString()}>
                            {counter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">{editingStaff ? "Update" : "Add"} Staff Member</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingStaff(null)
                      setFormData({ name: "", email: "", role: "staff", counter_id: "0" }) // Updated default value to be a non-empty string
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>Manage your staff members and their assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-sm text-gray-500">{member.branch_name}</p>
                      {member.counter_name && <p className="text-sm text-blue-600">Counter: {member.counter_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getRoleColor(member.role)}>{member.role.toUpperCase()}</Badge>
                    <Badge className={getStatusColor(member.status)}>{member.status.toUpperCase()}</Badge>
                    <div className="flex space-x-2">
                      <Button onClick={() => startEdit(member)} size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => toggleStaffStatus(member.id, member.status)}
                        size="sm"
                        variant="outline"
                        className={member.status === "active" ? "text-red-600" : "text-green-600"}
                      >
                        {member.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={() => deleteStaff(member.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {staff.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No staff members found. Add your first staff member to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
