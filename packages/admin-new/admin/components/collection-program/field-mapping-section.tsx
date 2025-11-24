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
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { FieldMapping, EntityForm } from "@/lib/types"

interface FieldMappingSectionProps {
  mappings: FieldMapping[]
  forms: EntityForm[]
  onAddMapping: (mapping: FieldMapping) => void
  onRemoveMapping: (mappingId: string) => void
}

export function FieldMappingSection({ mappings, forms, onAddMapping, onRemoveMapping }: FieldMappingSectionProps) {
  const [selectedFormId, setSelectedFormId] = useState("")
  const [selectedFormFieldId, setSelectedFormFieldId] = useState("")
  const [externalFieldName, setExternalFieldName] = useState("")

  const selectedForm = forms.find((f) => f.id === selectedFormId)

  const handleAddMapping = () => {
    if (!selectedFormId || !selectedFormFieldId || !externalFieldName.trim()) return

    const formField = selectedForm?.formSchema?.components?.find((c: any) => c.key === selectedFormFieldId)

    if (!formField) return

    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      formFieldId: selectedFormFieldId,
      formFieldName: formField.label || selectedFormFieldId,
      externalFieldName,
    }

    onAddMapping(newMapping)
    setSelectedFormId("")
    setSelectedFormFieldId("")
    setExternalFieldName("")
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Field Mapping</h3>
        <p className="text-sm text-muted-foreground">Map form fields to external integration field names</p>
      </div>

      {/* Add Mapping Section */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form-select">Select Form</Label>
              <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                <SelectTrigger id="form-select">
                  <SelectValue placeholder="Choose a form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="form-field-select">Form Field</Label>
              <Select value={selectedFormFieldId} onValueChange={setSelectedFormFieldId} disabled={!selectedFormId}>
                <SelectTrigger id="form-field-select">
                  <SelectValue placeholder="Choose a field" />
                </SelectTrigger>
                <SelectContent>
                  {selectedForm?.formSchema?.components?.map((component: any) => (
                    <SelectItem key={component.key} value={component.key}>
                      {component.label || component.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="external-field">External Field Name</Label>
            <Input
              id="external-field"
              placeholder="e.g., site_name"
              value={externalFieldName}
              onChange={(e) => setExternalFieldName(e.target.value)}
            />
          </div>

          <Button
            onClick={handleAddMapping}
            disabled={!selectedFormId || !selectedFormFieldId || !externalFieldName.trim()}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>
      </Card>

      {/* Mappings Display */}
      {mappings.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Field Mappings ({mappings.length})</h4>
          {mappings.map((mapping) => (
            <Card key={mapping.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1 text-sm">
                  <p className="font-medium">{mapping.formFieldName}</p>
                  <p className="text-muted-foreground">→ {mapping.externalFieldName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemoveMapping(mapping.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mappings.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No mappings created yet. Add your first mapping above.</p>
        </div>
      )}
    </div>
  )
}
