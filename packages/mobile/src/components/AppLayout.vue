<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar
      :title="title"
      :elevation="2"
      color="primary"
      dark
    >
      <template #prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
      </template>

      <v-spacer />

      <!-- Sync Status -->
      <v-chip
        v-if="syncStatus"
        :color="syncStatus === 'synced' ? 'success' : 'warning'"
        size="small"
        class="mr-2"
      >
        <v-icon start>{{ syncStatus === 'synced' ? 'mdi-check-circle' : 'mdi-clock' }}</v-icon>
        {{ syncStatus === 'synced' ? 'Synced' : 'Syncing...' }}
      </v-chip>

      <!-- User Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$emit('logout')">
            <v-list-item-title>
              <v-icon start>mdi-logout</v-icon>
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
    >
      <v-list>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon>{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-btn
            block
            variant="outlined"
            @click="onSync"
          >
            <v-icon start>mdi-sync</v-icon>
            Sync Data
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface NavigationItem {
  title: string
  icon: string
  to: string
}

interface Props {
  title?: string
  syncStatus?: 'synced' | 'syncing' | 'offline'
  navigationItems?: NavigationItem[]
}

interface Emits {
  (e: 'logout'): void
  (e: 'sync'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'ID PASS DataCollect',
  syncStatus: 'offline',
  navigationItems: () => []
})

const emit = defineEmits<Emits>()

const drawer = ref(false)

const title = computed(() => props.title || 'ID PASS DataCollect')

const onSync = () => {
  emit('sync')
  drawer.value = false
}
</script>