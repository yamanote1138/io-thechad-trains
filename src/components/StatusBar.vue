<template>
  <div class="alert alert-sm mb-2 py-2" :class="isConnected ? 'alert-success' : 'alert-danger'">
    <i class="fas" :class="isConnected ? 'fa-plug' : 'fa-plug-circle-xmark'"></i>
    {{ isConnected ? 'Connected' : 'Disconnected' }}
    <span v-if="isMockMode" class="badge bg-warning text-dark ms-2">Mock</span>
    <span v-if="!isConnected" class="ms-2">
      <small>Reconnecting...</small>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'

const { isConnected } = useJmri()
const isMockMode = config.jmri.mock.enabled
</script>
