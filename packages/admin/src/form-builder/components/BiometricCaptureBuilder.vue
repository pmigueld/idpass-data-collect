<template>
  <BaseComponent :schema="schema" @validation="handleValidation">
    <div class="biometric-capture-builder">
      <div class="biometric-header">
        <v-icon class="biometric-icon">mdi-fingerprint</v-icon>
        <div class="biometric-info">
          <div class="biometric-title">{{ schema.label || 'Biometric Capture' }}</div>
          <div class="biometric-subtitle">Configure biometric capture settings</div>
        </div>
      </div>

      <div class="biometric-config">
        <div class="config-section">
          <h5>Fingers to Capture</h5>
          <div class="finger-selection">
            <v-chip
              v-for="finger in availableFingers"
              :key="finger.value"
              :variant="isFingerSelected(finger.value) ? 'elevated' : 'outlined'"
              :color="isFingerSelected(finger.value) ? 'primary' : undefined"
              closable
              @click="toggleFinger(finger.value)"
            >
              {{ finger.label }}
            </v-chip>
          </div>
          <div class="finger-actions">
            <v-btn
              variant="outlined"
              size="small"
              @click="selectAllFingers"
            >
              Select All
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              @click="clearAllFingers"
            >
              Clear All
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </BaseComponent>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseComponent from './BaseComponent.vue'
import type { ComponentSchema } from '../types/ComponentDefinition'

interface Props {
  schema: ComponentSchema
  readonly?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:schema', schema: ComponentSchema): void
  (e: 'validation', errors: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  disabled: false,
})

const emit = defineEmits<Emits>()

const availableFingers = [
  { label: 'Left Thumb', value: 'Left_Thumb' },
  { label: 'Left Index', value: 'Left_IndexFinger' },
  { label: 'Left Middle', value: 'Left_MiddleFinger' },
  { label: 'Left Ring', value: 'Left_RingFinger' },
  { label: 'Left Pinky', value: 'Left_LittleFinger' },
  { label: 'Right Thumb', value: 'Right_Thumb' },
  { label: 'Right Index', value: 'Right_IndexFinger' },
  { label: 'Right Middle', value: 'Right_MiddleFinger' },
  { label: 'Right Ring', value: 'Right_RingFinger' },
  { label: 'Right Pinky', value: 'Right_LittleFinger' }
]

const selectedFingers = computed({
  get: () => props.schema.captureFingers || [],
  set: (value: string[]) => {
    emit('update:schema', {
      ...props.schema,
      captureFingers: value
    })
  }
})

const isFingerSelected = (fingerValue: string): boolean => {
  return selectedFingers.value.includes(fingerValue)
}

const toggleFinger = (fingerValue: string) => {
  const current = [...selectedFingers.value]
  const index = current.indexOf(fingerValue)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(fingerValue)
  }

  selectedFingers.value = current
}

const selectAllFingers = () => {
  selectedFingers.value = availableFingers.map(f => f.value)
}

const clearAllFingers = () => {
  selectedFingers.value = []
}

const handleValidation = (errors: string[]) => {
  // Handle validation if needed
}
</script>

<style scoped>
.biometric-capture-builder {
  padding: 16px;
  border: 2px dashed #007bff;
  border-radius: 8px;
  background-color: #f8f9ff;
  min-height: 120px;
}

.biometric-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.biometric-icon {
  font-size: 32px;
  color: #007bff;
  margin-right: 12px;
}

.biometric-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

.biometric-subtitle {
  font-size: 12px;
  color: #6c757d;
}

.config-section h5 {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  margin-top: 0;
}

.finger-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.finger-actions {
  display: flex;
  gap: 8px;
}
</style>