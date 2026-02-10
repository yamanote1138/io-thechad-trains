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
        <input
          type="range"
          class="form-range"
          min="0"
          max="1"
          step="0.01"
          :value="throttle.speed"
          @change="onSpeedChange"
          :disabled="controlsDisabled"
        >
      </div>

      <!-- Direction buttons -->
      <div class="btn-group w-100 mb-3">
        <button
          class="btn"
          :class="throttle.direction === false ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setDirection(false)"
          :disabled="controlsDisabled"
        >
          <i class="fas fa-arrow-down"></i> Reverse
        </button>
        <button
          class="btn btn-danger"
          @click="stopThrottle"
          :disabled="controlsDisabled"
        >
          <i class="fas fa-stop"></i> Stop
        </button>
        <button
          class="btn"
          :class="throttle.direction === true ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setDirection(true)"
          :disabled="controlsDisabled"
        >
          <i class="fas fa-arrow-up"></i> Forward
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

function onSpeedChange(event: Event) {
  const speed = parseFloat((event.target as HTMLInputElement).value)
  setThrottleSpeed(props.throttle.address, speed)
}

function setDirection(direction: Direction) {
  setThrottleDirection(props.throttle.address, direction)
}

function stopThrottle() {
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
