<template>
  <div class="card bg-dark text-light mb-3">
    <div class="card-body">
      <!-- Locomotive header with image -->
      <div class="d-flex align-items-center mb-3">
        <img
          v-if="throttle.thumbnailUrl"
          :src="throttle.thumbnailUrl"
          :alt="throttle.name"
          class="me-3"
          style="width: 100px; height: 60px; object-fit: cover;"
        >
        <div>
          <h5 class="card-title mb-0">{{ throttle.name }}</h5>
          <small class="text-muted" v-if="throttle.road || throttle.number">
            {{ throttle.road }} {{ throttle.number ? `#${throttle.number}` : '' }}
          </small>
        </div>
      </div>

      <!-- Speed control -->
      <div class="mb-3">
        <label class="form-label">Speed: {{ Math.round(throttle.speed * 100) }}%</label>
        <input
          type="range"
          class="form-range"
          min="0"
          max="1"
          step="0.01"
          :value="throttle.speed"
          @input="onSpeedChange"
          :disabled="!isConnected"
        >
      </div>

      <!-- Direction buttons -->
      <div class="btn-group w-100 mb-3">
        <button
          class="btn"
          :class="throttle.direction === true ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setDirection(true)"
          :disabled="!isConnected"
        >
          <i class="fas fa-arrow-up"></i> Forward
        </button>
        <button
          class="btn"
          :class="throttle.direction === false ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setDirection(false)"
          :disabled="!isConnected"
        >
          <i class="fas fa-arrow-down"></i> Reverse
        </button>
      </div>

      <!-- Function buttons (F0-F28) -->
      <div v-if="Object.keys(throttle.functions).length > 0" class="d-flex flex-wrap gap-2">
        <button
          v-for="(fn, key) in throttle.functions"
          :key="key"
          class="btn btn-sm"
          :class="fn.value ? 'btn-warning' : 'btn-outline-secondary'"
          @click="toggleFunction(key)"
          :disabled="!isConnected"
        >
          {{ fn.label || key }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJmri } from '@/composables/useJmri'
import type { Throttle, Direction } from '@/types/jmri'

const props = defineProps<{
  throttle: Throttle
}>()

const { isConnected, setThrottleSpeed, setThrottleDirection, setThrottleFunction } = useJmri()

function onSpeedChange(event: Event) {
  const speed = parseFloat((event.target as HTMLInputElement).value)
  setThrottleSpeed(props.throttle.address, speed)
}

function setDirection(direction: Direction) {
  setThrottleDirection(props.throttle.address, direction)
}

function toggleFunction(fnKey: string) {
  const fnNumber = parseInt(fnKey.replace('F', ''))
  const currentState = props.throttle.functions[fnKey].value
  setThrottleFunction(props.throttle.address, fnNumber, !currentState)
}
</script>
