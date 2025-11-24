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
import type { ExternalAuthenticationConfig } from "@/lib/types"

interface IntegrationAuthSectionProps {
  integrationService: string
  authConfig: ExternalAuthenticationConfig
  onChange: (config: ExternalAuthenticationConfig) => void
}

export function IntegrationAuthSection({ integrationService, authConfig, onChange }: IntegrationAuthSectionProps) {
  const getIntegrationLabel = (service: string) => {
    const labels: Record<string, string> = {
      openfn: "OpenFn",
      openspp: "OpenSPP",
      generic_mock: "Generic Mock",
    }
    return labels[service] || service
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{getIntegrationLabel(integrationService)} Authentication</h3>
        <p className="text-sm text-muted-foreground">
          Configure authentication for syncing data to {getIntegrationLabel(integrationService)}
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {authConfig.type === "none" && (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">No authentication configured</p>
            </div>
          )}

          {authConfig.type === "basic" && (
            <>
              <div>
                <Label htmlFor="external-basic-username">Username</Label>
                <Input
                  id="external-basic-username"
                  placeholder="Enter username"
                  value={authConfig.config?.username || ""}
                  onChange={(e) =>
                    onChange({
                      type: "basic",
                      config: { ...authConfig.config, username: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="external-basic-password">Password</Label>
                <Input
                  id="external-basic-password"
                  type="password"
                  placeholder="Enter password"
                  value={authConfig.config?.password || ""}
                  onChange={(e) =>
                    onChange({
                      type: "basic",
                      config: { ...authConfig.config, password: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {authConfig.type === "keycloak" && (
            <>
              <div>
                <Label htmlFor="external-keycloak-url">Keycloak URL</Label>
                <Input
                  id="external-keycloak-url"
                  placeholder="https://keycloak.example.com"
                  value={authConfig.config?.keycloakUrl || ""}
                  onChange={(e) =>
                    onChange({
                      type: "keycloak",
                      config: { ...authConfig.config, keycloakUrl: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="external-keycloak-realm">Realm</Label>
                <Input
                  id="external-keycloak-realm"
                  placeholder="Enter realm name"
                  value={authConfig.config?.keycloakRealm || ""}
                  onChange={(e) =>
                    onChange({
                      type: "keycloak",
                      config: { ...authConfig.config, keycloakRealm: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {authConfig.type === "auth0" && (
            <>
              <div>
                <Label htmlFor="external-auth0-domain">Auth0 Domain</Label>
                <Input
                  id="external-auth0-domain"
                  placeholder="your-domain.auth0.com"
                  value={authConfig.config?.auth0Domain || ""}
                  onChange={(e) =>
                    onChange({
                      type: "auth0",
                      config: { ...authConfig.config, auth0Domain: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="external-auth0-client-id">Client ID</Label>
                <Input
                  id="external-auth0-client-id"
                  placeholder="Enter Client ID"
                  value={authConfig.config?.auth0ClientId || ""}
                  onChange={(e) =>
                    onChange({
                      type: "auth0",
                      config: { ...authConfig.config, auth0ClientId: e.target.value },
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
