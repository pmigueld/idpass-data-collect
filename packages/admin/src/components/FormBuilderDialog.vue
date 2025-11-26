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
      <div class="form-builder-wrapper">
        <FormBuilder
          v-if="dialog"
          ref="formBuilderRef"
          :schema="initialSchema"
          @change="handleSchemaChange"
          @ready="handleBuilderReady"
        />
      </div>
      <v-card-actions>
        <v-btn variant="elevated" color="primary" @click="saveForm">Save Form</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FormBuilder from '@/components/FormBuilder.vue'

interface FormioSchema {
  display?: string
  components?: unknown[]
  [key: string]: unknown
}

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
const formBuilderRef = ref<InstanceType<typeof FormBuilder> | null>(null)
const currentSchema = ref<FormioSchema>({})

// Compute initial schema from props
const initialSchema = computed<FormioSchema>(() => {
  if (props.formio && Object.keys(props.formio).length > 0) {
    return props.formio as FormioSchema
  }
  return { display: 'form', components: [] }
})

// Handle schema changes from the builder
const handleSchemaChange = (schema: FormioSchema) => {
  currentSchema.value = schema
}

// Handle builder ready event
const handleBuilderReady = () => {
  // Builder is initialized and ready
  currentSchema.value = formBuilderRef.value?.getSchema() || { display: 'form', components: [] }
}

// Open/close dialog methods
const openDialog = () => {
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  emit('update:modelValue', false)
}

const saveForm = () => {
  // Get the latest schema from the builder
  const latestSchema = formBuilderRef.value?.getSchema() || currentSchema.value
  emit('submit', latestSchema)
  closeDialog()
}

// Watch modelValue prop
watch(
  () => props.modelValue,
  (val) => {
    dialog.value = val
  },
)

// Expose public methods
defineExpose({ openDialog, closeDialog })
</script>

<style scoped>
.form-builder-wrapper {
  height: calc(100vh - 120px);
  overflow: auto;
}
</style>
