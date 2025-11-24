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
import { ArrowLeft, FileText, Database, Plug, QrCode, Download, Settings, Clock, Edit, Copy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityList } from "@/components/entity-list"
import { FormDefinitionList } from "@/components/form-definition-list"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { CollectionProgramDetail } from "@/app/actions/collection-programs"

interface FormAppDetailClientProps {
  program: CollectionProgramDetail
  programId: string
}

export function FormAppDetailClient({ program, programId }: FormAppDetailClientProps) {
  const [showQRDialog, setShowQRDialog] = useState(false)

  const forms = program.entityForms || []
  const formsCount = forms.length
  const entitiesCount = program.entityData?.length || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "draft":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "archived":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  }

  const qrCodeData = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/artifacts/${program.artifactId}.json`
  const deploymentUrl = qrCodeData

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-full flex h-16 items-center gap-4 px-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{program.name}</h1>
              <Badge variant="secondary" className={cn("text-xs", getStatusColor("active"))}>
                active
              </Badge>
              <span className="text-sm text-muted-foreground">v{program.version}</span>
            </div>
            <p className="text-sm text-muted-foreground">{program.description || ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/formapps/${programId}/edit`}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                New Version
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setShowQRDialog(true)}>
              <QrCode className="h-4 w-4" />
              Show QR
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-transparent">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex gap-6">
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="entities" className="space-y-4">
              <TabsList>
                <TabsTrigger value="entities">Entities</TabsTrigger>
                <TabsTrigger value="forms">Forms</TabsTrigger>
              </TabsList>

              <TabsContent value="entities" className="space-y-4">
                <EntityList formAppId={programId} />
              </TabsContent>

              <TabsContent value="forms" className="space-y-4">
                <FormDefinitionList
                  forms={forms.map((f) => ({
                    id: f.id,
                    name: f.name,
                    version: f.version,
                    fields: Object.keys(f.formSchema).length,
                    entityCount: 0,
                  }))}
                />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="w-80 shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      Forms
                    </div>
                    <div className="text-xl font-bold">{formsCount}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Database className="h-3.5 w-3.5" />
                      Entities
                    </div>
                    <div className="text-xl font-bold">{entitiesCount}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{program.name}</DialogTitle>
            <DialogDescription>Scan this QR code with the mobile app to deploy this Collection Program</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-lg border-2 border-border bg-white p-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`}
                alt="QR Code"
                className="h-48 w-48"
              />
            </div>
            <div className="w-full space-y-2">
              <p className="text-sm font-medium">Web Collection URL:</p>
              <div className="flex items-center gap-2">
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono text-primary hover:underline truncate"
                  title={deploymentUrl}
                >
                  {deploymentUrl}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(deploymentUrl)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

