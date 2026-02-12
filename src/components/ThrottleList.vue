<template>
  <div>
    <!-- All Locomotives -->
    <div v-if="roster.length > 0">
      <h4 class="text-light mb-3">
        <i class="fas fa-train"></i> Locomotives
      </h4>
      <div class="row">
        <div
          v-for="entry in roster"
          :key="'loco-' + entry.address"
          class="col-12 col-lg-6 col-xxl-4"
        >
          <!-- Show ThrottleCard if acquired, otherwise RosterCard -->
          <ThrottleCard v-if="jmriState.throttles.has(entry.address)" :throttle="jmriState.throttles.get(entry.address)!" />
          <RosterCard v-else :entry="entry" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      No locomotives loaded. Make sure JMRI is running and has locomotives in the roster.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'
import ThrottleCard from './ThrottleCard.vue'
import RosterCard from './RosterCard.vue'

const { roster, jmriState } = useJmri()
</script>
