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

      <!-- Headlight button (F0) -->
      <div class="mb-3">
        <button
          class="btn"
          :class="headlightOn ? 'btn-warning' : 'btn-outline-secondary'"
          @click="toggleHeadlight"
          :disabled="controlsDisabled"
        >
          <i class="fas fa-lightbulb"></i> Headlight
        </button>
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

// Compute headlight state from F0
const headlightOn = computed(() => {
  return props.throttle.functions['F0']?.value || false
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

function toggleHeadlight() {
  setThrottleFunction(props.throttle.address, 0, !headlightOn.value)
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
