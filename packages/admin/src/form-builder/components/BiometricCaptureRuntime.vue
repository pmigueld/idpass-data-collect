<template>
  <BaseComponent :schema="schema" @validation="handleValidation">
    <div class="biometric-capture-runtime">
      <div class="biometric-header">
        <v-icon class="biometric-icon">mdi-fingerprint</v-icon>
        <div class="biometric-info">
          <div class="biometric-title">{{ schema.label || 'Biometric Capture' }}</div>
          <div class="biometric-subtitle">Biometric data will be captured when the form is submitted</div>
        </div>
      </div>

      <div class="biometric-preview">
        <div class="fingers-summary">
          <v-chip
            v-for="finger in selectedFingers"
            :key="finger"
            variant="outlined"
            size="small"
          >
            {{ formatFingerName(finger) }}
          </v-chip>
        </div>

        <div class="capture-info">
          <div class="info-item">
            <strong>Environment:</strong> {{ schema.captureEnv || 'Developer' }}
          </div>
          <div class="info-item">
            <strong>Purpose:</strong> {{ schema.capturePurpose || 'Auth' }}
          </div>
          <div class="info-item">
            <strong>Timeout:</strong> {{ schema.captureTimeout || 30000 }}ms
          </div>
          <div class="info-item">
            <strong>Quality Threshold:</strong> {{ schema.captureQualityThreshold || 60 }}%
          </div>
        </div>
      </div>

      <!-- Hidden input to store the value -->
      <input
        type="hidden"
        :value="JSON.stringify(value)"
      />
    </div>
  </BaseComponent>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseComponent from './BaseComponent.vue'
import type { ComponentSchema } from '../types/ComponentDefinition'

interface Props {
  schema: ComponentSchema
  value?: any
  readonly?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: null,
  readonly: false,
  disabled: false,
})

const selectedFingers = computed(() => {
  return Array.isArray(props.schema.captureFingers) ? props.schema.captureFingers : []
})

const formatFingerName = (fingerValue: string): string => {
  const parts = fingerValue.split('_')
  if (parts.length === 2) {
    const hand = parts[0] === 'Left' ? 'L' : 'R'
    const finger = parts[1].replace(/Finger$/, '').replace(/Thumb$/, 'Thumb')
    return `${hand}-${finger}`
  }
  return fingerValue
}

const handleValidation = (errors: string[]) => {
  // Handle validation if needed
}
</script>

<style scoped>
.biometric-capture-runtime {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.biometric-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.biometric-icon {
  font-size: 24px;
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

.fingers-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.capture-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 12px;
}

.info-item {
  color: #6c757d;
}

.info-item strong {
  color: #495057;
}
</style>