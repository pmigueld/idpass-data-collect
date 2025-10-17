<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const drawer = ref(false)

const navigationItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: { name: 'home' },
    description: 'Overview of all collection programs'
  },
  {
    title: 'Programs',
    icon: 'mdi-package-variant-closed',
    to: { name: 'home' },
    description: 'Manage collection programs'
  },
  {
    title: 'Users',
    icon: 'mdi-account-group',
    to: { name: 'users' },
    description: 'Manage user accounts and permissions'
  }
]

const userMenuItems = [
  {
    title: 'Profile',
    icon: 'mdi-account',
    action: () => {}
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    action: () => {}
  },
  {
    title: 'Logout',
    icon: 'mdi-logout',
    action: () => authStore.logout(),
    color: 'error'
  }
]

const currentUser = computed(() => authStore.user)
</script>

<template>
  <div class="app-layout">
    <!-- App Bar -->
    <v-app-bar
      color="primary"
      elevation="2"
      class="app-bar"
    >
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
        class="hidden-md-and-up"
      />

      <v-toolbar-title class="d-flex align-center">
        <v-icon size="32" class="mr-3">mdi-database</v-icon>
        <span class="text-h6 font-weight-bold">ID PASS DataCollect</span>
      </v-toolbar-title>

      <v-spacer />

      <!-- User Menu -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            v-bind="props"
            class="user-menu-btn"
          >
            <v-avatar size="36" class="mr-2">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <span class="hidden-sm-and-down">{{ currentUser?.email }}</span>
            <v-icon class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="item in userMenuItems"
            :key="item.title"
            @click="item.action"
            :prepend-icon="item.icon"
            :title="item.title"
            :color="item.color"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      class="navigation-drawer"
      color="surface"
      width="280"
    >
      <v-list class="pa-0">
        <!-- Logo Section -->
        <v-list-item class="logo-section">
          <template v-slot:prepend>
            <v-avatar size="48" color="primary" class="mr-3">
              <v-icon size="28" color="white">mdi-database</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h6 font-weight-bold">
            DataCollect Admin
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <!-- Navigation Items -->
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :subtitle="item.description"
          class="navigation-item"
          active-class="navigation-item-active"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <router-view />
    </v-main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-bar {
  z-index: 1000;
}

.user-menu-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

.navigation-drawer {
  border-right: 1px solid #e0e0e0;
}

.logo-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.navigation-item {
  margin: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.navigation-item-active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.navigation-item .v-list-item-subtitle {
  opacity: 0.8;
  font-size: 0.8rem;
}

.main-content {
  flex: 1;
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-menu-btn span {
    display: none;
  }
}
</style>
