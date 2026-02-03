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
const commandListContainer = ref<HTMLElement | null>(null)

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
    const container = commandListContainer.value
    if (!container) return

    const selectedItem = container.querySelector(`#slash-command-${selectedGroupIndex.value}-${selectedCommandIndex.value}`) as HTMLElement
    if (selectedItem) {
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
}, { immediate: true })

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
  <div v-if="items.length" ref="commandListContainer"
    class="shadow-lg max-h-80 rounded-md overflow-hidden overflow-y-auto w-50 bg-[var(--vtip-slash-menu-bg)] border border-[var(--vtip-slash-menu-border)]">
    <div class="menu-content">
      <div v-for="(group, groupIndex) in items" :key="groupIndex" class="menu-group">
        <div v-if="group.title" class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--vtip-slash-group-title)]">{{
          group.title }}</div>
        <button v-for="(item, itemIndex) in group.items" :key="itemIndex"
          :id="`slash-command-${groupIndex}-${itemIndex}`"
          class="flex w-full text-left bg-transparent border-none px-3 py-2 cursor-pointer rounded transition-colors duration-100 ease appearance-none text-[var(--vtip-slash-item-text)] hover:bg-[var(--vtip-slash-item-bg-hover)] hover:text-[var(--vtip-slash-item-text-hover)] data-[state=checked]:bg-[var(--vtip-slash-item-bg-hover)] data-[state=checked]:text-[var(--vtip-slash-item-text-hover)]"
          :data-state="groupIndex === selectedGroupIndex && itemIndex === selectedCommandIndex ? 'checked' : 'unchecked'"
          @click="selectItem(groupIndex, itemIndex)">
          <div class="flex flex-row items-center">
            <component :is="item.icon" class="mr-3" />
            <div class="menu-item-title text-sm font-medium">{{ item.name }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
  <div v-else class="p-3 text-center text-sm text-[var(--vtip-slash-empty-text)]">
    No result
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
div::-webkit-scrollbar {
  width: 0.6rem;
  height: 0.6rem;
}

div::-webkit-scrollbar-track {
  background: var(--vtip-scrollbar-track);
}

div::-webkit-scrollbar-thumb {
  background: var(--vtip-scrollbar-thumb);
  border-radius: 0.3rem;
}

div::-webkit-scrollbar-thumb:hover {
  background: var(--vtip-scrollbar-thumb-hover);
}
</style>
