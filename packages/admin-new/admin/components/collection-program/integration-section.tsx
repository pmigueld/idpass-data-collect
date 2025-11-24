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
import type { IntegrationConfig, ExternalAuthenticationConfig } from "@/lib/types"

interface IntegrationSectionProps {
  config: IntegrationConfig
  onChange: (config: IntegrationConfig) => void
}

export function IntegrationSection({ config, onChange }: IntegrationSectionProps) {
  const [authType, setAuthType] = useState<ExternalAuthenticationConfig["type"]>("none")
  const [basicUsername, setBasicUsername] = useState("")
  const [basicPassword, setBasicPassword] = useState("")

  const handleIntegrationTypeChange = (type: string) => {
    onChange({
      ...config,
      type: (type === "none" ? null : type) as any,
    })
  }

  const handleAuthTypeChange = (type: string) => {
    setAuthType(type as ExternalAuthenticationConfig["type"])
    onChange({
      ...config,
      authentication: {
        type: type as ExternalAuthenticationConfig["type"],
      },
    })
  }

  const handleBasicAuthChange = (username: string, password: string) => {
    setBasicUsername(username)
    setBasicPassword(password)
    onChange({
      ...config,
      authentication: {
        type: "basic",
        config: { username, password },
      },
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">External Integration</h3>
        <p className="text-sm text-muted-foreground">
          Configure external services to sync collected data with (e.g., OpenSPP, OpenFn)
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="integration-type">Integration Service</Label>
            <Select value={config.type || "none"} onValueChange={handleIntegrationTypeChange}>
              <SelectTrigger id="integration-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="openfn">OpenFn</SelectItem>
                <SelectItem value="openspp">OpenSPP</SelectItem>
                <SelectItem value="generic_mock">Generic Mock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.type && (
            <>
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://api.example.com/webhook"
                  value={config.webhookUrl || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      webhookUrl: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="api-key">API Key (Optional)</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter API key if required"
                  value={config.apiKey || ""}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      apiKey: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {config.type && (
        <Card className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="external-auth-type">External Service Authentication</Label>
              <Select value={authType} onValueChange={handleAuthTypeChange}>
                <SelectTrigger id="external-auth-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Default)</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="keycloak">Keycloak</SelectItem>
                  <SelectItem value="auth0">Auth0</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {authType === "basic" && (
              <>
                <div>
                  <Label htmlFor="external-basic-username">Username</Label>
                  <Input
                    id="external-basic-username"
                    placeholder="Enter username"
                    value={basicUsername}
                    onChange={(e) => handleBasicAuthChange(e.target.value, basicPassword)}
                  />
                </div>
                <div>
                  <Label htmlFor="external-basic-password">Password</Label>
                  <Input
                    id="external-basic-password"
                    type="password"
                    placeholder="Enter password"
                    value={basicPassword}
                    onChange={(e) => handleBasicAuthChange(basicUsername, e.target.value)}
                  />
                </div>
              </>
            )}

            {authType === "keycloak" && (
              <>
                <div>
                  <Label htmlFor="external-keycloak-url">Keycloak URL</Label>
                  <Input id="external-keycloak-url" placeholder="https://keycloak.example.com" />
                </div>
                <div>
                  <Label htmlFor="external-keycloak-realm">Realm</Label>
                  <Input id="external-keycloak-realm" placeholder="Enter realm name" />
                </div>
              </>
            )}

            {authType === "auth0" && (
              <>
                <div>
                  <Label htmlFor="external-auth0-domain">Auth0 Domain</Label>
                  <Input id="external-auth0-domain" placeholder="your-domain.auth0.com" />
                </div>
                <div>
                  <Label htmlFor="external-auth0-client-id">Client ID</Label>
                  <Input id="external-auth0-client-id" placeholder="Enter Client ID" />
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {!config.type && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select an integration service to configure external data synchronization
          </p>
        </div>
      )}
    </div>
  )
}
