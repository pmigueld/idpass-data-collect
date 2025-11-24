/*
 * Licensed to the Association pour la cooperation numerique (ACN) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ACN licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserIcon, Mail, Shield, Calendar, Plus, MoreVertical, Trash2, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddUserModal } from "./add-user-modal"
import { createUser, deleteUser, type BackendUser } from "@/app/actions/users"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface UserManagementProps {
  initialUsers: BackendUser[]
}

export function UserManagement({ initialUsers }: UserManagementProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState(initialUsers)
  const [addUserOpen, setAddUserOpen] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      case "program_manager":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "data_analyst":
        return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
      case "integration_manager":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      case "viewer":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "program_manager":
        return "Program Manager"
      case "data_analyst":
        return "Data Analyst"
      case "integration_manager":
        return "Integration Manager"
      case "viewer":
        return "Viewer"
      default:
        return role
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj)
  }

  const handleAddUser = async (formData: { name: string; email: string; role: string; password: string }) => {
    startTransition(async () => {
      const result = await createUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })

      if (result.success) {
        toast.success("User created successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create user")
      }
    })
  }

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteUser(email)

      if (result.success) {
        toast.success("User deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete user")
      }
    })
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">User Management</h2>
            <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button className="gap-2" onClick={() => setAddUserOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{user.email.split("@")[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("capitalize", getRoleBadgeColor(user.role))}>
                        <Shield className="mr-1 h-3 w-3" />
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        N/A
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">N/A</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user.email)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AddUserModal
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onAddUser={handleAddUser}
        isLoading={isPending}
      />
    </>
  )
}
