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
import { redirect } from "next/navigation"
import { apiGet } from "./api-client"

export interface Session {
  userId: string
  email: string
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify token by calling backend check-token endpoint
    await apiGet<{ message: string }>("/api/users/check-token")
    
    // If we get here, token is valid
    // We need to decode it to get user info, but for now we'll fetch from /me
    const user = await apiGet<{ id: string; email: string; role: string }>("/api/users/me")
    
    return {
      userId: user.id.toString(),
      email: user.email,
    }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

