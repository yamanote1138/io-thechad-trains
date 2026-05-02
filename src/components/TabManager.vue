<template>
  <div class="flex items-center w-full">
    <!-- Sortable tab list -->
    <VueDraggable
      v-model="localTabs"
      tag="ul"
      class="flex flex-wrap -mb-px text-sm md:text-base font-medium flex-1"
      :animation="150"
      handle=".tab-drag-handle"
      @end="onReorder"
    >
      <li v-for="tab in localTabs" :key="tab.id" class="me-2 relative group">
        <button
          class="inline-flex items-center justify-center p-4 md:px-5 md:py-4 border-b-2 rounded-t transition-colors"
          :class="activeTab === tab.id
            ? 'text-blue-400 border-blue-400'
            : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/30'"
          @click="$emit('select', tab.id)"
          @dblclick="startRename(tab.id)"
        >
          <!-- Drag handle (only visible in edit mode) -->
          <UIcon name="i-heroicons-bars-2" class="tab-drag-handle w-3 h-3 me-1 text-white/30 cursor-grab active:cursor-grabbing" />
          <UIcon :name="tab.icon" class="w-4 h-4 md:w-5 md:h-5 me-2" />

          <!-- Inline rename -->
          <input
            v-if="renamingTabId === tab.id"
            ref="renameInput"
            v-model="renameValue"
            class="bg-transparent border-b border-blue-400 outline-none text-white w-24 text-sm"
            @keydown.enter="commitRename(tab.id)"
            @keydown.escape="renamingTabId = null"
            @blur="commitRename(tab.id)"
            @click.stop
          />
          <span v-else>{{ tab.name }}</span>
        </button>

        <!-- Delete button (hover) -->
        <button
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-800 border border-white/20
                 text-white/40 hover:text-red-400 hover:bg-red-400/10 hidden group-hover:flex
                 items-center justify-center transition-colors"
          title="Delete tab"
          @click.stop="confirmDelete(tab)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-2.5 h-2.5" />
        </button>
      </li>
    </VueDraggable>

    <!-- Add tab button -->
    <button
      class="flex items-center gap-1 px-3 py-4 text-white/40 hover:text-white/70 transition-colors flex-shrink-0 text-sm"
      title="Add tab"
      @click="showAddModal = true"
    >
      <UIcon name="i-heroicons-plus" class="w-4 h-4" />
    </button>

    <!-- Edit mode badge -->
    <div class="flex items-center gap-2 px-2 pb-px flex-shrink-0">
      <span class="text-xs text-amber-400 font-medium px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
        Editing
      </span>
    </div>
  </div>

  <!-- Add Tab Modal -->
  <UModal v-model:open="showAddModal" title="Add Tab" :ui="{ content: 'max-w-sm' }">
    <template #body>
      <div class="space-y-3">
        <div>
          <label class="text-sm text-neutral-300 block mb-1">Name</label>
          <UInput v-model="newTabName" placeholder="e.g. Controls" class="w-full" @keydown.enter="addTab" />
        </div>
        <div>
          <label class="text-sm text-neutral-300 block mb-1">Icon</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="opt in ICON_OPTIONS"
              :key="opt.icon"
              class="p-2 rounded border transition-colors"
              :class="newTabIcon === opt.icon
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-white/20 bg-white/5 hover:border-white/40'"
              :title="opt.label"
              @click="newTabIcon = opt.icon"
            >
              <UIcon :name="opt.icon" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="showAddModal = false">Cancel</UButton>
        <UButton color="primary" :disabled="!newTabName.trim()" @click="addTab">Add Tab</UButton>
      </div>
    </template>
  </UModal>

  <!-- Delete Confirm Modal -->
  <UModal v-model:open="showDeleteModal" title="Delete Tab" :ui="{ content: 'max-w-sm' }">
    <template #body>
      <p class="text-neutral-300 text-sm">
        Delete <strong>{{ deletingTab?.name }}</strong>?
        <span v-if="deletingTab && tabWidgetCount(deletingTab.id) > 0" class="text-amber-400">
          This tab has {{ tabWidgetCount(deletingTab.id) }} widget(s) that will also be removed.
        </span>
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="showDeleteModal = false">Cancel</UButton>
        <UButton color="error" @click="deleteTab">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useConfig } from '@/core/useConfig'
import type { TabConfig } from '@/core/types'

const ICON_OPTIONS = [
  { icon: 'i-mdi-train',           label: 'Train' },
  { icon: 'i-mdi-tram',            label: 'Tram' },
  { icon: 'i-mdi-source-branch',   label: 'Turnout' },
  { icon: 'i-mdi-lightbulb-outline', label: 'Light' },
  { icon: 'i-mdi-home',            label: 'Home' },
  { icon: 'i-mdi-view-grid',       label: 'Grid' },
  { icon: 'i-heroicons-bolt',       label: 'Power' },
  { icon: 'i-mdi-map',             label: 'Map' },
  { icon: 'i-mdi-controller',      label: 'Controller' },
  { icon: 'i-mdi-gauge',           label: 'Gauge' },
  { icon: 'i-mdi-cog',             label: 'Settings' },
  { icon: 'i-mdi-star',            label: 'Star' },
]

const props = defineProps<{ activeTab: string }>()
const emit = defineEmits<{
  select: [tabId: string]
  tabsChanged: []
}>()

const cfg = useConfig()

const localTabs = ref<TabConfig[]>([...cfg.tabs.value])

watch(cfg.tabs, (t) => { localTabs.value = [...t] })

// ── Rename ────────────────────────────────────────────────────────────────────

const renamingTabId = ref<string | null>(null)
const renameValue = ref('')
const renameInput = ref<HTMLInputElement | null>(null)

function startRename(tabId: string) {
  const tab = localTabs.value.find(t => t.id === tabId)
  if (!tab) return
  renameValue.value = tab.name
  renamingTabId.value = tabId
  nextTick(() => renameInput.value?.select())
}

function commitRename(tabId: string) {
  const trimmed = renameValue.value.trim()
  if (!trimmed) { renamingTabId.value = null; return }
  cfg.saveTabs(cfg.tabs.value.map(t => t.id === tabId ? { ...t, name: trimmed } : t))
  renamingTabId.value = null
  emit('tabsChanged')
}

// ── Reorder ───────────────────────────────────────────────────────────────────

function onReorder() {
  cfg.saveTabs(localTabs.value)
  emit('tabsChanged')
}

// ── Add ───────────────────────────────────────────────────────────────────────

const showAddModal = ref(false)
const newTabName = ref('')
const newTabIcon = ref('i-mdi-view-grid')

function addTab() {
  const name = newTabName.value.trim()
  if (!name) return
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
  const newTab: TabConfig = { id, name, icon: newTabIcon.value, widgets: [] }
  cfg.saveTabs([...cfg.tabs.value, newTab])
  emit('select', id)
  emit('tabsChanged')
  showAddModal.value = false
  newTabName.value = ''
  newTabIcon.value = 'i-mdi-view-grid'
}

// ── Delete ────────────────────────────────────────────────────────────────────

const showDeleteModal = ref(false)
const deletingTab = ref<TabConfig | null>(null)

function tabWidgetCount(tabId: string): number {
  return cfg.tabs.value.find(t => t.id === tabId)?.widgets.length ?? 0
}

function confirmDelete(tab: TabConfig) {
  deletingTab.value = tab
  showDeleteModal.value = true
}

function deleteTab() {
  if (!deletingTab.value) return
  const remaining = cfg.tabs.value.filter(t => t.id !== deletingTab.value!.id)
  cfg.saveTabs(remaining)
  showDeleteModal.value = false
  emit('tabsChanged')
  deletingTab.value = null
}
</script>
