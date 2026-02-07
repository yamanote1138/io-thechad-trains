<template>
  <div class="min-vh-100 bg-dark text-light">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h1 class="display-4">{{ appTitle }}</h1>
          <p class="lead text-muted">Model Railroad Control System</p>
        </div>
      </div>

      <!-- Status Bar -->
      <StatusBar />

      <!-- Power Control -->
      <PowerControl />

      <!-- Turnout Control -->
      <TurnoutControl />

      <!-- Throttle List -->
      <ThrottleList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'
import StatusBar from '@/components/StatusBar.vue'
import PowerControl from '@/components/PowerControl.vue'
import TurnoutControl from '@/components/TurnoutControl.vue'
import ThrottleList from '@/components/ThrottleList.vue'

const appTitle = config.app.title
const { fetchRoster, fetchTurnouts, isConnected } = useJmri()

onMounted(async () => {
  // Wait for connection before fetching
  const checkConnection = setInterval(async () => {
    if (isConnected.value) {
      clearInterval(checkConnection)
      try {
        await fetchRoster()
        await fetchTurnouts()
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      }
    }
  }, 500)

  // Cleanup after 30 seconds if still not connected
  setTimeout(() => {
    clearInterval(checkConnection)
  }, 30000)
})
</script>
