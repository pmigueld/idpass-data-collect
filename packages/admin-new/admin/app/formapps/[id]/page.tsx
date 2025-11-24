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

import { notFound } from "next/navigation"
import { ArrowLeft, FileText, Database, Plug, QrCode, Download, Settings, Clock, Edit, Copy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityList } from "@/components/entity-list"
import { FormDefinitionList } from "@/components/form-definition-list"
import { cn } from "@/lib/utils"
import { getCollectionProgram } from "@/app/actions/collection-programs"
import { FormAppDetailClient } from "@/components/formapp-detail-client"

export default async function FormAppDetailPage({ params }: { params: { id: string } }) {
  let program
  try {
    program = await getCollectionProgram(params.id)
  } catch {
    notFound()
  }

  return <FormAppDetailClient program={program} programId={params.id} />
}
