<script setup lang="ts">
import { useAuthManagerStore } from '@/store/authManager'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authManager = useAuthManagerStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // Handle OAuth callback
    await authManager.handleCallback()

    // Get the app ID from temporary storage
    const { appId } = authManager.getTemporaryOAuthData()

    if (appId) {
      // Navigate to app dashboard
      router.push(`/app/${appId}`)
    } else {
      // No app ID, go to home
      router.push('/')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed'
    console.error('Callback error:', err)
  } finally {
    loading.value = false
  }
})

const handleRetry = () => {
  router.push('/')
}
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card elevation="8" class="mx-auto text-center pa-6">
              <template v-if="loading">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  class="mb-4"
                />
                <div class="text-h6 mb-2">Completing Sign In</div>
                <div class="text-body-2 text-grey">Please wait while we authenticate you...</div>
              </template>

              <template v-else-if="error">
                <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
                <div class="text-h6 mb-2">Authentication Failed</div>
                <v-alert type="error" variant="tonal" class="my-4 text-left">
                  {{ error }}
                </v-alert>
                <v-btn color="primary" size="large" @click="handleRetry">
                  <v-icon start>mdi-home</v-icon>
                  Return to Home
                </v-btn>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
