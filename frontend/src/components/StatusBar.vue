<template>
  <div class="alert mb-3" :class="isConnected ? 'alert-success' : 'alert-danger'">
    <i class="fas" :class="isConnected ? 'fa-plug' : 'fa-plug-circle-xmark'"></i>
    {{ isConnected ? 'Connected to JMRI' : 'Disconnected from JMRI' }}
    <span v-if="isMockMode" class="badge bg-warning text-dark ms-2">
      <i class="fas fa-flask"></i> Mock Mode
    </span>
    <span v-if="!isConnected" class="ms-2">
      <small>Attempting to reconnect...</small>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'
import { config } from '@/config'

const { isConnected } = useJmri()
const isMockMode = config.jmri.mock.enabled
</script>
