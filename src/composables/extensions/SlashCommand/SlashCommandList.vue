<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { CommandGroup } from './groups'
import { VtipToolBarCommands } from '../../commands/types';

const props = defineProps<{
  items: CommandGroup[]
  command: (item: VtipToolBarCommands) => void
}>()

const selectedGroupIndex = ref(0)
const selectedCommandIndex = ref(0)
const commandListContainer = ref<HTMLDivElement | null>(null)

const selectItem = (groupIndex: number, commandIndex: number) => {
  const item = props.items[groupIndex]?.items[commandIndex]
  if (item) {
    props.command(item)
  }
}

const updateSelection = (groupIndex: number, commandIndex: number) => {
    selectedGroupIndex.value = groupIndex
    selectedCommandIndex.value = commandIndex
}

const upHandler = () => {
    if (!props.items.length) return

    let newGroupIndex = selectedGroupIndex.value
    let newCommandIndex = selectedCommandIndex.value - 1

    if (newCommandIndex < 0) {
        newGroupIndex = newGroupIndex - 1
        if (newGroupIndex < 0) {
            newGroupIndex = props.items.length - 1
        }
        newCommandIndex = props.items[newGroupIndex].items.length - 1
    }

    updateSelection(newGroupIndex, newCommandIndex)
}

const downHandler = () => {
    if (!props.items.length) return

    let newGroupIndex = selectedGroupIndex.value
    let newCommandIndex = selectedCommandIndex.value + 1

    if (newCommandIndex >= props.items[newGroupIndex].items.length) {
        newGroupIndex = newGroupIndex + 1
        if (newGroupIndex >= props.items.length) {
            newGroupIndex = 0
        }
        newCommandIndex = 0
    }

    updateSelection(newGroupIndex, newCommandIndex)
}

const enterHandler = () => {
  selectItem(selectedGroupIndex.value, selectedCommandIndex.value)
}

const scrollToSelected = () => {
  nextTick(() => {
    if (!commandListContainer.value) return
    
    const selectedItem = commandListContainer.value.querySelector(`#slash-command-${selectedGroupIndex.value}-${selectedCommandIndex.value}`) as HTMLElement
    if (selectedItem) {
      const container = commandListContainer.value
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      if (itemTop < containerScrollTop) {
        container.scrollTop = itemTop - 5 
      } else if (itemBottom > containerScrollTop + containerHeight) {
        container.scrollTop = itemBottom - containerHeight + 5
      }
    }
  })
}

watch([selectedGroupIndex, selectedCommandIndex], () => {
  scrollToSelected()
})

watch(() => props.items, () => {
  selectedGroupIndex.value = 0
  selectedCommandIndex.value = 0
})

defineExpose({
  onKeyDown: ({ event }: { event: KeyboardEvent }) => {
    if (event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'k')) {
      upHandler()
      return true
    }
    if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'j') || event.key === 'Tab') {
      downHandler()
      return true
    }
    if (event.key === 'Enter') {
      enterHandler()
      return true
    }
    return false
  },
})
</script>

<template>
  <div class="slash-command-menu" ref="commandListContainer">
    <div v-if="items.length" class="menu-content">
        <template v-for="(group, groupIndex) in items" :key="groupIndex">
            <div v-if="group.title" class="menu-group-title">{{ group.title }}</div>
            <button
                v-for="(item, itemIndex) in group.items"
                :key="itemIndex"
                :id="`slash-command-${groupIndex}-${itemIndex}`"
                class="menu-item"
                :class="{ 'is-selected': groupIndex === selectedGroupIndex && itemIndex === selectedCommandIndex }"
                @click="selectItem(groupIndex, itemIndex)"
            >
                <div class="menu-item-content">
                    <div class="menu-item-title">{{ item.name }}</div>
                    <div class="menu-item-description">{{ item.description }}</div>
                </div>
            </button>
        </template>
    </div>
    <div v-else class="menu-empty">
      No result
    </div>
  </div>
</template>

<style scoped>
.slash-command-menu {
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  padding: 0.25rem;
  min-width: 280px;
  max-height: 300px;
  overflow-y: auto;
}

.menu-group-title {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.menu-item {
  display: flex;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #374151;
  transition: background-color 0.1s ease;
}

.menu-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.menu-item.is-selected {
  background-color: #f3f4f6;
  color: #111827;
}

.menu-item-content {
    display: flex;
    flex-direction: column;
}

.menu-item-title {
    font-size: 0.875rem;
    font-weight: 500;
}

.menu-item-description {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.125rem;
}

.menu-empty {
    padding: 0.75rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
}
</style>
