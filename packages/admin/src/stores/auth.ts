/*
 * Licensed to the Association pour la cooperation numerique (ACN) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ACN licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import router from '@/router'

const API_URL = import.meta.env.VITE_API_URL
const LOGIN_URL = `${API_URL}/api/users/login`

interface DecodedToken {
  id: number;
  email: string;
  role?: string;
  exp?: number;
  iat?: number;
}

function decodeJWT(token: string): DecodedToken | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const currentUser = ref<DecodedToken | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || 'USER')
  const isAdmin = computed(() => userRole.value === 'ADMIN')

  // Actions
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      // Decode and store user information
      currentUser.value = decodeJWT(newToken)
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      currentUser.value = null
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.post(LOGIN_URL, credentials)
      const { token: newToken } = response.data
      setToken(newToken)
      router.push('/')
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    router.push('/login')
  }

  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }

  return {
    token,
    currentUser,
    isAuthenticated,
    userRole,
    isAdmin,
    login,
    logout,
    initializeAuth,
  }
})
