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
import { useRouter } from "next/navigation"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { FormAppCard } from "@/components/formapp-card"
import type { CollectionProgramListResponse, CollectionProgram } from "@/app/actions/collection-programs"

interface CollectionProgramsClientProps {
  initialData: CollectionProgramListResponse
}

export function CollectionProgramsClient({ initialData }: CollectionProgramsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")
  const [creatorFilter, setCreatorFilter] = useState("all")

  // Transform backend data to match FormAppCard expectations
  const transformedPrograms: Array<{
    id: string
    name: string
    description: string
    version: string
    formsCount: number
    entitiesBackendSynced: number
    entitiesExternalSynced: number
    totalEntities: number
    deploymentUrl: string
    qrCodeData: string
    createdAt: Date
    updatedAt: Date
    createdBy: string
    status: {
      status: "active" | "draft" | "archived"
      lastSyncedAt: Date | null
      syncHealth: "healthy" | "warning" | "error"
    }
    externalIntegration: string | null
  }> = initialData.data.map((program) => ({
    id: program.id,
    name: program.name,
    description: program.description,
    version: program.version,
    formsCount: 0, // Backend doesn't provide this directly
    entitiesBackendSynced: program.entitiesCount,
    entitiesExternalSynced: program.entitiesCount, // Simplified for now
    totalEntities: program.entitiesCount,
    deploymentUrl: "", // Will need to construct from artifactId
    qrCodeData: "", // Will need to construct from artifactId
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "System",
    status: {
      status: "active" as const,
      lastSyncedAt: null,
      syncHealth: "healthy" as const,
    },
    externalIntegration: program.externalSync?.type || null,
  }))

  const filteredPrograms = transformedPrograms.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status.status === statusFilter
    const matchesHealth = healthFilter === "all" || app.status.syncHealth === healthFilter
    const matchesCreator = creatorFilter === "all" || app.createdBy === creatorFilter

    return matchesSearch && matchesStatus && matchesHealth && matchesCreator
  })

  const creators = Array.from(new Set(transformedPrograms.map((app) => app.createdBy))).sort()

  return (
    <>
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        healthFilter={healthFilter}
        onHealthFilterChange={setHealthFilter}
        creatorFilter={creatorFilter}
        onCreatorFilterChange={setCreatorFilter}
        creators={creators}
        onCreateNew={() => {
          router.push("/collection-programs/new")
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((program) => (
          <FormAppCard key={program.id} formApp={program} />
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No Collection Programs found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </>
  )
}

