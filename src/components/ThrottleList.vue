<template>
  <div>
    <!-- Acquired Throttles Section -->
    <div v-if="throttles.length > 0" class="mb-4">
      <h4 class="text-light mb-3">
        <i class="fas fa-gamepad"></i> Active Throttles
      </h4>
      <div class="row">
        <div
          v-for="throttle in throttles"
          :key="'throttle-' + throttle.address"
          class="col-12 col-lg-6 col-xxl-4"
        >
          <ThrottleCard :throttle="throttle" />
        </div>
      </div>
    </div>

    <!-- Available Roster Section -->
    <div v-if="availableRoster.length > 0">
      <h4 class="text-light mb-3">
        <i class="fas fa-list"></i> Available Locomotives
      </h4>
      <div class="row">
        <div
          v-for="entry in availableRoster"
          :key="'roster-' + entry.address"
          class="col-12 col-lg-6 col-xxl-4"
        >
          <RosterCard :entry="entry" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="roster.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      No locomotives loaded. Make sure JMRI is running and has locomotives in the roster.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import ThrottleCard from './ThrottleCard.vue'
import RosterCard from './RosterCard.vue'

const { roster, throttles, jmriState } = useJmri()

// Compute available roster entries (not yet acquired)
const availableRoster = computed(() => {
  return roster.value.filter(entry => !jmriState.value.throttles.has(entry.address))
})
</script>
