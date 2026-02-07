<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <!-- Locomotive header with image -->
      <div class="d-flex align-items-center mb-3">
        <img
          :src="imageSrc"
          :alt="entry.name"
          class="me-3"
          style="width: 100px; height: 60px; object-fit: cover;"
          @error="onImageError"
        >
        <div class="flex-grow-1">
          <h5 class="card-title mb-0">{{ entry.name }}</h5>
          <small class="text-muted" v-if="entry.road || entry.number">
            {{ entry.road }} {{ entry.number ? `#${entry.number}` : '' }}
          </small>
        </div>
      </div>

      <!-- Acquire button -->
      <button
        class="btn btn-success w-100"
        @click="onAcquire"
        :disabled="acquireDisabled"
      >
        <i class="fas fa-plus-circle"></i>
        {{ isAcquiring ? 'Acquiring...' : 'Acquire Throttle' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'
import { PowerState } from '@/types/jmri'
import type { RosterEntry } from '@/types/jmri'

const props = defineProps<{
  entry: RosterEntry
}>()

const { isConnected, power, acquireThrottle } = useJmri()

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://placehold.co/100x60/2d2d2d/888888?text=Loco'

// Track if the real image failed to load
const imageLoadFailed = ref(false)
const isAcquiring = ref(false)

// Disable acquire button when not connected or power is off
const acquireDisabled = computed(() => {
  return !isConnected.value || power.value !== PowerState.ON || isAcquiring.value
})

// Compute the image source based on mock mode and load failures
const imageSrc = computed(() => {
  if (config.jmri.mock.enabled || imageLoadFailed.value || !props.entry.thumbnailUrl) {
    return PLACEHOLDER_IMAGE
  }
  return props.entry.thumbnailUrl
})

function onImageError() {
  imageLoadFailed.value = true
}

async function onAcquire() {
  isAcquiring.value = true
  try {
    await acquireThrottle(props.entry.address)
  } finally {
    isAcquiring.value = false
  }
}
</script>
