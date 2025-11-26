<template>
  <v-dialog fullscreen v-model="dialog" transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Form Builder</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <div class="form-builder-container">
          <FormBuilder
            v-if="dialog"
            :form="schema"
            @change="handleSchemaChange"
            :options="builderOptions"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="elevated" color="primary" @click="saveForm">Save Form</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Builder as FormBuilder } from '@formio/vue'

const props = defineProps({
  modelValue: Boolean,
  name: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  formio: {
    type: Object,
    default: () => ({}),
  },
  submit: {
    type: Function,
    default: () => {},
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const dialog = ref(false)
const schema = ref<Record<string, unknown>>(props.formio as Record<string, unknown>)

const builderOptions = {
  builder: {
    // Builder configuration options
  }
}

// Handle schema changes from builder
const handleSchemaChange = (event: { schema?: Record<string, unknown>; form?: Record<string, unknown> }) => {
  // The Builder component may emit the schema in different formats
  const updatedSchema = event.schema || event.form || schema.value
  if (updatedSchema) {
    schema.value = updatedSchema as Record<string, unknown>
  }
}

// Open/close dialog methods
const openDialog = () => {
  dialog.value = true
  // Reset schema when opening dialog
  schema.value = JSON.parse(JSON.stringify(props.formio)) as Record<string, unknown>
}

const closeDialog = () => {
  dialog.value = false
  emit('update:modelValue', false)
}

const saveForm = () => {
  emit('submit', schema.value)
  closeDialog()
}

// Watch modelValue prop
watch(
  () => props.modelValue,
  (val) => {
    dialog.value = val
    if (val) {
      // Reset schema when dialog opens
      schema.value = JSON.parse(JSON.stringify(props.formio)) as Record<string, unknown>
    }
  },
)

// Watch formio prop to update schema when it changes externally
watch(
  () => props.formio,
  (newFormio) => {
    if (!dialog.value) {
      schema.value = JSON.parse(JSON.stringify(newFormio)) as Record<string, unknown>
    }
  },
  { deep: true }
)

// Expose public methods
defineExpose({ openDialog, closeDialog })
</script>

<style scoped>
.form-builder-container {
  width: 100%;
  height: calc(100vh - 120px);
  overflow: auto;
}
</style>
