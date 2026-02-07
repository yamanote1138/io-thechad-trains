<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <h5 class="card-title">Turnouts</h5>
      <div v-if="turnouts.length > 0" class="d-flex flex-wrap gap-2">
        <button
          v-for="turnout in turnouts"
          :key="turnout.name"
          class="btn"
          :class="turnout.state === 'closed' ? 'btn-success' : 'btn-warning'"
          @click="toggleTurnout(turnout)"
          :disabled="!isConnected"
        >
          {{ turnout.name }}
          <i class="fas" :class="turnout.state === 'closed' ? 'fa-minus' : 'fa-code-branch'"></i>
        </button>
      </div>
      <div v-else class="text-muted">
        <small>No turnouts configured in JMRI</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'
import type { Turnout } from '@/types/jmri'

const { turnouts, isConnected, setTurnout } = useJmri()

function toggleTurnout(turnout: Turnout) {
  const newState = turnout.state === 'closed' ? 'thrown' : 'closed'
  setTurnout(turnout.name, newState)
}
</script>
