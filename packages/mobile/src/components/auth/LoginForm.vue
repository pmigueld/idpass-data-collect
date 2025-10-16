<template>
  <v-card class="auth-card" elevation="4">
    <v-card-text class="pa-6">
      <!-- Header -->
      <div class="text-center mb-6">
        <v-icon size="64" color="primary" class="mb-4">mdi-account-circle</v-icon>
        <h2 class="text-h5 mb-2">Welcome Back</h2>
        <p class="text-body-1 text-medium-emphasis">
          Sign in to access {{ appName }}
        </p>
      </div>

      <!-- Login Form -->
      <v-form v-model="valid" @submit.prevent="onSubmit">
        <v-text-field
          v-model="credentials.username"
          label="Username or Email"
          :rules="usernameRules"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :disabled="loading"
        />

        <v-text-field
          v-model="credentials.password"
          label="Password"
          :rules="passwordRules"
          prepend-inner-icon="mdi-lock"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          class="mb-4"
          :disabled="loading"
        >
          <template #append-inner>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="showPassword = !showPassword"
            >
              <v-icon>{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </v-btn>
          </template>
        </v-text-field>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="loading"
          :disabled="!valid || loading"
        >
          Sign In
        </v-btn>

        <!-- Forgot Password -->
        <div class="text-center mt-4">
          <v-btn variant="text" size="small" @click="$emit('forgot-password')">
            Forgot your password?
          </v-btn>
        </div>
      </v-form>

      <!-- OAuth Options -->
      <v-divider class="my-6" />

      <div class="text-center">
        <p class="text-body-2 text-medium-emphasis mb-3">Or continue with</p>
        <div class="d-flex justify-center gap-3">
          <v-btn
            icon
            size="large"
            variant="outlined"
            @click="$emit('oauth-login', 'google')"
          >
            <v-icon>mdi-google</v-icon>
          </v-btn>
          <v-btn
            icon
            size="large"
            variant="outlined"
            @click="$emit('oauth-login', 'microsoft')"
          >
            <v-icon>mdi-microsoft</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center mt-6">
        <span class="text-body-2 text-medium-emphasis">
          Don't have an account?
        </span>
        <v-btn variant="text" size="small" class="ml-2" @click="$emit('signup')">
          Sign up here
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface LoginCredentials {
  username: string
  password: string
}

interface Props {
  appName?: string
  loading?: boolean
  error?: string
}

interface Emits {
  (e: 'login', credentials: LoginCredentials): void
  (e: 'forgot-password'): void
  (e: 'signup'): void
  (e: 'oauth-login', provider: string): void
}

withDefaults(defineProps<Props>(), {
  appName: 'ID PASS DataCollect',
  loading: false,
  error: ''
})

const emit = defineEmits<Emits>()

const valid = ref(false)
const showPassword = ref(false)

const credentials = reactive<LoginCredentials>({
  username: '',
  password: ''
})

const usernameRules = [
  (v: string) => !!v || 'Username is required',
  (v: string) => v.length >= 3 || 'Username must be at least 3 characters'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

const onSubmit = () => {
  if (valid.value) {
    emit('login', { ...credentials })
  }
}
</script>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 0 auto;
}
</style>