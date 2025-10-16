<template>
  <div class="error-container">
    <v-alert
      :type="type"
      variant="tonal"
      class="mb-4"
      :title="title"
    >
      {{ message }}
    </v-alert>

    <div class="d-flex justify-center gap-2">
      <v-btn
        v-if="showRetry"
        variant="outlined"
        @click="$emit('retry')"
      >
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>

      <v-btn
        v-if="showBack"
        variant="text"
        @click="$emit('back')"
      >
        <v-icon start>mdi-arrow-left</v-icon>
        Go Back
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message?: string
  type?: 'error' | 'warning' | 'info'
  showRetry?: boolean
  showBack?: boolean
}

interface Emits {
  (e: 'retry'): void
  (e: 'back'): void
}

withDefaults(defineProps<Props>(), {
  title: 'Error',
  message: 'Something went wrong',
  type: 'error',
  showRetry: true,
  showBack: false
})

defineEmits<Emits>()
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}
</style>