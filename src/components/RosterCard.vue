<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <!-- Locomotive header with image -->
      <div class="d-flex align-items-center">
        <img
          :src="imageSrc"
          :alt="entry.name"
          class="loco-thumbnail me-3"
          :class="{ 'disabled': acquireDisabled }"
          @error="onImageError"
          @click="!acquireDisabled && onAcquire()"
        >
        <div class="flex-grow-1">
          <h5 class="card-title mb-0">{{ entry.name }}</h5>
          <small class="text-muted" v-if="entry.road || entry.number">
            {{ entry.road }} {{ entry.number ? `#${entry.number}` : '' }}
          </small>
          <div v-if="isAcquiring" class="text-warning small mt-1">
            <i class="fas fa-spinner fa-spin"></i> Acquiring...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'
import { PowerState } from 'jmri-client'
import type { RosterEntry } from '@/types/jmri'

const props = defineProps<{
  entry: RosterEntry
}>()

const { isConnected, power, acquireThrottle } = useJmri()

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://placehold.co/200x200/2d2d2d/888888?text=Loco'

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

<style scoped>
.loco-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@media (min-width: 576px) {
  .loco-thumbnail {
    width: 100px;
    height: 100px;
  }
}

@media (min-width: 992px) {
  .loco-thumbnail {
    width: 200px;
    height: 200px;
  }
}

.loco-thumbnail:hover:not(.disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.loco-thumbnail.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
