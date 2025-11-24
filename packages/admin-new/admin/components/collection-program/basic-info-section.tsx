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

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface BasicInfoSectionProps {
  data: {
    name: string
    description: string
    version: string
    integrationService: "openfn" | "openspp" | "generic_mock" | null
    internalAuthType: "none" | "basic" | "keycloak" | "auth0"
    internalAuthUsername?: string
    internalAuthPassword?: string
    internalAuthKeycloakUrl?: string
    internalAuthKeycloakRealm?: string
    internalAuthAuth0Domain?: string
    internalAuthAuth0ClientId?: string
  }
  onChange: (data: any) => void
}

export function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const validateVersion = (version: string) => {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$/
    return semverRegex.test(version)
  }

  const isVersionValid = validateVersion(data.version) || data.version === ""

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Define the basic details and initial configuration of your collection program
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="program-name">Program Name</Label>
          <Input
            id="program-name"
            placeholder="e.g., Health Survey 2024"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="program-description">Description</Label>
          <Textarea
            id="program-description"
            placeholder="Describe the purpose and scope of this collection program"
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="program-version">
            Version <span className="text-xs text-muted-foreground">(semantic versioning)</span>
          </Label>
          <Input
            id="program-version"
            placeholder="e.g., 1.0.0"
            value={data.version}
            onChange={(e) => handleChange("version", e.target.value)}
            className={!isVersionValid && data.version !== "" ? "border-red-500" : ""}
          />
          {!isVersionValid && data.version !== "" && (
            <p className="mt-1 text-xs text-red-500">Must be in format: MAJOR.MINOR.PATCH (e.g., 1.0.0)</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Format: MAJOR.MINOR.PATCH</p>
        </div>

        <div>
          <Label htmlFor="integration-service">Integration Service</Label>
          <Select
            value={data.integrationService || "none"}
            onValueChange={(value) => handleChange("integrationService", value)}
          >
            <SelectTrigger id="integration-service">
              <SelectValue placeholder="Select integration service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="openfn">OpenFn</SelectItem>
              <SelectItem value="openspp">OpenSPP</SelectItem>
              <SelectItem value="generic_mock">Generic Mock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <Label htmlFor="internal-auth-type">Internal Authentication Method</Label>
            <Select value={data.internalAuthType} onValueChange={(value) => handleChange("internalAuthType", value)}>
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
            <p className="mt-1 text-xs text-muted-foreground">How users and mobile apps authenticate to access forms</p>
          </div>

          {data.internalAuthType === "basic" && (
            <>
              <div>
                <Label htmlFor="internal-basic-username">Default Username</Label>
                <Input
                  id="internal-basic-username"
                  placeholder="Enter default username"
                  onChange={(e) => handleChange("internalAuthUsername", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="internal-basic-password">Default Password</Label>
                <Input
                  id="internal-basic-password"
                  type="password"
                  placeholder="Enter default password"
                  onChange={(e) => handleChange("internalAuthPassword", e.target.value)}
                />
              </div>
            </>
          )}

          {data.internalAuthType === "keycloak" && (
            <>
              <div>
                <Label htmlFor="internal-keycloak-url">Keycloak URL</Label>
                <Input
                  id="internal-keycloak-url"
                  placeholder="https://keycloak.example.com"
                  onChange={(e) => handleChange("internalAuthKeycloakUrl", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="internal-keycloak-realm">Realm</Label>
                <Input
                  id="internal-keycloak-realm"
                  placeholder="Enter realm name"
                  onChange={(e) => handleChange("internalAuthKeycloakRealm", e.target.value)}
                />
              </div>
            </>
          )}

          {data.internalAuthType === "auth0" && (
            <>
              <div>
                <Label htmlFor="internal-auth0-domain">Auth0 Domain</Label>
                <Input
                  id="internal-auth0-domain"
                  placeholder="your-domain.auth0.com"
                  onChange={(e) => handleChange("internalAuthAuth0Domain", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="internal-auth0-client-id">Client ID</Label>
                <Input
                  id="internal-auth0-client-id"
                  placeholder="Enter Client ID"
                  onChange={(e) => handleChange("internalAuthAuth0ClientId", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
