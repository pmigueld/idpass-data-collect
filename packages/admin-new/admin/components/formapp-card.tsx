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
import Link from "next/link"
import {
  FileText,
  Database,
  Plug,
  MoreVertical,
  Copy,
  ExternalLink,
  Download,
  Archive,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FormApp } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FormAppCardProps {
  formApp: FormApp
}

export function FormAppCard({ formApp }: FormAppCardProps) {
  const syncPercentage =
    formApp.totalEntities > 0 ? Math.round((formApp.entitiesBackendSynced / formApp.totalEntities) * 100) : 0

  const externalSyncPercentage =
    formApp.entitiesBackendSynced > 0
      ? Math.round((formApp.entitiesExternalSynced / formApp.entitiesBackendSynced) * 100)
      : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "draft":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "archived":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <>
      <Link href={`/formapps/${formApp.id}`}>
        <div className="relative">
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                formApp.status.status === "active"
                  ? "bg-green-500"
                  : formApp.status.status === "draft"
                    ? "bg-yellow-500"
                    : "bg-gray-500",
              )}
              style={{ width: `${syncPercentage}%` }}
            />
          </div>
          <Card className="group transition-shadow hover:shadow-md cursor-pointer rounded-t-none">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{formApp.name}</h3>
                    <Badge variant="secondary" className={cn("text-xs", getStatusColor(formApp.status.status))}>
                      {formApp.status.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{formApp.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Forms</span>
                  </div>
                  <p className="text-2xl font-semibold">{formApp.formsCount}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Entities</p>
                  <p className="text-2xl font-semibold">{formApp.totalEntities}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Database className="h-3.5 w-3.5" />
                    <span>Backend Sync</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-semibold">{syncPercentage}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Plug className="h-3.5 w-3.5" />
                    <span>Service Status</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {formApp.status.status === "active" ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Healthy</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Inactive</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Synced</p>
                  <p className="text-xs font-medium">
                    {formApp.status.lastSyncedAt
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(formApp.status.lastSyncedAt)
                      : "Never"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground">Created by {formApp.createdBy}</span>
                <div className="flex items-center gap-2">
                  {formApp.externalIntegration && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {formApp.externalIntegration}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">v{formApp.version}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Link>
    </>
  )
}
