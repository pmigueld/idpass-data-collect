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

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface ApiError {
  message: string
  status: number
}

class ApiClientError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiClientError"
  }
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("auth_token")?.value || null
}

async function createApiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken()
  const url = `${API_URL}${path}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    let errorMessage = errorText
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorJson.error || errorText
    } catch {
      // Not JSON, use text as-is
    }
    throw new ApiClientError(response.status, errorMessage)
  }

  return response
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await createApiRequest(path, { method: "GET" })
  return response.json()
}

export async function apiPost<T>(path: string, data?: unknown): Promise<T> {
  const response = await createApiRequest(path, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export async function apiPut<T>(path: string, data?: unknown): Promise<T> {
  const response = await createApiRequest(path, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await createApiRequest(path, { method: "DELETE" })
  return response.json()
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = await getAuthToken()
  const url = `${API_URL}${path}`

  const headers: HeadersInit = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    let errorMessage = errorText
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorJson.error || errorText
    } catch {
      // Not JSON, use text as-is
    }
    throw new ApiClientError(response.status, errorMessage)
  }

  return response.json()
}

export { ApiClientError }

