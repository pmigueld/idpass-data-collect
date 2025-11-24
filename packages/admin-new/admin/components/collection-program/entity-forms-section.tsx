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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { EntityForm } from "@/lib/types"

interface EntityFormsSectionProps {
  forms: EntityForm[]
  onAddForm: (form: EntityForm) => void
  onRemoveForm: (formId: string) => void
}

export function EntityFormsSection({ forms, onAddForm, onRemoveForm }: EntityFormsSectionProps) {
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")

  const handleAddForm = () => {
    if (!formName.trim() || !formDescription.trim()) return

    const newForm: EntityForm = {
      id: `form-${Date.now()}`,
      name: formName,
      description: formDescription,
      formSchema: {}, // In a real app, this would be built with Form.io builder
      version: "1.0.0",
      entityCount: 0,
    }

    onAddForm(newForm)
    setFormName("")
    setFormDescription("")
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Entity Forms</h3>
        <p className="text-sm text-muted-foreground">
          Add forms that mobile apps and web portals will use to collect entity data
        </p>
      </div>

      {/* Add Form Section */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="form-name">Form Name</Label>
            <Input
              id="form-name"
              placeholder="e.g., Site Assessment"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="form-description">Form Description</Label>
            <Textarea
              id="form-description"
              placeholder="Describe what data this form will collect"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleAddForm} disabled={!formName.trim() || !formDescription.trim()} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Form
          </Button>
        </div>
      </Card>

      {/* Forms List */}
      {forms.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Added Forms ({forms.length})</h4>
          {forms.map((form) => (
            <Card key={form.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{form.name}</p>
                <p className="text-sm text-muted-foreground">{form.description}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemoveForm(form.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {forms.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No forms added yet. Add your first form above.</p>
        </div>
      )}
    </div>
  )
}
