<template>
  <div class="card bg-dark text-light mb-2 mb-sm-3">
    <div class="card-body py-2 py-sm-3">
      <div class="mb-2 mb-sm-3">
        <LocomotiveHeader
          :name="throttle.name"
          :road="throttle.road"
          :number="throttle.number"
          :thumbnail-url="throttle.thumbnailUrl"
          :disabled="!isConnected || isReleasing"
          @click="onRelease"
        >
          <template #status>
            <div v-if="isReleasing" class="text-danger small mt-1">
              <i class="fas fa-spinner fa-spin"></i> Releasing...
            </div>
          </template>
        </LocomotiveHeader>
      </div>

      <!-- Speed control -->
      <div class="mb-2 mb-sm-3">
        <label class="form-label small mb-1">Speed: {{ Math.round(throttle.speed * 100) }}%</label>
        <div class="btn-group w-100 gap-1" role="group" aria-label="Speed control">
          <button
            v-for="level in powerLevels"
            :key="level"
            class="btn"
            :class="throttle.speed >= level ? 'btn-warning' : 'btn-secondary'"
            @click="setPowerLevel(level)"
            :disabled="controlsDisabled || isRamping"
          >
            &nbsp;
          </button>
        </div>
      </div>

      <!-- Direction and Stop buttons -->
      <div class="btn-group w-100 mb-2 mb-sm-3" role="group" aria-label="Direction and stop controls">
        <button
          type="button"
          class="btn btn-primary col"
          @click="toggleDirection"
          :disabled="controlsDisabled"
        >
          <i :class="throttle.direction ? 'fas fa-arrow-right' : 'fas fa-arrow-left'"></i>
          {{ throttle.direction ? 'Forward' : 'Reverse' }}
        </button>
        <button
          type="button"
          class="btn btn-danger col"
          @click="stopThrottle"
          :disabled="controlsDisabled"
        >
          <i class="fas fa-stop"></i> Stop
        </button>
      </div>

      <!-- Function buttons -->
      <div v-if="functionButtons.length > 0" class="btn-group w-100 flex-wrap" role="group">
        <button
          v-for="fn in functionButtons"
          :key="fn.key"
          class="btn"
          :class="fn.value ? 'btn-warning' : 'btn-outline-secondary'"
          @click="toggleFunction(fn.key)"
          :disabled="controlsDisabled"
          :title="fn.label"
        >
          <i :class="getFunctionIcon(fn.key)"></i>
          <span class="d-none d-sm-inline ms-1">{{ fn.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { PowerState } from 'jmri-client'
import type { Throttle } from '@/types/jmri'
import LocomotiveHeader from './LocomotiveHeader.vue'

const props = defineProps<{
  throttle: Throttle
}>()

const { isConnected, power, setThrottleSpeed, setThrottleDirection, setThrottleFunction, releaseThrottle } = useJmri()

const isReleasing = ref(false)
const isRamping = ref(false)
const emergencyStop = ref(false)

// Power level buttons: 0%, 10%, 20%, 40%, 60%, 80%, 100%
const powerLevels = [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0]

// Disable controls when not connected or power is off
const controlsDisabled = computed(() => {
  return !isConnected.value || power.value !== PowerState.ON
})

// Compute function buttons list (sorted by function number)
const functionButtons = computed(() => {
  const buttons = Object.entries(props.throttle.functions)
    .map(([key, fn]) => {
      // Extract function number from key like "F0", "F1"
      const match = key.match(/^F(\d+)$/)
      if (!match) return null

      return {
        key,
        label: typeof fn.label === 'string' ? fn.label : key,
        value: fn.value || false,
        number: parseInt(match[1])
      }
    })
    .filter((btn): btn is NonNullable<typeof btn> => btn !== null)

  // Sort by function number
  return buttons.sort((a, b) => a.number - b.number)
})

/**
 * Set power level with smooth logarithmic ramping
 * Duration scales with distance to simulate realistic momentum and inertia
 */
async function setPowerLevel(targetSpeed: number) {
  if (isRamping.value) return

  const currentSpeed = props.throttle.speed
  if (currentSpeed === targetSpeed) return

  emergencyStop.value = false
  isRamping.value = true

  try {
    const interval = 150 // ms between updates - hardware-friendly
    const distance = Math.abs(targetSpeed - currentSpeed)

    // Scale duration with distance - slower for model railroading realism
    // Low speed operations (0-20%) should be very gradual to show inertia
    const baseDuration = 8000 // 8 seconds for full 0-100% range
    const duration = Math.max(800, baseDuration * distance) // Min 800ms
    const steps = Math.max(5, Math.ceil(duration / interval))

    for (let i = 1; i <= steps; i++) {
      // Check for emergency stop
      if (emergencyStop.value) {
        await setThrottleSpeed(props.throttle.address, 0)
        break
      }

      // Logarithmic interpolation for smooth acceleration/deceleration
      const t = i / steps
      // Use exponential easing for more natural feeling
      const eased = currentSpeed < targetSpeed
        ? Math.pow(t, 5.0) // Very steep curve - slow start to overcome inertia
        : 1 - Math.pow(1 - t, 0.5) // Ease in when decelerating (slow start, fast finish)

      const speed = currentSpeed + (targetSpeed - currentSpeed) * eased
      await setThrottleSpeed(props.throttle.address, speed)

      // Don't wait after the last step
      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }

    // Ensure we hit the exact target (unless emergency stopped)
    if (!emergencyStop.value) {
      await setThrottleSpeed(props.throttle.address, targetSpeed)
    }
  } finally {
    isRamping.value = false
  }
}

async function toggleDirection() {
  const currentSpeed = props.throttle.speed
  const newDirection = !props.throttle.direction

  // If moving, ramp down to 0, pause, switch direction, then ramp back up
  if (currentSpeed > 0) {
    // Ramp down to 0
    await setPowerLevel(0)

    // Pause after stopping (realistic momentum/settling time)
    await new Promise(resolve => setTimeout(resolve, 1800))

    // Switch direction
    await setThrottleDirection(props.throttle.address, newDirection)

    // Ramp back up to previous speed
    await setPowerLevel(currentSpeed)
  } else {
    // If stopped, just switch direction
    await setThrottleDirection(props.throttle.address, newDirection)
  }
}

function stopThrottle() {
  // Set emergency stop flag to interrupt any ongoing ramping
  emergencyStop.value = true
  // Immediately set speed to 0
  setThrottleSpeed(props.throttle.address, 0)
}

function toggleFunction(functionKey: string) {
  const fn = props.throttle.functions[functionKey]
  if (!fn) return

  // Extract function number from key like "F0", "F1"
  const match = functionKey.match(/^F(\d+)$/)
  if (!match) {
    console.error('Invalid function key format:', functionKey)
    return
  }

  const functionNumber = parseInt(match[1])
  setThrottleFunction(props.throttle.address, functionNumber, !fn.value)
}

function getFunctionIcon(functionKey: string): string {
  const fn = props.throttle.functions[functionKey]
  if (!fn || !fn.label || typeof fn.label !== 'string') return 'fas fa-circle'

  // Map common function labels to icons
  const label = fn.label.toLowerCase()
  if (label.includes('headlight') || label.includes('light')) return 'fas fa-lightbulb'
  if (label.includes('bell')) return 'fas fa-bell'
  if (label.includes('horn') || label.includes('whistle')) return 'fas fa-bullhorn'
  if (label.includes('steam')) return 'fas fa-cloud'
  if (label.includes('brake')) return 'fas fa-hand-paper'
  if (label.includes('coupler')) return 'fas fa-link'
  if (label.includes('mars')) return 'fas fa-star'

  return 'fas fa-circle'
}

async function onRelease() {
  isReleasing.value = true
  try {
    await releaseThrottle(props.throttle.address)
  } finally {
    isReleasing.value = false
  }
}
</script>

<style scoped>
/* Component-specific styles can go here if needed */
</style>
