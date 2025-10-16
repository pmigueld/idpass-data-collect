<template>
  <div class="loading-container">
    <v-progress-circular
      indeterminate
      :size="size"
      :color="color"
      class="mb-3"
    />
    <div v-if="message" class="text-body-2 text-center" :class="messageColor">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  size?: number
  color?: string
  messageColor?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
  size: 40,
  color: 'primary',
  messageColor: 'text-medium-emphasis'
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}
</style>