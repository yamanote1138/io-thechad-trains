<template>
  <div class="btn-group w-100 mb-2 mb-sm-3" role="group">
    <button
      class="btn btn-sm status-indicator"
      :class="statusClass"
      disabled
      :title="statusText"
    >
      <i class="fas" :class="isConnected ? 'fa-plug' : 'fa-plug-circle-xmark'"></i>
    </button>
    <button
      v-if="isMockMode"
      class="btn btn-sm btn-warning"
      disabled
      title="Mock Mode Enabled"
    >
      <i class="fas fa-flask"></i>
    </button>
    <button
      class="btn"
      :class="buttonClass"
      @click="togglePower"
      :disabled="!isConnected || isBusy"
      :title="buttonText"
    >
      <i class="fas" :class="buttonIcon"></i>
      <span class="d-none d-sm-inline ms-1">{{ buttonText }}</span>
    </button>
    <button
      class="btn btn-danger"
      @click="stopAll"
      :disabled="!isConnected || isStopping || throttles.length === 0"
      :title="isStopping ? 'Stopping...' : 'Emergency Stop All'"
    >
      <i class="fas fa-hand"></i>
      <span class="d-none d-sm-inline ms-1">{{ isStopping ? 'Stopping...' : 'Stop All' }}</span>
    </button>
    <button
      class="btn btn-warning"
      @click="releaseAll"
      :disabled="!isConnected || isReleasing || throttles.length === 0"
      :title="isReleasing ? 'Releasing...' : 'Release All'"
    >
      <i class="fas fa-eject"></i>
      <span class="d-none d-sm-inline ms-1">{{ isReleasing ? 'Releasing...' : 'Release All' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'
import { PowerState, powerStateToString } from 'jmri-client'

const { power, isConnected, setPower, stopAllThrottles, releaseAllThrottles, throttles } = useJmri()
const isBusy = ref(false)
const isStopping = ref(false)
const isReleasing = ref(false)
const isMockMode = config.jmri.mock.enabled

const statusClass = computed(() => {
  return isConnected.value ? 'btn-success' : 'btn-danger'
})

const statusText = computed(() => {
  let text = isConnected.value ? 'Connected' : 'Disconnected'
  if (isMockMode) text += ' (Mock Mode)'
  return text
})

const buttonClass = computed(() => {
  if (power.value === PowerState.ON) return 'btn-success'
  if (power.value === PowerState.OFF) return 'btn-danger'
  return 'btn-warning'  // UNKNOWN state
})

const buttonText = computed(() => {
  return powerStateToString(power.value)
})

const buttonIcon = computed(() => {
  if (power.value === PowerState.ON) return 'fa-bolt'
  if (power.value === PowerState.OFF) return 'fa-power-off'
  return 'fa-circle-question'  // UNKNOWN state
})

async function togglePower() {
  console.log('=== POWER BUTTON CLICKED ===')
  console.log('Current power state:', power.value, `(${powerStateToString(power.value)})`)
  console.log('Is connected:', isConnected.value)
  console.log('Is busy:', isBusy.value)

  isBusy.value = true
  try {
    // Toggle: ON → OFF, OFF → ON, UNKNOWN → ON
    const newState = power.value === PowerState.ON ? 'off' : 'on'
    console.log('Setting power to:', newState)
    await setPower(newState)
    console.log('Power set successfully')
  } catch (error) {
    console.error('Error setting power:', error)
  } finally {
    isBusy.value = false
    console.log('=== POWER BUTTON DONE ===')
  }
}

async function stopAll() {
  isStopping.value = true
  try {
    await stopAllThrottles()
  } catch (error) {
    console.error('Error stopping all throttles:', error)
  } finally {
    isStopping.value = false
  }
}

async function releaseAll() {
  isReleasing.value = true
  try {
    await releaseAllThrottles()
  } catch (error) {
    console.error('Error releasing all throttles:', error)
  } finally {
    isReleasing.value = false
  }
}
</script>

<style scoped>
/* Status indicator with alert colors */
.status-indicator.btn-success {
  background-color: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.status-indicator.btn-danger {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

/* Smaller buttons on mobile for vertical space savings */
@media (max-width: 575px) {
  .btn-group .btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
