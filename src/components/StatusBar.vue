<template>
  <div class="alert alert-sm mb-1 mb-sm-2 py-1 py-sm-2" :class="isConnected ? 'alert-success' : 'alert-danger'">
    <i class="fas" :class="isConnected ? 'fa-plug' : 'fa-plug-circle-xmark'"></i>
    <span class="d-none d-sm-inline">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
    <span v-if="isMockMode" class="badge bg-warning text-dark ms-2">Mock</span>
    <span v-if="!isConnected" class="ms-2">
      <small>Reconnecting...</small>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'

const { isConnected, isMockMode } = useJmri()
</script>
