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
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicInfoSection } from "@/components/collection-program/basic-info-section"
import { IntegrationAuthSection } from "@/components/collection-program/integration-auth-section"
import { EntityFormsSection } from "@/components/collection-program/entity-forms-section"
import { FieldMappingSection } from "@/components/collection-program/field-mapping-section"
import { ReviewSection } from "@/components/collection-program/review-section"
import type {
  CollectionProgramDraft,
  EntityForm,
  FieldMapping,
  InternalAuthenticationConfig,
  ExternalAuthenticationConfig,
} from "@/lib/types"

export default function NewCollectionProgramPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic-info")
  const [draft, setDraft] = useState<CollectionProgramDraft>({
    basicInfo: {
      name: "",
      description: "",
      version: "1.0.0",
      integrationService: null,
      internalAuthType: "none",
    },
    entityForms: [],
    fieldMappings: [],
    internalAuth: { type: "none" },
    externalAuth: { type: "none" },
  })

  const [isValid, setIsValid] = useState({
    basicInfo: false,
    entityForms: false,
  })

  const validateSemanticVersion = (version: string) => {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?(\+[a-zA-Z0-9]+)?$/
    return semverRegex.test(version)
  }

  const handleBasicInfoChange = (data: any) => {
    setDraft((prev) => ({
      ...prev,
      basicInfo: data,
    }))
    setIsValid((prev) => ({
      ...prev,
      basicInfo:
        data.name &&
        data.description &&
        validateSemanticVersion(data.version) &&
        data.integrationService !== undefined &&
        data.internalAuthType,
    }))
  }

  const handleInternalAuthChange = (config: InternalAuthenticationConfig) => {
    setDraft((prev) => ({
      ...prev,
      internalAuth: config,
    }))
  }

  const handleExternalAuthChange = (config: ExternalAuthenticationConfig) => {
    setDraft((prev) => ({
      ...prev,
      externalAuth: config,
    }))
  }

  const handleAddEntityForm = (form: EntityForm) => {
    setDraft((prev) => ({
      ...prev,
      entityForms: [...prev.entityForms, form],
    }))
  }

  const handleRemoveEntityForm = (formId: string) => {
    setDraft((prev) => ({
      ...prev,
      entityForms: prev.entityForms.filter((f) => f.id !== formId),
    }))
  }

  const handleAddMapping = (mapping: FieldMapping) => {
    setDraft((prev) => ({
      ...prev,
      fieldMappings: [...prev.fieldMappings, mapping],
    }))
  }

  const handleRemoveMapping = (mappingId: string) => {
    setDraft((prev) => ({
      ...prev,
      fieldMappings: prev.fieldMappings.filter((m) => m.id !== mappingId),
    }))
  }

  const handleSave = () => {
    if (!isValid.basicInfo) {
      setActiveTab("basic-info")
      return
    }

    console.log("[v0] Creating collection program:", draft)
    router.push("/")
  }

  const handleCancel = () => {
    router.back()
  }

  const getTabs = () => {
    return [
      { value: "basic-info", label: "Basic Info" },
      { value: "integration-service", label: "Integration Service", disabled: !draft.basicInfo.integrationService },
      { value: "entity-forms", label: "Entity Forms" },
      { value: "field-mapping", label: "Field Mapping" },
      { value: "review", label: "Review" },
    ]
  }

  const tabs = getTabs()

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Collection Program</h1>
              <p className="text-sm text-muted-foreground">
                Create a new collection program with forms and integrations
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="basic-info" className="space-y-4">
                <BasicInfoSection data={draft.basicInfo} onChange={handleBasicInfoChange} />
              </TabsContent>

              <TabsContent value="integration-service" className="space-y-4">
                {draft.basicInfo.integrationService ? (
                  <IntegrationAuthSection
                    integrationService={draft.basicInfo.integrationService}
                    authConfig={draft.externalAuth}
                    onChange={handleExternalAuthChange}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Please select an integration service in Basic Info to configure it.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="entity-forms" className="space-y-4">
                <EntityFormsSection
                  forms={draft.entityForms}
                  onAddForm={handleAddEntityForm}
                  onRemoveForm={handleRemoveEntityForm}
                />
              </TabsContent>

              <TabsContent value="field-mapping" className="space-y-4">
                <FieldMappingSection
                  mappings={draft.fieldMappings}
                  forms={draft.entityForms}
                  onAddMapping={handleAddMapping}
                  onRemoveMapping={handleRemoveMapping}
                />
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <ReviewSection draft={draft} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t pt-6">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid.basicInfo}>
              Create Collection Program
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
