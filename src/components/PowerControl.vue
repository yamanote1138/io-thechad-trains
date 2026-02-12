<template>
  <div class="btn-group w-100 mb-3" role="group">
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
      :title="isStopping ? 'Stopping...' : 'Stop All'"
    >
      <i class="fas fa-stop"></i>
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
import { PowerState, powerStateToString } from 'jmri-client'

const { power, isConnected, setPower, stopAllThrottles, releaseAllThrottles, throttles } = useJmri()
const isBusy = ref(false)
const isStopping = ref(false)
const isReleasing = ref(false)

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
