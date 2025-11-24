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

import { DashboardStats } from "@/components/dashboard-stats"
import { SearchFilterBar } from "@/components/search-filter-bar"
import { FormAppCard } from "@/components/formapp-card"
import { getCollectionPrograms } from "./actions/collection-programs"
import { CollectionProgramsClient } from "@/components/collection-programs-client"

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; sortBy?: string; sortOrder?: string }
}) {
  const page = parseInt(searchParams.page || "1", 10)
  const search = searchParams.search || ""
  const sortBy = (searchParams.sortBy as "name" | "id" | "entitiesCount") || "name"
  const sortOrder = (searchParams.sortOrder as "asc" | "desc") || "asc"

  const programsData = await getCollectionPrograms({
    page,
    pageSize: 12,
    search,
    sortBy,
    sortOrder,
  })

  return (
    <main className="w-full px-6 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Collection Programs</h2>
          <p className="text-sm text-muted-foreground">Manage and monitor your form applications</p>
        </div>

        <DashboardStats programs={programsData.data} />

        <CollectionProgramsClient initialData={programsData} />
      </div>
    </main>
  )
}
