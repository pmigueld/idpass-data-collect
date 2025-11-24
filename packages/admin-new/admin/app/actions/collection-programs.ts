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

"use server"

import { revalidatePath } from "next/cache"
import { apiGet, apiPostFormData, apiDelete, ApiClientError } from "@/lib/api-client"

export interface CollectionProgram {
  id: string
  artifactId: string
  name: string
  version: string
  externalSync: Record<string, string>
  entitiesCount: number
  description: string
}

export interface CollectionProgramListResponse {
  data: CollectionProgram[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    sortBy: string
    sortOrder: string
    search: string
  }
}

export interface CollectionProgramDetail {
  id: string
  artifactId: string
  name: string
  version: string
  description?: string
  entityForms?: Array<{
    id: string
    name: string
    description: string
    formSchema: Record<string, unknown>
    version: string
  }>
  entityData?: Array<Record<string, unknown>>
  externalSync?: {
    type: string
    auth?: Record<string, unknown>
    url?: string
  }
}

export interface GetCollectionProgramsParams {
  page?: number
  pageSize?: number
  sortBy?: "name" | "id" | "entitiesCount"
  sortOrder?: "asc" | "desc"
  search?: string
}

export async function getCollectionPrograms(
  params: GetCollectionProgramsParams = {}
): Promise<CollectionProgramListResponse> {
  try {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.set("page", params.page.toString())
    if (params.pageSize) queryParams.set("pageSize", params.pageSize.toString())
    if (params.sortBy) queryParams.set("sortBy", params.sortBy)
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder)
    if (params.search) queryParams.set("search", params.search)

    const queryString = queryParams.toString()
    return await apiGet<CollectionProgramListResponse>(`/api/apps${queryString ? `?${queryString}` : ""}`)
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    throw new Error("Failed to fetch collection programs")
  }
}

export async function getCollectionProgram(id: string): Promise<CollectionProgramDetail> {
  try {
    return await apiGet<CollectionProgramDetail>(`/api/apps/${id}`)
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    throw new Error("Failed to fetch collection program")
  }
}

export async function createCollectionProgram(formData: FormData) {
  try {
    const result = await apiPostFormData<{ status: string; artifactId: string }>("/api/apps", formData)
    revalidatePath("/")
    revalidatePath("/collection-programs")
    return { success: true, artifactId: result.artifactId }
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to create collection program" }
  }
}

export async function deleteCollectionProgram(id: string) {
  try {
    await apiDelete(`/api/apps/${id}`)
    revalidatePath("/")
    revalidatePath("/collection-programs")
    return { success: true }
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to delete collection program" }
  }
}

