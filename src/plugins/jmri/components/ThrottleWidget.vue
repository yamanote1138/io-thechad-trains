<template>
  <div>
    <ThrottleCard
      v-if="throttle"
      :throttle="throttle"
    />
    <RosterCard
      v-else-if="entry"
      :entry="entry"
    />
    <div v-else class="p-3">
      <UAlert
        color="warning"
        icon="i-heroicons-question-mark-circle"
        :title="`Locomotive address ${address} not in roster`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJmri } from '@/plugins/jmri'
import ThrottleCard from './ThrottleCard.vue'
import RosterCard from './RosterCard.vue'

const props = defineProps<{ address: number }>()

const { jmriState, locoRoster } = useJmri()

const throttle = computed(() => jmriState.value.throttles.get(props.address))
const entry    = computed(() => locoRoster.value.find(e => e.address === props.address))
</script>
