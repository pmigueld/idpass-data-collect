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

import { FileText, Database, Plug, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CollectionProgram } from "@/app/actions/collection-programs"

interface DashboardStatsProps {
  programs: CollectionProgram[]
}

export function DashboardStats({ programs }: DashboardStatsProps) {
  const totalFormApps = programs.length
  const activeFormApps = programs.length // All programs are considered active for now
  const totalForms = 0 // Backend doesn't provide this directly
  const totalBackendSynced = programs.reduce((sum, app) => sum + app.entitiesCount, 0)
  const totalExternalSynced = totalBackendSynced // Simplified for now
  const healthyApps = programs.length // All considered healthy for now

  const stats = [
    {
      title: "Total Collection Programs",
      value: totalFormApps,
      subtitle: `${activeFormApps} active`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Total Forms",
      value: totalForms,
      subtitle: "Across all apps",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      title: "Backend Synced",
      value: totalBackendSynced.toLocaleString(),
      subtitle: "Total entities",
      icon: Database,
      color: "text-green-600",
    },
    {
      title: "External Synced",
      value: totalExternalSynced.toLocaleString(),
      subtitle: "To integrations",
      icon: Plug,
      color: "text-orange-600",
    },
    {
      title: "Sync Health",
      value: `${Math.round((healthyApps / totalFormApps) * 100)}%`,
      subtitle: `${healthyApps} healthy`,
      icon: Activity,
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
