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
import { useRouter, notFound } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getFormAppById } from "@/lib/mock-data"
import { EntityFormsSection } from "@/components/collection-program/entity-forms-section"
import { IntegrationSection } from "@/components/collection-program/integration-section"
import type { EntityForm } from "@/types/entity-form" // Declare the EntityForm variable

export default function EditCollectionProgramPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const formApp = getFormAppById(params.id)

  if (!formApp) {
    notFound()
  }

  const [activeTab, setActiveTab] = useState("basic")
  const [entityForms, setEntityForms] = useState<EntityForm[]>([])
  const [integrationConfig, setIntegrationConfig] = useState({
    type: formApp.externalIntegration?.toLowerCase() || null,
    webhookUrl: "",
    apiKey: "",
    authentication: { type: "none" as const },
  })
  const [formData, setFormData] = useState({
    basicInfo: {
      name: formApp.name,
      description: formApp.description,
      version: "", // New version will be auto-generated
    },
  })

  const handleAddForm = (form: EntityForm) => {
    setEntityForms([...entityForms, form])
  }

  const handleRemoveForm = (formId: string) => {
    setEntityForms(entityForms.filter((f) => f.id !== formId))
  }

  const handleIntegrationChange = (config: any) => {
    setIntegrationConfig(config)
  }

  const handleSave = () => {
    // In a real app, this would create a new version
    console.log("Creating new version:", { ...formData, entityForms, integrationConfig })
    router.push(`/formapps/${params.id}`)
  }

  const incrementVersion = (currentVersion: string): string => {
    const parts = currentVersion.split(".")
    const patch = Number.parseInt(parts[2] || "0") + 1
    return `${parts[0]}.${parts[1]}.${patch}`
  }

  const newVersion = incrementVersion(formApp.version)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-6">
          <Link href={`/formapps/${params.id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">Create New Version</h1>
              <Badge variant="outline" className="text-xs">
                {formApp.name}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Current version: v{formApp.version} → New version: v{newVersion}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Create Version
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="forms">Entity Forms</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Program Name</Label>
                      <Input
                        id="name"
                        value={formData.basicInfo.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basicInfo: { ...formData.basicInfo, name: e.target.value },
                          })
                        }
                        placeholder="Enter program name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.basicInfo.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basicInfo: { ...formData.basicInfo, description: e.target.value },
                          })
                        }
                        placeholder="Enter program description"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Version</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          v{newVersion}
                        </Badge>
                        <span className="text-sm text-muted-foreground">Auto-generated from v{formApp.version}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forms" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Entity Forms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add or modify the forms that mobile apps will use to collect entity data.
                    </p>
                    <EntityFormsSection forms={entityForms} onAddForm={handleAddForm} onRemoveForm={handleRemoveForm} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integration" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">External Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Configure external services to sync data with.</p>
                    <IntegrationSection config={integrationConfig} onChange={handleIntegrationChange} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar - Current version info */}
          <aside className="col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Current Version</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="text-lg font-bold">v{formApp.version}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className="capitalize">
                    {formApp.status.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Forms</p>
                  <p className="text-lg font-bold">{formApp.formsCount}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Entities</p>
                  <p className="text-lg font-bold">{formApp.totalEntities}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">{formApp.createdBy}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">External Integration</p>
                  {formApp.externalIntegration ? (
                    <Badge variant="outline" className="text-xs">
                      {formApp.externalIntegration}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
