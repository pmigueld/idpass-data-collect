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
import { Search, Filter, AlertCircle, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getEntitiesByFormAppId } from "@/lib/mock-data"
import type { Entity } from "@/lib/types"
import { EntityDetail } from "@/components/entity-detail"
import { cn } from "@/lib/utils"

interface EntityListProps {
  formAppId: string
}

export function EntityList({ formAppId }: EntityListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)

  const entities = getEntitiesByFormAppId(formAppId)

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(entity.data).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || entity.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "conflict":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "conflict":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400"
      case "failed":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entities by ID, form name, or data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="synced">Synced</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="conflict">Conflict</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity ID</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Backend</TableHead>
              <TableHead>External</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead>Events</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No entities found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntities.map((entity) => (
                <TableRow
                  key={entity.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEntity(entity)}
                >
                  <TableCell className="font-mono text-sm">{entity.id}</TableCell>
                  <TableCell>{entity.formName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("text-xs gap-1", getStatusColor(entity.status))}>
                      {getStatusIcon(entity.status)}
                      {entity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">v{entity.version}</TableCell>
                  <TableCell>
                    {entity.backendSynced ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    {entity.externalSynced ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(entity.lastSyncedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {entity.eventCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
        <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entity Details</DialogTitle>
          </DialogHeader>
          {selectedEntity && <EntityDetail entity={selectedEntity} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
