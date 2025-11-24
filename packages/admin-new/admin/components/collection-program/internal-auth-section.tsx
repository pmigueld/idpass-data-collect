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
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InternalAuthenticationConfig } from "@/lib/types"

interface InternalAuthSectionProps {
  config: InternalAuthenticationConfig
  onChange: (config: InternalAuthenticationConfig) => void
}

export function InternalAuthSection({ config, onChange }: InternalAuthSectionProps) {
  const [basicUsername, setBasicUsername] = useState("")
  const [basicPassword, setBasicPassword] = useState("")

  const handleAuthTypeChange = (type: string) => {
    setBasicUsername("")
    setBasicPassword("")
    onChange({
      type: type as InternalAuthenticationConfig["type"],
    })
  }

  const handleBasicAuthChange = (username: string, password: string) => {
    setBasicUsername(username)
    setBasicPassword(password)
    onChange({
      type: "basic",
      config: { username, password },
    })
  }

  const handleKeycloakChange = (url: string, realm: string) => {
    onChange({
      type: "keycloak",
      config: { keycloakUrl: url, keycloakRealm: realm },
    })
  }

  const handleAuth0Change = (domain: string, clientId: string) => {
    onChange({
      type: "auth0",
      config: { auth0Domain: domain, auth0ClientId: clientId },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Internal Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Configure how users and mobile apps authenticate to access forms and sync data to the backend
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="internal-auth-type">Authentication Method</Label>
            <Select value={config.type} onValueChange={handleAuthTypeChange}>
              <SelectTrigger id="internal-auth-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Default - No Authentication)</SelectItem>
                <SelectItem value="basic">Basic Auth (Username/Password)</SelectItem>
                <SelectItem value="keycloak">Keycloak</SelectItem>
                <SelectItem value="auth0">Auth0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.type === "basic" && (
            <>
              <div>
                <Label htmlFor="internal-basic-username">Username</Label>
                <Input
                  id="internal-basic-username"
                  placeholder="Enter default username"
                  value={basicUsername}
                  onChange={(e) => handleBasicAuthChange(e.target.value, basicPassword)}
                />
              </div>
              <div>
                <Label htmlFor="internal-basic-password">Password</Label>
                <Input
                  id="internal-basic-password"
                  type="password"
                  placeholder="Enter default password"
                  value={basicPassword}
                  onChange={(e) => handleBasicAuthChange(basicUsername, e.target.value)}
                />
              </div>
            </>
          )}

          {config.type === "keycloak" && (
            <>
              <div>
                <Label htmlFor="internal-keycloak-url">Keycloak URL</Label>
                <Input
                  id="internal-keycloak-url"
                  placeholder="https://keycloak.example.com"
                  value={config.config?.keycloakUrl || ""}
                  onChange={(e) => handleKeycloakChange(e.target.value, config.config?.keycloakRealm || "")}
                />
              </div>
              <div>
                <Label htmlFor="internal-keycloak-realm">Realm</Label>
                <Input
                  id="internal-keycloak-realm"
                  placeholder="Enter realm name"
                  value={config.config?.keycloakRealm || ""}
                  onChange={(e) => handleKeycloakChange(config.config?.keycloakUrl || "", e.target.value)}
                />
              </div>
            </>
          )}

          {config.type === "auth0" && (
            <>
              <div>
                <Label htmlFor="internal-auth0-domain">Auth0 Domain</Label>
                <Input
                  id="internal-auth0-domain"
                  placeholder="your-domain.auth0.com"
                  value={config.config?.auth0Domain || ""}
                  onChange={(e) => handleAuth0Change(e.target.value, config.config?.auth0ClientId || "")}
                />
              </div>
              <div>
                <Label htmlFor="internal-auth0-client-id">Client ID</Label>
                <Input
                  id="internal-auth0-client-id"
                  placeholder="Enter Client ID"
                  value={config.config?.auth0ClientId || ""}
                  onChange={(e) => handleAuth0Change(config.config?.auth0Domain || "", e.target.value)}
                />
              </div>
            </>
          )}

          {config.type === "none" && (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No authentication required. Users and mobile apps can access forms without credentials.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
