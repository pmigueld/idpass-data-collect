<template>
  <div ref="builderContainer" class="formio-builder-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Formio from 'formiojs'

interface FormioSchema {
  display?: string
  components?: unknown[]
  [key: string]: unknown
}

interface FormioBuilder {
  schema: FormioSchema
  setForm: (schema: FormioSchema) => Promise<void>
  on: (event: string, callback: () => void) => void
  off: (event: string, callback?: () => void) => void
  destroy: () => void
}

// Extend Formio type to include the builder function that is dynamically added
interface FormioWithBuilder {
  builder: (
    element: HTMLElement,
    schema: FormioSchema,
    options: Record<string, unknown>,
  ) => Promise<FormioBuilder>
}

const props = defineProps<{
  schema?: FormioSchema
  options?: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'change', schema: FormioSchema): void
  (e: 'ready', builder: FormioBuilder): void
}>()

const builderContainer = ref<HTMLElement | null>(null)
let builderInstance: FormioBuilder | null = null

const handleChange = () => {
  if (builderInstance) {
    emit('change', builderInstance.schema)
  }
}

const initBuilder = async () => {
  if (!builderContainer.value) return

  // Destroy existing instance if any
  if (builderInstance) {
    builderInstance.destroy()
    builderInstance = null
  }

  // Clear the container
  builderContainer.value.innerHTML = ''

  const initialSchema = props.schema || { display: 'form', components: [] }
  const builderOptions = props.options || {}

  try {
    // Create the Form.io builder instance
    // The builder function is dynamically added to Formio by FormBuilder.js
    const FormioExt = Formio as unknown as FormioWithBuilder
    builderInstance = await FormioExt.builder(
      builderContainer.value,
      initialSchema,
      builderOptions,
    )

    // Setup event listeners for all relevant builder changes
    builderInstance.on('saveComponent', handleChange)
    builderInstance.on('updateComponent', handleChange)
    builderInstance.on('deleteComponent', handleChange)
    builderInstance.on('removeComponent', handleChange)
    builderInstance.on('change', handleChange)

    emit('ready', builderInstance)
  } catch (error) {
    console.error('Failed to initialize Form.io builder:', error)
  }
}

/**
 * Get the current schema from the builder.
 * This is exposed for parent components to retrieve the schema.
 */
const getSchema = (): FormioSchema => {
  return builderInstance?.schema || { display: 'form', components: [] }
}

/**
 * Set a new schema on the builder.
 */
const setSchema = async (schema: FormioSchema): Promise<void> => {
  if (builderInstance) {
    await builderInstance.setForm(schema)
  }
}

onMounted(() => {
  initBuilder()
})

onBeforeUnmount(() => {
  if (builderInstance) {
    builderInstance.off('saveComponent', handleChange)
    builderInstance.off('updateComponent', handleChange)
    builderInstance.off('deleteComponent', handleChange)
    builderInstance.off('removeComponent', handleChange)
    builderInstance.off('change', handleChange)
    builderInstance.destroy()
    builderInstance = null
  }
})

// Watch for schema prop changes
watch(
  () => props.schema,
  async (newSchema) => {
    if (newSchema && builderInstance) {
      await setSchema(newSchema)
    }
  },
  { deep: true },
)

defineExpose({ getSchema, setSchema })
</script>

<style>
/* Import Form.io styles */
@import 'formiojs/dist/formio.full.min.css';

.formio-builder-container {
  width: 100%;
  min-height: 400px;
  padding: 20px;
  box-sizing: border-box;
}

/* Override some Form.io builder styles for better integration */
.formio-builder-container .formio-builder {
  background: transparent;
}
</style>
