<template>
  <div class="min-vh-100 bg-dark text-light">
    <div class="container-fluid py-3">
      <!-- Status Banner -->
      <StatusBar />

      <!-- Header -->
      <h1 class="display-6 mb-3">{{ railroadName }}</h1>

      <!-- Power Control -->
      <PowerControl />

      <!-- Throttle List -->
      <ThrottleList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useJmri } from '@/composables/useJmri'
import StatusBar from '@/components/StatusBar.vue'
import PowerControl from '@/components/PowerControl.vue'
import ThrottleList from '@/components/ThrottleList.vue'

const { fetchRoster, isConnected, railroadName } = useJmri()

// Update page title when railroad name changes
watch(railroadName, (newName) => {
  document.title = newName
}, { immediate: true })

onMounted(async () => {
  // Wait for connection before fetching
  const checkConnection = setInterval(async () => {
    if (isConnected.value) {
      clearInterval(checkConnection)
      try {
        await fetchRoster()
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
