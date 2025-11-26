<template>
  <div ref="builderContainer" class="formio-builder-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Formio from 'formiojs'

const props = defineProps<{
  form?: object
  options?: object
}>()

const emit = defineEmits<{
  (e: 'change', schema: object): void
  (e: 'ready'): void
}>()

const builderContainer = ref<HTMLElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let builderInstance: any = null

const initializeBuilder = async () => {
  if (!builderContainer.value) return

  try {
    // Form.io builder API - using the builder function from Formio
    // Type definitions may be incomplete, so we use any for the builder instance
    builderInstance = await (Formio as any).builder(
      builderContainer.value,
      props.form || {},
      props.options || {}
    )

    // Listen to builder changes
    builderInstance.on('saveComponent', handleSchemaChange)
    builderInstance.on('updateComponent', handleSchemaChange)
    builderInstance.on('deleteComponent', handleSchemaChange)
    builderInstance.on('removeComponent', handleSchemaChange)
    builderInstance.on('change', handleSchemaChange)

    emit('ready')
  } catch (error) {
    console.error('Failed to initialize Form.io builder:', error)
  }
}

const handleSchemaChange = () => {
  if (builderInstance) {
    const schema = builderInstance.schema
    emit('change', schema)
  }
}

const setForm = (form: object) => {
  if (builderInstance) {
    builderInstance.setForm(form)
  }
}

watch(
  () => props.form,
  (newForm) => {
    if (newForm && builderInstance) {
      builderInstance.setForm(newForm)
    }
  },
  { deep: true }
)

onMounted(() => {
  initializeBuilder()
})

onBeforeUnmount(() => {
  if (builderInstance) {
    builderInstance.destroy()
    builderInstance = null
  }
})

defineExpose({
  setForm,
  getSchema: () => builderInstance?.schema || {},
})
</script>

<style scoped>
.formio-builder-container {
  width: 100%;
  min-height: 600px;
}
</style>
