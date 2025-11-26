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
        <FormioBuilder
          ref="builderRef"
          :form="formio"
          @change="handleSchemaChange"
          @ready="handleBuilderReady"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="elevated" color="primary" @click="saveForm">Save Form</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FormioBuilder from '@/components/FormioBuilder.vue'

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
const builderRef = ref<InstanceType<typeof FormioBuilder> | null>(null)
const schema = ref(props.formio)
const isReady = ref(false)

const handleSchemaChange = (newSchema: object) => {
  schema.value = newSchema
}

const handleBuilderReady = () => {
  isReady.value = true
}

const closeDialog = () => {
  dialog.value = false
  emit('update:modelValue', false)
}

const saveForm = () => {
  if (builderRef.value) {
    const currentSchema = builderRef.value.getSchema()
    emit('submit', currentSchema)
  } else {
    emit('submit', schema.value)
  }
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
defineExpose({ openDialog: () => { dialog.value = true }, closeDialog })
</script>

<style scoped>
:deep(.formio-builder-container) {
  min-height: calc(100vh - 120px);
}
</style>
