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
import { FileText, Users, Settings, Database } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: FileText, label: "FormApps", id: "formapps" },
  { icon: Users, label: "Users", id: "users" },
  { icon: Database, label: "Sync Status", id: "sync" },
  { icon: Settings, label: "Settings", id: "settings" },
]

interface DashboardNavProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function DashboardNav({ activeView, onViewChange }: DashboardNavProps) {
  return (
    <nav className="w-64 border-r border-border bg-muted/30 p-4">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
