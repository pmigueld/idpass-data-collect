<template>
  <v-dialog fullscreen v-model="dialog" transition="dialog-bottom-transition">
    <v-card class="form-builder-dialog">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>{{ title || 'Form Builder' }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <div class="form-builder-container">
        <FormBuilder
          v-model="schema"
          @change="handleSchemaChange"
        />
      </div>

      <v-card-actions class="form-builder-actions">
        <v-spacer />
        <v-btn variant="outlined" @click="closeDialog">Cancel</v-btn>
        <v-btn variant="elevated" color="primary" @click="saveForm">Save Form</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { FormBuilder, registerDefaultComponents, type FormSchema } from '@/form-builder'

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
const schema = ref<FormSchema>({
  display: 'form',
  components: []
})

// Initialize the form builder with default components
onMounted(() => {
  registerDefaultComponents()
})

// Convert Form.io schema to our internal format
const convertFormioSchema = (formioSchema: any): FormSchema => {
  if (!formioSchema) {
    return { display: 'form', components: [] }
  }

  return {
    display: formioSchema.display || 'form',
    components: formioSchema.components || [],
    settings: formioSchema.settings
  }
}

// Convert our schema back to Form.io format for compatibility
const convertToFormioSchema = (internalSchema: FormSchema): any => {
  return {
    display: internalSchema.display,
    components: internalSchema.components,
    settings: internalSchema.settings
  }
}

// Handle schema changes from the Vue form builder
const handleSchemaChange = (newSchema: FormSchema) => {
  schema.value = newSchema
}

// Open/close dialog methods
const openDialog = () => {
  // Convert incoming Form.io schema to our format
  schema.value = convertFormioSchema(props.formio)
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  emit('update:modelValue', false)
}

const saveForm = () => {
  // Convert our schema back to Form.io format for compatibility
  const formioSchema = convertToFormioSchema(schema.value)
  emit('submit', formioSchema)
  closeDialog()
}

// Watch modelValue prop
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      openDialog()
    } else {
      dialog.value = val
    }
  },
)

// Watch for external formio prop changes
watch(
  () => props.formio,
  (newFormio) => {
    if (dialog.value) {
      schema.value = convertFormioSchema(newFormio)
    }
  },
  { deep: true }
)

// Expose public methods
defineExpose({ openDialog, closeDialog })
</script>

<style scoped>
.form-builder-dialog {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.form-builder-container {
  flex: 1;
  overflow: hidden;
}

.form-builder-actions {
  border-top: 1px solid rgb(var(--v-theme-surface-variant));
  background-color: rgb(var(--v-theme-surface));
}
</style>
