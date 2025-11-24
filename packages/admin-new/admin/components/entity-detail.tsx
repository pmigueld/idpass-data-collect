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

import { AlertCircle, CheckCircle, Clock, XCircle, Database, Plug, Calendar, Hash, GitBranch, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Entity, EventType } from "@/lib/types"
import { getEventsByEntityId } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface EntityDetailProps {
  entity: Entity
}

export function EntityDetail({ entity }: EntityDetailProps) {
  const events = getEventsByEntityId(entity.id)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "conflict":
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
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

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "entity_created":
        return <Zap className="h-4 w-4" />
      case "entity_updated":
        return <GitBranch className="h-4 w-4" />
      case "entity_deleted":
        return <XCircle className="h-4 w-4" />
      case "sync_started":
      case "external_sync_started":
        return <Clock className="h-4 w-4" />
      case "sync_completed":
      case "external_sync_completed":
        return <CheckCircle className="h-4 w-4" />
      case "sync_failed":
      case "external_sync_failed":
        return <XCircle className="h-4 w-4" />
      case "conflict_detected":
      case "conflict_resolved":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: string) => {
    if (type.includes("created")) return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    if (type.includes("updated")) return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
    if (type.includes("deleted")) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    if (type.includes("conflict")) return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
    if (type.includes("completed")) return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    if (type.includes("failed")) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    if (type.includes("started")) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const formatEventType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="flex gap-6">
      {/* Left column - Entity data and event history */}
      <div className="flex-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entity Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono">
              {JSON.stringify(entity.data, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Stream ({events.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {events.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== events.length - 1 && (
                      <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2",
                          getEventTypeColor(event.type),
                        )}
                      >
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1 space-y-2 pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn("text-xs font-medium", getEventTypeColor(event.type))}
                              >
                                {formatEventType(event.type)}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-mono">
                                v{event.metadata.version}
                              </Badge>
                              {event.metadata.streamPosition !== undefined && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  #{event.metadata.streamPosition}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{formatDate(event.timestamp)}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{event.userName}</span>
                            <span className="text-muted-foreground">•</span>
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{event.deviceId}</code>
                          </div>
                          {Object.keys(event.data).length > 0 && (
                            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                              <div className="text-xs font-medium text-muted-foreground">Event Payload</div>
                              <pre className="text-xs font-mono overflow-x-auto">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {event.metadata.previousVersion && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <GitBranch className="h-3 w-3" />
                              <span>
                                v{event.metadata.previousVersion} → v{event.metadata.version}
                              </span>
                            </div>
                          )}
                          {event.metadata.conflictResolution && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2">
                              <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                                Conflict resolved using: {event.metadata.conflictResolution}
                              </p>
                            </div>
                          )}
                          {event.metadata.errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                              <p className="text-xs font-medium text-red-700 dark:text-red-400">
                                Error: {event.metadata.errorMessage}
                              </p>
                            </div>
                          )}
                          {event.metadata.syncDuration && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Duration: {event.metadata.syncDuration}ms
                            </p>
                          )}
                          {(event.metadata.causationId || event.metadata.correlationId) && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
                                Event Metadata
                              </summary>
                              <div className="mt-2 space-y-1 bg-muted/50 p-2 rounded">
                                {event.metadata.causationId && (
                                  <div className="font-mono">
                                    <span className="text-muted-foreground">Causation:</span>{" "}
                                    {event.metadata.causationId}
                                  </div>
                                )}
                                {event.metadata.correlationId && (
                                  <div className="font-mono">
                                    <span className="text-muted-foreground">Correlation:</span>{" "}
                                    {event.metadata.correlationId}
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Stats and metadata */}
      <div className="w-80 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status & Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Current Status</div>
              <Badge variant="secondary" className={cn("text-sm gap-2", getStatusColor(entity.status))}>
                {getStatusIcon(entity.status)}
                {entity.status}
              </Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Version
                </div>
                <div className="text-lg font-bold">v{entity.version}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Events</div>
                <div className="text-lg font-bold">{entity.eventCount}</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Backend
                </div>
                {entity.backendSynced ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Synced</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Not Synced</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Plug className="h-3 w-3" />
                  External
                </div>
                {entity.externalSynced ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Synced</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">Not Synced</span>
                  </div>
                )}
              </div>
            </div>
            {entity.conflictCount > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Conflicts</span>
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700">
                    {entity.conflictCount}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Entity ID</div>
              <code className="font-mono text-xs bg-muted px-2 py-1 rounded block break-all">{entity.id}</code>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Form</div>
              <div className="font-medium">{entity.formName}</div>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Created At</div>
              <div className="text-xs">{formatDate(entity.createdAt)}</div>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Updated At</div>
              <div className="text-xs">{formatDate(entity.updatedAt)}</div>
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Last Synced</div>
              <div className="text-xs">{formatDate(entity.lastSyncedAt)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
