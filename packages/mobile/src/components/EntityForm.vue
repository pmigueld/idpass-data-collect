<template>
  <v-card class="entity-form-card">
    <v-card-title class="d-flex align-center">
      <v-icon :color="color" class="mr-2">{{ icon }}</v-icon>
      {{ title }}
      <v-spacer />
      <v-btn icon variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Form Schema Renderer -->
      <div v-if="formSchema" class="form-container">
        <component
          :is="formComponent"
          :schema="formSchema"
          :data="formData"
          :options="formOptions"
          @submit="onFormSubmit"
          @change="onFormChange"
        />
      </div>

      <!-- Manual Form Fields (fallback) -->
      <v-form v-else v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
          v-model="formData.name"
          label="Name"
          :rules="nameRules"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />

        <v-text-field
          v-model="formData.email"
          label="Email"
          type="email"
          :rules="emailRules"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />

        <v-select
          v-model="formData.status"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />

        <v-textarea
          v-model="formData.notes"
          label="Notes"
          variant="outlined"
          density="comfortable"
          rows="3"
          class="mb-4"
        />

        <!-- Form Actions -->
        <div class="d-flex gap-2">
          <v-btn
            type="submit"
            color="primary"
            :loading="saving"
            :disabled="!valid"
          >
            {{ submitText }}
          </v-btn>

          <v-btn variant="outlined" @click="$emit('cancel')">
            Cancel
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface FormData {
  name?: string
  email?: string
  status?: string
  notes?: string
  [key: string]: any
}

interface Props {
  title?: string
  icon?: string
  color?: string
  formSchema?: any
  initialData?: FormData
  saving?: boolean
  submitText?: string
}

interface Emits {
  (e: 'submit', data: FormData): void
  (e: 'change', data: FormData): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Entity Form',
  icon: 'mdi-file-document-edit',
  color: 'primary',
  saving: false,
  submitText: 'Save'
})

const emit = defineEmits<Emits>()

const valid = ref(false)
const formData = reactive<FormData>({ ...props.initialData })

const formComponent = computed(() => {
  // This would dynamically determine the form component based on schema type
  return 'div' // Placeholder for dynamic form component
})

const formOptions = computed(() => ({
  // Form.io or custom form options would go here
}))

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
  { title: 'Pending', value: 'pending' }
]

const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters'
]

const emailRules = [
  (v: string) => !v || /.+@.+\..+/.test(v) || 'Email must be valid'
]

const onFormSubmit = (data: FormData) => {
  emit('submit', data)
}

const onFormChange = (data: FormData) => {
  Object.assign(formData, data)
  emit('change', formData)
}

const onSubmit = () => {
  if (valid.value) {
    emit('submit', { ...formData })
  }
}
</script>

<style scoped>
.entity-form-card {
  max-width: 600px;
  margin: 0 auto;
}

.form-container {
  min-height: 300px;
}
</style>