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
import { apiGet, apiPost, apiPut, apiDelete, ApiClientError } from "@/lib/api-client"

export interface BackendUser {
  id: number
  email: string
  role: string
}

export interface CreateUserInput {
  email: string
  password: string
  role: string
}

export interface UpdateUserInput {
  id: string
  email: string
  password: string
  role: string
}

export async function getUsers(): Promise<BackendUser[]> {
  try {
    return await apiGet<BackendUser[]>("/api/users")
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    throw new Error("Failed to fetch users")
  }
}

export async function createUser(input: CreateUserInput) {
  try {
    await apiPost("/api/users", input)
    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to create user" }
  }
}

export async function updateUser(input: UpdateUserInput) {
  try {
    await apiPut(`/api/users/${input.id}`, {
      email: input.email,
      password: input.password,
      role: input.role,
    })
    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to update user" }
  }
}

export async function deleteUser(email: string) {
  try {
    await apiDelete(`/api/users/${email}`)
    revalidatePath("/users")
    return { success: true }
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to delete user" }
  }
}

