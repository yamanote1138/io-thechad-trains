<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <h5 class="card-title">Track Power</h5>
      <button
        class="btn btn-lg w-100 mb-2"
        :class="buttonClass"
        @click="togglePower"
        :disabled="!isConnected || isBusy"
      >
        <i class="fas" :class="buttonIcon"></i>
        {{ buttonText }}
      </button>
      <button
        class="btn btn-warning w-100"
        @click="releaseAll"
        :disabled="!isConnected || isReleasing"
      >
        <i class="fas fa-eject"></i>
        {{ isReleasing ? 'Releasing...' : 'Release All Throttles' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { PowerState, powerStateToString } from 'jmri-client'

const { power, isConnected, setPower, releaseAllThrottles } = useJmri()
const isBusy = ref(false)
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
