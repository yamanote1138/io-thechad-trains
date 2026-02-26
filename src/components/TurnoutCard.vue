<template>
  <div class="card bg-dark text-light mb-2 mb-sm-3">
    <div class="card-body py-2 py-sm-3">
      <!-- Turnout Header -->
      <div class="d-flex align-items-center mb-2">
        <div class="flex-grow-1">
          <h6 class="mb-0">
            {{ turnout.userName || turnout.name }}
          </h6>
          <small class="text-muted">{{ turnout.name }}</small>
        </div>
        <div class="ms-2">
          <span
            class="badge"
            :class="stateBadgeClass"
            :title="stateText"
          >
            <i class="fas" :class="stateIcon"></i>
            {{ stateText }}
          </span>
        </div>
      </div>

      <!-- Toggle Button -->
      <button
        type="button"
        class="btn w-100"
        :class="buttonClass"
        @click="onToggle"
        :disabled="controlsDisabled || isChanging"
      >
        <i v-if="!isChanging" class="fas" :class="stateIcon"></i>
        <i v-else class="fas fa-spinner fa-spin"></i>
        <span class="ms-2">{{ isChanging ? 'Changing...' : stateText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJmri } from '@/composables/useJmri'
import { PowerState } from 'jmri-client'
import { TurnoutState } from '@/types/jmri'
import type { TurnoutData } from '@/types/jmri'

const props = defineProps<{
  turnout: TurnoutData
}>()

const { isConnected, power, toggleTurnout } = useJmri()

const isChanging = ref(false)

// Disable controls when not connected or power is off
const controlsDisabled = computed(() => {
  return !isConnected.value || power.value !== PowerState.ON
})

// Button styling based on state
const buttonClass = computed(() => {
  switch (props.turnout.state) {
    case TurnoutState.CLOSED:
      return 'btn-success'
    case TurnoutState.THROWN:
      return 'btn-warning'
    case TurnoutState.INCONSISTENT:
      return 'btn-danger'
    case TurnoutState.UNKNOWN:
    default:
      return 'btn-secondary'
  }
})

// State badge styling
const stateBadgeClass = computed(() => {
  switch (props.turnout.state) {
    case TurnoutState.CLOSED:
      return 'bg-success'
    case TurnoutState.THROWN:
      return 'bg-warning text-dark'
    case TurnoutState.INCONSISTENT:
      return 'bg-danger'
    case TurnoutState.UNKNOWN:
    default:
      return 'bg-secondary'
  }
})

const stateText = computed(() => {
  switch (props.turnout.state) {
    case TurnoutState.CLOSED:
      return 'Closed'
    case TurnoutState.THROWN:
      return 'Thrown'
    case TurnoutState.INCONSISTENT:
      return 'Error'
    case TurnoutState.UNKNOWN:
    default:
      return 'Unknown'
  }
})

const stateIcon = computed(() => {
  switch (props.turnout.state) {
    case TurnoutState.CLOSED:
      return 'fa-right-left'
    case TurnoutState.THROWN:
      return 'fa-shuffle'
    case TurnoutState.INCONSISTENT:
      return 'fa-triangle-exclamation'
    case TurnoutState.UNKNOWN:
    default:
      return 'fa-circle-question'
  }
})

async function onToggle() {
  isChanging.value = true
  try {
    await toggleTurnout(props.turnout.name)
  } finally {
    // Add small delay so user sees feedback before state updates
    setTimeout(() => {
      isChanging.value = false
    }, 300)
  }
}
</script>

<style scoped>
/* Match existing card styling */
</style>
