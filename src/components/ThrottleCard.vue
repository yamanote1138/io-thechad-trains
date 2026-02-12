<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <!-- Locomotive header with image -->
      <div class="d-flex align-items-center mb-3">
        <img
          :src="imageSrc"
          :alt="throttle.name"
          class="me-3"
          style="width: 100px; height: 100px; object-fit: cover;"
          @error="onImageError"
        >
        <div>
          <h5 class="card-title mb-0">{{ throttle.name }}</h5>
          <small class="text-muted" v-if="throttle.road || throttle.number">
            {{ throttle.road }} {{ throttle.number ? `#${throttle.number}` : '' }}
          </small>
        </div>
      </div>

      <!-- Speed control -->
      <div class="mb-3">
        <label class="form-label">Speed: {{ Math.round(throttle.speed * 100) }}%</label>
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
      <div class="btn-group w-100 mb-3" role="group" aria-label="Direction and stop controls">
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
      <div class="mb-3" v-if="functionButtons.length > 0">
        <div class="row g-2">
          <div
            v-for="fn in functionButtons"
            :key="fn.key"
            class="col-6"
          >
            <button
              class="btn w-100"
              :class="fn.value ? 'btn-warning' : 'btn-outline-secondary'"
              @click="toggleFunction(fn.key)"
              :disabled="controlsDisabled"
            >
              <i :class="getFunctionIcon(fn.key)"></i> {{ fn.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Release button -->
      <button
        class="btn btn-outline-danger w-100"
        @click="onRelease"
        :disabled="!isConnected || isReleasing"
      >
        <i class="fas fa-times-circle"></i>
        {{ isReleasing ? 'Releasing...' : 'Release Throttle' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'
import { PowerState } from 'jmri-client'
import type { Throttle, Direction } from '@/types/jmri'

const props = defineProps<{
  throttle: Throttle
}>()

const { isConnected, power, setThrottleSpeed, setThrottleDirection, setThrottleFunction, releaseThrottle } = useJmri()

const isReleasing = ref(false)
const isRamping = ref(false)
const emergencyStop = ref(false)

// Power level buttons: 0%, 20%, 40%, 60%, 80%, 100%
const powerLevels = [0, 0.2, 0.4, 0.6, 0.8, 1.0]

// Disable controls when not connected or power is off
const controlsDisabled = computed(() => {
  return !isConnected.value || power.value !== PowerState.ON
})

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://placehold.co/100x100/2d2d2d/888888?text=Loco'

// Track if the real image failed to load
const imageLoadFailed = ref(false)

// Compute the image source based on mock mode and load failures
const imageSrc = computed(() => {
  if (config.jmri.mock.enabled || imageLoadFailed.value || !props.throttle.thumbnailUrl) {
    return PLACEHOLDER_IMAGE
  }
  return props.throttle.thumbnailUrl
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

function onImageError() {
  imageLoadFailed.value = true
}

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

    // Scale duration with distance: 20% change = 1s, 100% change = 5s
    // This simulates realistic acceleration/deceleration with momentum
    const baseDuration = 5000 // 5 seconds for full 0-100% range
    const duration = Math.max(600, baseDuration * distance) // Min 600ms
    const steps = Math.max(4, Math.ceil(duration / interval))

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
        ? Math.pow(t, 0.5) // Ease out when accelerating (fast start, slow finish)
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

  // If moving, ramp down to 0, switch direction, then ramp back up
  if (currentSpeed > 0) {
    // Ramp down to 0
    await setPowerLevel(0)

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
