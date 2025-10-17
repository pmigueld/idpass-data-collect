<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useSnackBarStore } from '@/stores/snackBar'
import AppLayout from '@/components/AppLayout.vue'
import { RouterView } from 'vue-router'

const authStore = useAuthStore()
const snackBarStore = useSnackBarStore()
</script>

<template>
  <v-app>
    <AppLayout v-if="authStore.isAuthenticated" />
    <v-main v-else>
      <RouterView />
    </v-main>
  </v-app>

  <!-- global snackbar -->
  <v-snackbar
    v-model="snackBarStore.snackbar"
    :timeout="3000"
    :color="snackBarStore.snackbarColor"
    @update:model-value="snackBarStore.hideSnackbar"
  >
    {{ snackBarStore.snackbarText }}
  </v-snackbar>
</template>

<style scoped></style>
