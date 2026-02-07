<template>
  <div class="row">
    <div
      v-for="throttle in throttles"
      :key="throttle.address"
      class="col-12 col-lg-6 col-xxl-4"
    >
      <ThrottleCard :throttle="throttle" />
    </div>
    <div v-if="throttles.length === 0" class="col-12">
      <div class="alert alert-info">
        <i class="fas fa-info-circle"></i>
        No locomotives loaded. Make sure JMRI is running and has locomotives in the roster.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'
import ThrottleCard from './ThrottleCard.vue'

const { throttles } = useJmri()
</script>
