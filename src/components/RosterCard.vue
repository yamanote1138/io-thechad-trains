<template>
  <div class="card bg-dark text-light mb-2 mb-sm-3">
    <div class="card-body py-2 py-sm-3">
      <LocomotiveHeader
        :name="entry.name"
        :road="entry.road"
        :number="entry.number"
        :thumbnail-url="entry.thumbnailUrl"
        :disabled="acquireDisabled"
        :compact="true"
        @click="onAcquire"
      >
        <template #status>
          <div v-if="isAcquiring" class="text-warning small mt-1">
            <i class="fas fa-spinner fa-spin"></i> Acquiring...
          </div>
        </template>
      </LocomotiveHeader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { PowerState } from 'jmri-client'
import type { RosterEntry } from '@/types/jmri'
import LocomotiveHeader from './LocomotiveHeader.vue'

const props = defineProps<{
  entry: RosterEntry
}>()

const { isConnected, power, acquireThrottle } = useJmri()

const isAcquiring = ref(false)

// Disable acquire button when not connected or power is off
const acquireDisabled = computed(() => {
  return !isConnected.value || power.value !== PowerState.ON || isAcquiring.value
})

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
/* Component-specific styles can go here if needed */
</style>
