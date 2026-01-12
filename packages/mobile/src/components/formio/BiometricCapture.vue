<template>
  <div class="biometric-capture-component">
    <label v-if="component.label" class="form-label">
      {{ component.label }}
      <span v-if="component.validate?.required" class="text-danger">*</span>
    </label>
    <div class="biometric-capture-controls">
      <button
        type="button"
        class="btn btn-primary biometric-capture-button"
        :disabled="isCapturing || isReadOnly"
        @click="handleCapture"
      >
        <i class="fa fa-fingerprint" aria-hidden="true"></i>
        {{ captureButtonText }}
      </button>
      <div v-if="captureStatus" class="capture-status" :class="statusClass">
        {{ captureStatus }}
      </div>
      <div v-if="errorMessage" class="error-message text-danger">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { BiometricCapturePlugin } from '@/plugins/biometric-capture'

interface Component {
  label?: string
  key: string
  type: string
  validate?: {
    required?: boolean
  }
  customOptions?: {
    intentAction?: string
    intentPackage?: string
    intentClass?: string
    captureType?: string
    captureFormat?: string
  }
  disabled?: boolean
  defaultValue?: unknown
}

interface Props {
  component: Component
  value?: unknown
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  readOnly: false
})

const emit = defineEmits<{
  (e: 'input', value: unknown): void
}>()

const isCapturing = ref(false)
const captureStatus = ref('')
const errorMessage = ref('')
const captureData = ref<Record<string, unknown> | null>(null)

const isReadOnly = computed(() => props.readOnly || props.component.disabled)

const captureButtonText = computed(() => {
  if (isCapturing.value) return 'Capturing...'
  if (captureData.value) return 'Recapture'
  return 'Capture Biometric'
})

const statusClass = computed(() => {
  if (errorMessage.value) return 'status-error'
  if (captureData.value) return 'status-success'
  return ''
})


const handleCapture = async () => {
  if (isCapturing.value || isReadOnly.value) return

  isCapturing.value = true
  captureStatus.value = ''
  errorMessage.value = ''

  try {
    const options = props.component.customOptions || {}
    const result = await BiometricCapturePlugin.capture({
      options: {
        intentAction: options.intentAction || 'io.idpass.bca.CAPTURE',
        intentPackage: options.intentPackage || 'io.idpass.bca',
        intentClass: options.intentClass || 'io.idpass.bca.MainActivity',
        captureType: options.captureType || 'fingerprint',
        captureFormat: options.captureFormat || 'json'
      }
    })

    captureData.value = result
    captureStatus.value = 'Biometric captured successfully'
    emit('input', result)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to capture biometric'
    errorMessage.value = errorMsg
    captureStatus.value = ''
    captureData.value = null
    emit('input', null)
  } finally {
    isCapturing.value = false
  }
}

watch(() => props.value, (newValue) => {
  if (newValue && typeof newValue === 'object') {
    captureData.value = newValue as Record<string, unknown>
    captureStatus.value = 'Biometric data loaded'
  } else if (newValue === null || newValue === undefined) {
    captureData.value = null
    captureStatus.value = ''
  }
}, { immediate: true })

onMounted(() => {
  if (props.component.defaultValue) {
    captureData.value = props.component.defaultValue as Record<string, unknown>
    emit('input', props.component.defaultValue)
  }
})
</script>

<style scoped>
.biometric-capture-component {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.biometric-capture-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.biometric-capture-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #007bff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.biometric-capture-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.biometric-capture-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.capture-status {
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
}

.status-error {
  background-color: #f8d7da;
  color: #721c24;
}

.error-message {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
