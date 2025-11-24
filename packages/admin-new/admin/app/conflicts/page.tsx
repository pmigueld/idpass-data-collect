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

import { useState } from "react"
import { AlertCircle, CheckCircle, Clock, GitMerge, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { getAllConflicts } from "@/lib/mock-data"
import type { ConflictDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ConflictsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedConflict, setSelectedConflict] = useState<ConflictDetail | null>(null)

  const conflicts = getAllConflicts()

  const filteredConflicts = conflicts.filter((conflict) => {
    const matchesSearch =
      conflict.formAppName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.entityId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || conflict.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingCount = conflicts.filter((c) => c.status === "pending").length
  const resolvedCount = conflicts.filter((c) => c.status === "resolved").length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const getConflictTypeColor = (type: string) => {
    switch (type) {
      case "concurrent_update":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      case "network_partition":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      case "version_mismatch":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Not resolved"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatConflictType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conflicts</h1>
        <p className="text-muted-foreground mt-1">Manage and resolve data synchronization conflicts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conflicts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflicts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Resolution</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conflicts by FormApp, form, or entity ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredConflicts.map((conflict) => (
              <Card
                key={conflict.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedConflict(conflict)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(conflict.status))}>
                          {getStatusIcon(conflict.status)}
                          <span className="ml-1">{conflict.status}</span>
                        </Badge>
                        <Badge variant="outline" className={cn("text-xs", getConflictTypeColor(conflict.conflictType))}>
                          {formatConflictType(conflict.conflictType)}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono">
                          {conflict.conflictingFields.length} field{conflict.conflictingFields.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium">{conflict.formAppName}</div>
                        <div className="text-sm text-muted-foreground">{conflict.formName}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Entity: <code className="bg-muted px-1 py-0.5 rounded font-mono">{conflict.entityId}</code>
                        </span>
                        <span>•</span>
                        <span>Detected: {formatDate(conflict.detectedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-muted-foreground">Version Conflict</div>
                      <div className="text-sm font-mono">
                        v{conflict.localVersion} ↔ v{conflict.remoteVersion}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredConflicts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conflicts found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedConflict} onOpenChange={() => setSelectedConflict(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Conflict Details
            </DialogTitle>
            <DialogDescription>Review and resolve data synchronization conflicts</DialogDescription>
          </DialogHeader>
          {selectedConflict && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", getStatusColor(selectedConflict.status))}>
                  {getStatusIcon(selectedConflict.status)}
                  <span className="ml-1">{selectedConflict.status}</span>
                </Badge>
                <Badge variant="outline" className={cn("text-xs", getConflictTypeColor(selectedConflict.conflictType))}>
                  {formatConflictType(selectedConflict.conflictType)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">FormApp</div>
                  <div className="font-medium">{selectedConflict.formAppName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Form</div>
                  <div className="font-medium">{selectedConflict.formName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Entity ID</div>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{selectedConflict.entityId}</code>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Version Conflict</div>
                  <div className="font-mono">
                    v{selectedConflict.localVersion} ↔ v{selectedConflict.remoteVersion}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium mb-3">Conflicting Fields</div>
                <div className="space-y-3">
                  {selectedConflict.conflictingFields.map((field, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-3">
                        <div className="font-medium text-sm">{field.field}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Local Value</div>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-sm">
                              {JSON.stringify(field.localValue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remote Value</div>
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2 text-sm">
                              {JSON.stringify(field.remoteValue)}
                            </div>
                          </div>
                        </div>
                        {field.resolvedValue !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Resolved Value</div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-sm">
                              {JSON.stringify(field.resolvedValue)}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Detected At</div>
                  <div>{formatDate(selectedConflict.detectedAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Resolved At</div>
                  <div>{formatDate(selectedConflict.resolvedAt)}</div>
                </div>
                {selectedConflict.resolutionStrategy && (
                  <>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Resolution Strategy</div>
                      <Badge variant="outline" className="text-xs">
                        {selectedConflict.resolutionStrategy}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Resolved By</div>
                      <div>{selectedConflict.resolvedBy}</div>
                    </div>
                  </>
                )}
              </div>

              {selectedConflict.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Resolve with Local</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Resolve with Remote
                  </Button>
                  <Button variant="outline">Manual Merge</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
