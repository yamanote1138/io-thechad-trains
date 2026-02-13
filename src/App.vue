<template>
  <div class="min-vh-100 bg-dark text-light">
    <!-- Sticky Header Section -->
    <div class="sticky-header bg-dark">
      <div class="container-fluid py-2 py-sm-3 pb-2">
        <!-- Header -->
        <h1 class="h5 h5-sm-4 mb-2 mb-sm-3">{{ railroadName }}</h1>

        <!-- Power Control with integrated status -->
        <PowerControl />
      </div>
      <hr class="divider m-0">
    </div>

    <!-- Scrollable Content -->
    <div class="container-fluid px-3 pt-2 pt-sm-3">
      <!-- Throttle List -->
      <ThrottleList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useJmri } from '@/composables/useJmri'
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

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.divider {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.5;
}
</style>
