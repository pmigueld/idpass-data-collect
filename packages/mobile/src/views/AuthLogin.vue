<script setup lang="ts">
import { useAuthManagerStore } from '@/store/authManager'
import { useTenantStore } from '@/store/tenant'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authManager = useAuthManagerStore()
const tenantStore = useTenantStore()

const tenant = ref<any>(null)
const loading = ref(false)
const selectedProvider = ref<string>('')
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const appId = route.params.id as string
    tenant.value = await tenantStore.getTenant(appId)

    // Set default provider
    if (authManager.availableProviders.length > 0) {
      selectedProvider.value = authManager.availableProviders[0]
    }
  } finally {
    loading.value = false
  }
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    if (!selectedProvider.value) {
      throw new Error('Please select an authentication provider')
    }

    const credentials = username.value && password.value
      ? { username: username.value, password: password.value }
      : null

    await authManager.login(selectedProvider.value, credentials)

    // Navigate to app
    router.push(`/app/${route.params.id}`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

const getProviderIcon = (provider: string) => {
  const iconMap: Record<string, string> = {
    auth0: 'mdi-shield-account',
    keycloak: 'mdi-key',
    default: 'mdi-login'
  }
  return iconMap[provider] || iconMap.default
}

const getProviderColor = (provider: string) => {
  const colorMap: Record<string, string> = {
    auth0: 'orange',
    keycloak: 'blue',
    default: 'primary'
  }
  return colorMap[provider] || colorMap.default
}
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card elevation="8" class="mx-auto">
              <v-card-title class="text-center py-6 bg-primary">
                <v-icon size="64" color="white" class="mb-2">mdi-lock</v-icon>
                <div class="text-h5 text-white">Sign In</div>
                <div v-if="tenant" class="text-caption text-white">{{ tenant.name }}</div>
              </v-card-title>

              <v-card-text class="pa-6">
                <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

                <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable>
                  {{ error }}
                </v-alert>

                <v-select
                  v-model="selectedProvider"
                  :items="authManager.availableProviders"
                  label="Authentication Provider"
                  variant="outlined"
                  prepend-inner-icon="mdi-shield-account"
                  :disabled="loading || authManager.availableProviders.length <= 1"
                  class="mb-4"
                />

                <template v-if="selectedProvider === 'default' || username || password">
                  <v-text-field
                    v-model="username"
                    label="Username"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    :disabled="loading"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    label="Password"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :disabled="loading"
                    @click:append-inner="showPassword = !showPassword"
                    @keyup.enter="handleLogin"
                  />
                </template>

                <v-btn
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="loading || !selectedProvider"
                  @click="handleLogin"
                >
                  <v-icon start>{{ getProviderIcon(selectedProvider) }}</v-icon>
                  Sign In with {{ selectedProvider || 'Provider' }}
                </v-btn>

                <div v-if="authManager.availableProviders.length > 1" class="mt-6">
                  <v-divider class="mb-4" />
                  <div class="text-caption text-center text-grey mb-3">Or sign in with</div>
                  <v-row dense>
                    <v-col
                      v-for="provider in authManager.availableProviders.filter(
                        (p) => p !== selectedProvider
                      )"
                      :key="provider"
                      cols="12"
                    >
                      <v-btn
                        :color="getProviderColor(provider)"
                        variant="outlined"
                        block
                        :disabled="loading"
                        @click="selectedProvider = provider"
                      >
                        <v-icon start>{{ getProviderIcon(provider) }}</v-icon>
                        {{ provider }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
