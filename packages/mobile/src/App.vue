<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { computed } from 'vue'

const { mobile } = useDisplay()

const appBarHeight = computed(() => mobile.value ? 56 : 64)
</script>

<template>
  <v-app id="app">
    <v-app-bar
      :elevation="1"
      color="primary"
      class="safe-top"
    >
      <template #prepend>
        <v-app-bar-nav-icon />
      </template>

      <v-app-bar-title class="text-white">
        ID PASS DataCollect
      </v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-magnify" variant="text" />
        <v-btn icon="mdi-dots-vertical" variant="text" />
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0">
        <RouterView />
      </v-container>
    </v-main>

    <v-bottom-navigation
      v-if="mobile"
      app
      color="primary"
      fixed
    >
      <v-btn value="home" to="/">
        <v-icon>mdi-home</v-icon>
        <span>Home</span>
      </v-btn>

      <v-btn value="apps" to="/apps">
        <v-icon>mdi-apps</v-icon>
        <span>Apps</span>
      </v-btn>

      <v-btn value="sync" @click="syncData">
        <v-icon>mdi-sync</v-icon>
        <span>Sync</span>
      </v-btn>

      <v-btn value="settings">
        <v-icon>mdi-cog</v-icon>
        <span>Settings</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.v-container {
  min-height: 100vh;
}

.safe-top {
  padding-top: env(safe-area-inset-top);
}

.v-app-bar {
  background: linear-gradient(135deg, #3264c8 0%, #023a51 100%);
}
</style>
