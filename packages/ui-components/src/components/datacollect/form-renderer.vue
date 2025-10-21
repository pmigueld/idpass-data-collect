<template>
  <div class="form-renderer">
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-2">Loading form...</span>
    </div>

    <div v-else-if="error" class="p-4 border border-destructive rounded-lg">
      <p class="text-destructive">{{ error }}</p>
      <Button variant="outline" size="sm" @click="retry" class="mt-2">
        Retry
      </Button>
    </div>

    <div v-else-if="formSchema" ref="formContainer" class="form-container" />
  </div>
</template>

<script setup lang="ts">
import Button from '../ui/button'
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface FormSchema {
  display: string
  components: any[]
  [key: string]: any
}

interface Props {
  formSchema: FormSchema | null
  submission?: Record<string, any>
  readOnly?: boolean
  onSubmit?: (data: Record<string, any>) => void
  onChange?: (data: Record<string, any>) => void
}

interface Emits {
  (e: 'submit', data: Record<string, any>): void
  (e: 'change', data: Record<string, any>): void
  (e: 'ready'): void
  (e: 'error', error: string): void
}

const props = withDefaults(defineProps<Props>(), {
  submission: () => ({}),
  readOnly: false
})

const emit = defineEmits<Emits>()

const formContainer = ref<HTMLElement>()
const loading = ref(true)
const error = ref<string | null>(null)
let formInstance: any = null

// Dynamic import of Form.io to avoid SSR issues
const loadFormIO = async () => {
  try {
    const { Form } = await import('formiojs')
    return Form
  } catch (err) {
    throw new Error('Failed to load Form.io library')
  }
}

const initializeForm = async () => {
  if (!props.formSchema || !formContainer.value) return

  try {
    loading.value = true
    error.value = null

    const Form = await loadFormIO()

    // Clean up existing form
    if (formInstance) {
      formInstance.destroy()
    }

    // Create new form instance
    formInstance = await Form.createForm(formContainer.value, {
      ...props.formSchema,
      readOnly: props.readOnly
    })

    // Set initial submission data
    if (props.submission) {
      formInstance.submission = { data: props.submission }
    }

    // Set up event listeners
    formInstance.on('submit', (submission: any) => {
      emit('submit', submission.data)
      if (props.onSubmit) {
        props.onSubmit(submission.data)
      }
    })

    formInstance.on('change', (_event: any) => {
      emit('change', formInstance.submission.data || {})
      if (props.onChange) {
        props.onChange(formInstance.submission.data || {})
      }
    })

    formInstance.on('ready', () => {
      loading.value = false
      emit('ready')
    })

    formInstance.on('error', (err: any) => {
      loading.value = false
      error.value = err.message || 'Form error occurred'
      emit('error', error.value)
    })

  } catch (err) {
    loading.value = false
    error.value = err instanceof Error ? err.message : 'Failed to initialize form'
    emit('error', error.value)
  }
}

const retry = () => {
  initializeForm()
}

// Watch for schema changes
watch(() => props.formSchema, () => {
  initializeForm()
}, { deep: true })

// Watch for submission data changes
watch(() => props.submission, (newSubmission) => {
  if (formInstance && newSubmission) {
    formInstance.submission = { data: newSubmission }
  }
}, { deep: true })

// Watch for readOnly changes
watch(() => props.readOnly, (newReadOnly) => {
  if (formInstance) {
    formInstance.options.readOnly = newReadOnly
  }
})

onMounted(() => {
  initializeForm()
})

onUnmounted(() => {
  if (formInstance) {
    formInstance.destroy()
    formInstance = null
  }
})

// Expose methods for parent components
defineExpose({
  getSubmission: () => formInstance?.submission?.data || {},
  setSubmission: (data: Record<string, any>) => {
    if (formInstance) {
      formInstance.submission = { data }
    }
  },
  validate: () => formInstance?.checkValidity(),
  submit: () => formInstance?.submit()
})
</script>

<style scoped>
.form-container :deep(.formio-component) {
  margin-bottom: 1rem;
}

.form-container :deep(.formio-errors) {
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-container :deep(.formio-error-wrapper) {
  background-color: hsl(var(--destructive) / 0.1);
  border: 1px solid hsl(var(--destructive) / 0.3);
  border-radius: 0.375rem;
  padding: 0.5rem;
  margin-top: 0.25rem;
}
</style>