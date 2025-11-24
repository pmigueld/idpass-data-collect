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

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { newCollectionProgramSchema } from "@/lib/formio-schema"

declare global {
  interface Window {
    Formio: any
  }
}

interface NewCollectionProgramModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function NewCollectionProgramModal({ open, onOpenChange, onSubmit }: NewCollectionProgramModalProps) {
  const [formInstance, setFormInstance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    // Load Form.io library
    const script = document.createElement("script")
    script.src = "https://cdn.form.io/js/formio.full.min.js"
    script.async = true
    script.onload = () => {
      // Initialize form after library loads
      const formContainer = document.getElementById("formio-container")
      if (formContainer && window.Formio) {
        window.Formio.createForm(formContainer, newCollectionProgramSchema).then((form: any) => {
          setFormInstance(form)

          // Handle form submission
          form.on("submit", (submission: any) => {
            setIsLoading(true)
            // Simulate API call
            setTimeout(() => {
              onSubmit(submission.data)
              setIsLoading(false)
              onOpenChange(false)
            }, 500)
          })
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [open, onOpenChange, onSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Collection Program</DialogTitle>
        </DialogHeader>
        <div id="formio-container" className="py-4" />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (formInstance) {
                formInstance.submit()
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Program"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
