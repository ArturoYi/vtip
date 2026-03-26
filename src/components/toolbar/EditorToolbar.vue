<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'
import { toolbarCommands } from '../../composables/commands/toolbar-commands'
import { t, locale } from '../../composables/i18n'
import { Undo, Redo, ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  editor: Editor
}>()

const groupOrder = ['headings', 'format', 'list', 'table', 'media'] as const

const getTooltip = (command: any) => {
  const name = t(command.name)
  return command.shortCut ? `${name} (${command.shortCut})` : name
}
</script>

<template>
  <div class="vtip-toolbar" v-if="editor">
    <!-- History Group -->
    <div class="vtip-toolbar-group">
      <button
        class="vtip-toolbar-btn"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        :title="t('undo')"
      >
        <Undo :size="18" />
      </button>
      <button
        class="vtip-toolbar-btn"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        :title="t('redo')"
      >
        <Redo :size="18" />
      </button>
    </div>

    <div class="vtip-toolbar-divider"></div>

    <!-- Dynamic Groups -->
    <template v-for="(groupKey, index) in groupOrder" :key="groupKey">
      <div class="vtip-toolbar-group" v-if="toolbarCommands[groupKey]">
        <button
          v-for="command in toolbarCommands[groupKey]"
          :key="command.name"
          class="vtip-toolbar-btn"
          :class="{ 'is-active': command.isActive?.(editor) }"
          @click="command.onClick?.(editor)"
          :disabled="command.clickable && !command.clickable(editor)"
          :title="getTooltip(command)"
        >
          <component :is="command.icon" :size="18" />
        </button>
      </div>
      <div class="vtip-toolbar-divider" v-if="index < groupOrder.length - 1 && toolbarCommands[groupKey]"></div>
    </template>
    
    <!-- Language Switcher (Optional but helpful for testing) -->
    <div class="vtip-toolbar-group vtip-toolbar-lang">
      <button class="vtip-toolbar-btn" @click="locale = locale === 'zh' ? 'en' : 'zh'">
        {{ locale === 'zh' ? 'ZH' : 'EN' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.vtip-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
}

.vtip-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.vtip-toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 4px;
}

.vtip-toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.vtip-toolbar-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.vtip-toolbar-btn.is-active {
  background-color: #f3f4f6;
  color: #2563eb;
}

.vtip-toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.vtip-toolbar-lang {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

/* Tooltip basic style imitation */
.vtip-toolbar-btn[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #1f2937;
  color: #ffffff;
  font-size: 11px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Dark mode support (if applicable) */
@media (prefers-color-scheme: dark) {
  .vtip-toolbar {
    background: #111827;
    border-bottom-color: #374151;
  }
  .vtip-toolbar-btn {
    color: #d1d5db;
  }
  .vtip-toolbar-btn:hover {
    background-color: #1f2937;
    color: #ffffff;
  }
  .vtip-toolbar-btn.is-active {
    background-color: #1f2937;
    color: #60a5fa;
  }
  .vtip-toolbar-divider {
    background: #374151;
  }
}
</style>
