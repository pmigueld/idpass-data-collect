<!--
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
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
-->

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { registerBiometricComponent } from './BiometricComponent'

// Import Form.io CSS
import 'formiojs/dist/formio.full.min.css'

// Import Formio from window (loaded via CDN-like approach)
declare global {
  interface Window {
    Formio: any
  }
}

// Dynamic import to avoid SSR issues
let Formio: any

interface FormSchema {
  components?: unknown[]
  [key: string]: unknown
}

const props = defineProps<{
  form?: FormSchema
  options?: Record<string, unknown>
}>()

const emit = defineEmits<{
  change: [schema: FormSchema]
  ready: []
}>()

const builderContainer = ref<HTMLDivElement | null>(null)
let builderInstance: any = null

// Register custom components
onMounted(async () => {
  // Import Formio dynamically
  const FormioModule = await import('formiojs')
  Formio = FormioModule.default || FormioModule
  
  registerBiometricComponent()

  if (!builderContainer.value) {
    return
  }

  try {
    // Create the builder instance
    builderInstance = await Formio.builder(
      builderContainer.value,
      props.form || {},
      props.options || {},
    )

    // Set up event listeners
    builderInstance.on('change', (schema: FormSchema) => {
      emit('change', schema)
    })

    builderInstance.on('saveComponent', () => {
      emit('change', builderInstance.schema)
    })

    builderInstance.on('updateComponent', () => {
      emit('change', builderInstance.schema)
    })

    builderInstance.on('deleteComponent', () => {
      emit('change', builderInstance.schema)
    })

    builderInstance.on('removeComponent', () => {
      emit('change', builderInstance.schema)
    })

    emit('ready')
  } catch (error) {
    console.error('Failed to initialize Form.io builder:', error)
  }
})

onBeforeUnmount(() => {
  if (builderInstance) {
    try {
      builderInstance.destroy()
    } catch (error) {
      console.error('Failed to destroy Form.io builder:', error)
    }
  }
})

// Watch for form prop changes
watch(
  () => props.form,
  (newForm) => {
    if (builderInstance && newForm) {
      builderInstance.setForm(newForm)
    }
  },
  { deep: true },
)

// Expose method to get current schema
const getSchema = () => {
  return builderInstance?.schema || props.form || {}
}

defineExpose({
  getSchema,
  builder: () => builderInstance,
})
</script>

<template>
  <div class="formio-builder-wrapper">
    <div ref="builderContainer" class="formio-builder-container"></div>
  </div>
</template>

<style scoped>
.formio-builder-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f5f5f5;
}

.formio-builder-container {
  width: 100%;
  min-height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* Isolate Form.io styles from Vuetify */
.formio-builder-wrapper :deep(.formio-builder) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}

/* Ensure proper spacing */
.formio-builder-wrapper :deep(.formio-component) {
  margin-bottom: 10px;
}

/* Fix any potential conflicts with Vuetify */
.formio-builder-wrapper :deep(.btn) {
  text-transform: none;
  letter-spacing: normal;
}

.formio-builder-wrapper :deep(.form-control) {
  font-size: 14px;
  height: auto;
}

/* Prevent Vuetify styles from affecting Form.io buttons */
.formio-builder-wrapper :deep(.btn-primary) {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.formio-builder-wrapper :deep(.btn-secondary) {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.formio-builder-wrapper :deep(.btn-success) {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.formio-builder-wrapper :deep(.btn-danger) {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

/* Ensure proper modal/dialog behavior */
.formio-builder-wrapper :deep(.modal) {
  z-index: 2000;
}

/* Fix dropdown menus */
.formio-builder-wrapper :deep(.dropdown-menu) {
  z-index: 2001;
}

/* Ensure proper card styling */
.formio-builder-wrapper :deep(.card) {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.25rem;
}

/* Fix input groups */
.formio-builder-wrapper :deep(.input-group) {
  display: flex;
  flex-wrap: wrap;
}

/* Ensure proper label styling */
.formio-builder-wrapper :deep(label) {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>
