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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DataList } from "@/lib/types"

interface ListSectionProps {
  lists: DataList[]
  onAddList: (list: DataList) => void
  onRemoveList: (listId: string) => void
}

export function ListSection({ lists, onAddList, onRemoveList }: ListSectionProps) {
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")
  const [fields, setFields] = useState<DataList["fields"]>([])
  const [fieldName, setFieldName] = useState("")
  const [fieldType, setFieldType] = useState<DataList["fields"][0]["type"]>("text")
  const [fieldRequired, setFieldRequired] = useState(false)

  const handleAddField = () => {
    if (!fieldName.trim()) return

    const newField: DataList["fields"][0] = {
      id: `field-${Date.now()}`,
      name: fieldName,
      type: fieldType,
      required: fieldRequired,
    }

    setFields([...fields, newField])
    setFieldName("")
    setFieldType("text")
    setFieldRequired(false)
  }

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId))
  }

  const handleAddList = () => {
    if (!listName.trim() || !listDescription.trim() || fields.length === 0) return

    const newList: DataList = {
      id: `list-${Date.now()}`,
      name: listName,
      description: listDescription,
      fields,
    }

    onAddList(newList)
    setListName("")
    setListDescription("")
    setFields([])
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Data Lists</h3>
        <p className="text-sm text-muted-foreground">
          Define the data structure and fields that will be collected from forms
        </p>
      </div>

      {/* Add List Section */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              placeholder="e.g., Site Data"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="list-description">List Description</Label>
            <Textarea
              id="list-description"
              placeholder="Describe the purpose of this data list"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <h4 className="font-medium">Fields</h4>
            <div className="space-y-3 rounded-lg bg-muted/50 p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="field-name" className="text-xs">
                    Field Name
                  </Label>
                  <Input
                    id="field-name"
                    placeholder="e.g., Site Name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <Label htmlFor="field-type" className="text-xs">
                    Field Type
                  </Label>
                  <Select value={fieldType} onValueChange={(v) => setFieldType(v as any)}>
                    <SelectTrigger id="field-type" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multiselect">Multi-select</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={fieldRequired}
                  onChange={(e) => setFieldRequired(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="field-required" className="text-xs font-normal">
                  Required field
                </Label>
              </div>
              <Button onClick={handleAddField} disabled={!fieldName.trim()} size="sm" className="w-full">
                <Plus className="mr-2 h-3 w-3" />
                Add Field
              </Button>
            </div>

            {/* Fields List */}
            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div>
                      <p className="font-medium">
                        {field.name} {field.required && <span className="text-destructive">*</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{field.type}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveField(field.id)} className="h-8 w-8">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleAddList}
            disabled={!listName.trim() || !listDescription.trim() || fields.length === 0}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add List
          </Button>
        </div>
      </Card>

      {/* Lists Display */}
      {lists.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Created Lists ({lists.length})</h4>
          {lists.map((list) => (
            <Card key={list.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{list.name}</p>
                  <p className="text-sm text-muted-foreground">{list.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {list.fields.map((field) => (
                      <span key={field.id} className="inline-block rounded bg-muted px-2 py-1 text-xs">
                        {field.name} ({field.type})
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRemoveList(list.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {lists.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No lists created yet. Add your first list above.</p>
        </div>
      )}
    </div>
  )
}
