<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <h5 class="card-title">Track Power</h5>
      <button
        class="btn btn-lg"
        :class="power === 2 ? 'btn-success' : 'btn-danger'"
        @click="togglePower"
        :disabled="!isConnected || isBusy"
      >
        <i class="fas" :class="power === 2 ? 'fa-bolt' : 'fa-power-off'"></i>
        {{ power === 2 ? 'ON' : 'OFF' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useJmri } from '@/composables/useJmri'

const { power, isConnected, setPower } = useJmri()
const isBusy = ref(false)

async function togglePower() {
  console.log('=== POWER BUTTON CLICKED ===')
  console.log('Current power state:', power.value)
  console.log('Is connected:', isConnected.value)
  console.log('Is busy:', isBusy.value)

  isBusy.value = true
  try {
    const newState = power.value === 2 ? 'off' : 'on'
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
</script>
