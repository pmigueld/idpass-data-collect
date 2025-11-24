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
import { Badge } from "@/components/ui/badge"
import type { CollectionProgramDraft } from "@/lib/types"

interface ReviewSectionProps {
  draft: CollectionProgramDraft
}

export function ReviewSection({ draft }: ReviewSectionProps) {
  const getIntegrationLabel = (service: string | null) => {
    const labels: Record<string, string> = {
      openfn: "OpenFn",
      openspp: "OpenSPP",
      generic_mock: "Generic Mock",
    }
    return service ? labels[service] || service : "None"
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Review Collection Program</h3>
        <p className="text-sm text-muted-foreground">Verify all configuration before creating the collection program</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Basic Information</h4>
            <Badge variant="outline">Configured</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{draft.basicInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description:</span>
              <span className="max-w-xs text-right text-xs">{draft.basicInfo.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">{draft.basicInfo.version}</span>
            </div>
          </div>
        </Card>

        {/* Internal Auth */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Internal Authentication</h4>
            <Badge variant="outline" className="capitalize">
              {draft.basicInfo.internalAuthType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Users and mobile apps will authenticate using{" "}
            {draft.basicInfo.internalAuthType === "none" ? "no authentication" : draft.basicInfo.internalAuthType}
          </p>
        </Card>

        {/* Integration Service */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">External Integration</h4>
            <Badge variant="outline">{getIntegrationLabel(draft.basicInfo.integrationService)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Data will be synced to {getIntegrationLabel(draft.basicInfo.integrationService)}
          </p>
        </Card>

        {/* Entity Forms */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Entity Forms</h4>
            <Badge variant="secondary">{draft.entityForms.length}</Badge>
          </div>
          {draft.entityForms.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {draft.entityForms.map((form) => (
                <li key={form.id} className="flex justify-between">
                  <span>{form.name}</span>
                  <span className="text-muted-foreground">{form.description}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No forms configured</p>
          )}
        </Card>

        {/* Field Mapping */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Field Mappings</h4>
            <Badge variant="secondary">{draft.fieldMappings.length}</Badge>
          </div>
          {draft.fieldMappings.length > 0 ? (
            <ul className="space-y-1 text-xs">
              {draft.fieldMappings.map((mapping) => (
                <li key={mapping.id} className="flex justify-between">
                  <span>{mapping.formFieldName}</span>
                  <span className="text-muted-foreground">→ {mapping.externalFieldName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No field mappings configured</p>
          )}
        </Card>
      </div>

      <div className="mt-4 rounded-lg bg-primary/10 p-4 text-sm">
        <p className="text-foreground">
          Click <strong>Create Collection Program</strong> to finalize this configuration. The program will be created
          as version {draft.basicInfo.version}.
        </p>
      </div>
    </div>
  )
}
