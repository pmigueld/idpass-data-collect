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

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { InternalAuthenticationConfig } from "@/lib/types"

interface InternalAuthConfigSectionProps {
  authType: "none" | "basic" | "keycloak" | "auth0"
  config: InternalAuthenticationConfig
  onChange: (config: InternalAuthenticationConfig) => void
}

export function InternalAuthConfigSection({ authType, config, onChange }: InternalAuthConfigSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Internal Authentication Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure how users and mobile apps authenticate to access forms and sync data
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {authType === "none" && (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No authentication required. Users and mobile apps can access forms without credentials.
              </p>
            </div>
          )}

          {authType === "basic" && (
            <>
              <div>
                <Label htmlFor="internal-basic-username">Default Username</Label>
                <Input
                  id="internal-basic-username"
                  placeholder="Enter default username"
                  value={config.config?.username || ""}
                  onChange={(e) =>
                    onChange({
                      type: "basic",
                      config: { ...config.config, username: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="internal-basic-password">Default Password</Label>
                <Input
                  id="internal-basic-password"
                  type="password"
                  placeholder="Enter default password"
                  value={config.config?.password || ""}
                  onChange={(e) =>
                    onChange({
                      type: "basic",
                      config: { ...config.config, password: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {authType === "keycloak" && (
            <>
              <div>
                <Label htmlFor="internal-keycloak-url">Keycloak URL</Label>
                <Input
                  id="internal-keycloak-url"
                  placeholder="https://keycloak.example.com"
                  value={config.config?.keycloakUrl || ""}
                  onChange={(e) =>
                    onChange({
                      type: "keycloak",
                      config: { ...config.config, keycloakUrl: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="internal-keycloak-realm">Realm</Label>
                <Input
                  id="internal-keycloak-realm"
                  placeholder="Enter realm name"
                  value={config.config?.keycloakRealm || ""}
                  onChange={(e) =>
                    onChange({
                      type: "keycloak",
                      config: { ...config.config, keycloakRealm: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {authType === "auth0" && (
            <>
              <div>
                <Label htmlFor="internal-auth0-domain">Auth0 Domain</Label>
                <Input
                  id="internal-auth0-domain"
                  placeholder="your-domain.auth0.com"
                  value={config.config?.auth0Domain || ""}
                  onChange={(e) =>
                    onChange({
                      type: "auth0",
                      config: { ...config.config, auth0Domain: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="internal-auth0-client-id">Client ID</Label>
                <Input
                  id="internal-auth0-client-id"
                  placeholder="Enter Client ID"
                  value={config.config?.auth0ClientId || ""}
                  onChange={(e) =>
                    onChange({
                      type: "auth0",
                      config: { ...config.config, auth0ClientId: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
