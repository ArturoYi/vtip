<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Editor } from '@tiptap/vue-3'
import {
  toolbarCommands,
  getToolbarTypographyState,
  applyToolbarFontSize,
  applyToolbarTextColor,
  applyToolbarHighlightColor,
  TOOLBAR_FONT_SIZE_PRESETS,
  TOOLBAR_SWATCH_PALETTE,
  toolbarHexEquals,
  isToolbarFontSizePreset,
  type ToolbarFontSizePreset,
} from '../../composables/commands/toolbar-commands'
import { t, locale } from '../../composables/i18n'
import { Undo, Redo, Palette } from 'lucide-vue-next'

const props = defineProps<{
  editor: Editor
}>()

const groupOrder = ['headings', 'format', 'list', 'table', 'media'] as const

const typography = ref(getToolbarTypographyState(props.editor))

function syncTypographyFromEditor() {
  if (!props.editor) return
  typography.value = getToolbarTypographyState(props.editor)
}

function bindEditorTypographyEvents(ed: Editor | null | undefined) {
  if (!ed) return
  ed.on('transaction', syncTypographyFromEditor)
  ed.on('selectionUpdate', syncTypographyFromEditor)
}

function unbindEditorTypographyEvents(ed: Editor | null | undefined) {
  if (!ed) return
  ed.off('transaction', syncTypographyFromEditor)
  ed.off('selectionUpdate', syncTypographyFromEditor)
}

watch(
  () => props.editor,
  (ed, prev) => {
    unbindEditorTypographyEvents(prev)
    bindEditorTypographyEvents(ed)
    syncTypographyFromEditor()
  },
  { immediate: true }
)

const colorPopoverOpen = ref(false)
const colorAnchorRef = ref<HTMLElement | null>(null)

function handleDocPointerDown(ev: PointerEvent) {
  const root = colorAnchorRef.value
  if (!root || root.contains(ev.target as Node)) return
  colorPopoverOpen.value = false
}

watch(colorPopoverOpen, (open) => {
  if (open) {
    nextTick(() => document.addEventListener('pointerdown', handleDocPointerDown, true))
  } else {
    document.removeEventListener('pointerdown', handleDocPointerDown, true)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocPointerDown, true)
  unbindEditorTypographyEvents(props.editor)
})

const fontSizeSelectOptions = computed((): ToolbarFontSizePreset[] => {
  const cur = typography.value.fontSize
  const presets = TOOLBAR_FONT_SIZE_PRESETS
  if (cur && !isToolbarFontSizePreset(cur)) {
    return [{ value: cur }, ...presets]
  }
  return presets
})

function optionLabelFontSize(opt: ToolbarFontSizePreset) {
  return opt.labelKey ? t(opt.labelKey) : opt.value || t('fontSizeDefault')
}

function onFontSizeChange(ev: Event) {
  const v = (ev.target as HTMLSelectElement).value
  applyToolbarFontSize(props.editor, v)
}

function isTextSwatchActive(hex: string) {
  return toolbarHexEquals(typography.value.color, hex)
}

function isHighlightSwatchActive(hex: string) {
  return toolbarHexEquals(typography.value.highlightColor, hex)
}

function highlightSwatchNeedsEdge(hex: string) {
  return toolbarHexEquals(hex, '#ffffff')
}

function pickTextColor(hex: string) {
  applyToolbarTextColor(props.editor, hex)
}

function pickHighlightColor(hex: string) {
  applyToolbarHighlightColor(props.editor, hex)
}

function clearTextColor() {
  applyToolbarTextColor(props.editor, '')
}

function clearHighlightColor() {
  applyToolbarHighlightColor(props.editor, '')
}

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
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        :data-vtip-toolbar-tip="t('undo')"
        :aria-label="t('undo')"
      >
        <Undo :size="18" />
      </button>
      <button
        class="vtip-toolbar-btn"
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        :data-vtip-toolbar-tip="t('redo')"
        :aria-label="t('redo')"
      >
        <Redo :size="18" />
      </button>
    </div>

    <div class="vtip-toolbar-divider"></div>

    <!-- Font size + quick text / highlight colors（TextStyle + Highlight） -->
    <div class="vtip-toolbar-group vtip-toolbar-typography">
      <label class="vtip-toolbar-select-wrap">
        <span class="vtip-toolbar-sr-only">{{ t('fontSize') }}</span>
        <select
          class="vtip-toolbar-select"
          :value="typography.fontSize"
          :title="t('fontSize')"
          :aria-label="t('fontSize')"
          @change="onFontSizeChange"
        >
          <option v-for="opt in fontSizeSelectOptions" :key="'fs-' + opt.value" :value="opt.value">
            {{ optionLabelFontSize(opt) }}
          </option>
        </select>
      </label>
      <div class="vtip-toolbar-color-anchor" ref="colorAnchorRef">
        <button
          type="button"
          class="vtip-toolbar-btn"
          :class="{
            'is-active':
              colorPopoverOpen ||
              !!typography.color ||
              !!typography.highlightColor,
          }"
          :data-vtip-toolbar-tip="t('colorPicker')"
          :aria-label="t('colorPicker')"
          :aria-expanded="colorPopoverOpen"
          aria-haspopup="dialog"
          @click.stop="colorPopoverOpen = !colorPopoverOpen"
        >
          <Palette :size="18" />
        </button>
        <Transition name="vtip-color-popover-t">
          <div
            v-show="colorPopoverOpen"
            class="vtip-color-popover"
            role="dialog"
            :aria-label="t('colorPicker')"
            @click.stop
          >
            <section class="vtip-color-popover-block">
              <div class="vtip-color-popover-title">{{ t('textColorsSection') }}</div>
              <div class="vtip-color-grid" role="list">
                <button
                  v-for="hex in TOOLBAR_SWATCH_PALETTE"
                  :key="'tc-' + hex"
                  type="button"
                  class="vtip-swatch vtip-swatch--text"
                  :class="{ 'is-selected': isTextSwatchActive(hex) }"
                  :title="hex"
                  :aria-label="`${t('textColor')} ${hex}`"
                  role="listitem"
                  @click="pickTextColor(hex)"
                >
                  <span class="vtip-swatch-text-inner">
                    <span class="vtip-swatch-letter" :style="{ color: hex }">A</span>
                  </span>
                </button>
              </div>
              <button type="button" class="vtip-color-clear" @click="clearTextColor">
                {{ t('colorClear') }}
              </button>
            </section>
            <div class="vtip-color-popover-divider" />
            <section class="vtip-color-popover-block">
              <div class="vtip-color-popover-title">{{ t('highlightColorsSection') }}</div>
              <div class="vtip-color-grid" role="list">
                <button
                  v-for="hex in TOOLBAR_SWATCH_PALETTE"
                  :key="'hl-' + hex"
                  type="button"
                  class="vtip-swatch vtip-swatch--highlight"
                  :class="{
                    'is-selected': isHighlightSwatchActive(hex),
                    'vtip-swatch--highlight-edge': highlightSwatchNeedsEdge(hex),
                  }"
                  :style="{ backgroundColor: hex }"
                  :title="hex"
                  :aria-label="`${t('highlightColor')} ${hex}`"
                  role="listitem"
                  @click="pickHighlightColor(hex)"
                >
                  <span class="vtip-swatch-letter vtip-swatch-letter--on-fill">A</span>
                </button>
              </div>
              <button type="button" class="vtip-color-clear" @click="clearHighlightColor">
                {{ t('highlightClear') }}
              </button>
            </section>
          </div>
        </Transition>
      </div>
    </div>

    <div class="vtip-toolbar-divider"></div>

    <!-- Dynamic Groups -->
    <template v-for="(groupKey, index) in groupOrder" :key="groupKey">
      <div class="vtip-toolbar-group" v-if="toolbarCommands[groupKey]">
        <button
          v-for="command in toolbarCommands[groupKey]"
          :key="command.name"
          type="button"
          class="vtip-toolbar-btn"
          :class="{ 'is-active': command.isActive?.(editor) }"
          @click="command.onClick?.(editor)"
          :disabled="command.clickable && !command.clickable(editor)"
          :data-vtip-toolbar-tip="getTooltip(command)"
          :aria-label="getTooltip(command)"
        >
          <component :is="command.icon" :size="18" />
        </button>
      </div>
      <div class="vtip-toolbar-divider" v-if="index < groupOrder.length - 1 && toolbarCommands[groupKey]"></div>
    </template>
    
    <!-- Language Switcher (Optional but helpful for testing) -->
    <div class="vtip-toolbar-group vtip-toolbar-lang">
      <button
        type="button"
        class="vtip-toolbar-btn"
        :data-vtip-toolbar-tip="locale === 'zh' ? 'English UI' : '中文界面'"
        :aria-label="locale === 'zh' ? 'Switch to English' : '切换到中文'"
        @click="locale = locale === 'zh' ? 'en' : 'zh'"
      >
        {{ locale === 'zh' ? 'ZH' : 'EN' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 颜色继承自祖先 .vtip-editor-container 的 data-theme + --vtip-* */
.vtip-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px 12px;
  background: var(--vtip-slash-menu-bg);
  border-bottom: 1px solid var(--vtip-slash-menu-border);
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 25;
}

.vtip-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.vtip-toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--vtip-slash-menu-border);
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
  color: var(--vtip-slash-item-text);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.vtip-toolbar-btn:hover {
  background-color: var(--vtip-slash-item-bg-hover);
  color: var(--vtip-slash-item-text-hover);
}

.vtip-toolbar-btn.is-active {
  background-color: var(--vtip-slash-item-bg-hover);
  color: var(--vtip-code-function);
}

.vtip-toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.vtip-toolbar-lang {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: var(--vtip-slash-empty-text);
}

.vtip-toolbar-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.vtip-toolbar-typography {
  gap: 6px;
}

.vtip-toolbar-select-wrap {
  display: flex;
  align-items: center;
  margin: 0;
}

.vtip-toolbar-select {
  height: 32px;
  min-width: 4.5rem;
  max-width: 7rem;
  padding: 0 8px;
  font-size: 12px;
  line-height: 1.2;
  color: var(--vtip-slash-item-text);
  background-color: var(--vtip-code-bg);
  border: 1px solid var(--vtip-slash-menu-border);
  border-radius: 6px;
  cursor: pointer;
  appearance: none;
  background-image: var(--vtip-toolbar-select-chevron);
  background-repeat: no-repeat;
  background-position: right 6px center;
  padding-right: 24px;
}

.vtip-toolbar-select:hover {
  background-color: var(--vtip-slash-item-bg-hover);
  border-color: var(--vtip-placeholder-border);
}

.vtip-toolbar-select:focus {
  outline: none;
  border-color: var(--vtip-code-function);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--vtip-code-function) 22%, transparent);
}

.vtip-toolbar-color-anchor {
  position: relative;
}

.vtip-color-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  width: max-content;
  padding: 14px 14px 12px;
  background: var(--vtip-slash-menu-bg);
  border: 1px solid var(--vtip-slash-menu-border);
  border-radius: 12px;
  box-shadow: 0 16px 40px color-mix(in srgb, var(--vtip-editor-text) 18%, transparent);
}

.vtip-color-popover-block {
  margin: 0;
}

.vtip-color-popover-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vtip-slash-group-title);
  margin-bottom: 10px;
}

.vtip-color-grid {
  display: grid;
  grid-template-columns: repeat(5, 32px);
  gap: 8px;
}

.vtip-swatch {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s ease;
}

.vtip-swatch:hover {
  transform: scale(1.06);
}

.vtip-swatch:focus-visible {
  outline: 2px solid var(--vtip-code-function);
  outline-offset: 2px;
}

.vtip-swatch--text {
  background: transparent;
}

.vtip-swatch-text-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vtip-code-bg);
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vtip-editor-text) 10%, transparent);
}

.vtip-swatch-letter {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.vtip-swatch-letter--on-fill {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.vtip-swatch--highlight-edge {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--vtip-editor-text) 35%, transparent),
    0 0 0 1px color-mix(in srgb, var(--vtip-slash-menu-bg) 88%, var(--vtip-editor-text));
}

.vtip-swatch.is-selected {
  outline: 2px solid var(--vtip-code-function);
  outline-offset: 2px;
  border-radius: 8px;
}

.vtip-color-clear {
  display: block;
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  color: var(--vtip-code-function);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.vtip-color-clear:hover {
  filter: brightness(1.12);
}

.vtip-color-popover-divider {
  height: 1px;
  background: var(--vtip-slash-menu-border);
  margin: 14px 0;
}

.vtip-color-popover-t-enter-active,
.vtip-color-popover-t-leave-active {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}

.vtip-color-popover-t-enter-from,
.vtip-color-popover-t-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 仅自定义悬浮说明：避免与原生 title 重复；底色不透明以便压过下方正文 */
.vtip-toolbar-btn[data-vtip-toolbar-tip]:hover:not(:disabled)::after {
  content: attr(data-vtip-toolbar-tip);
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  /* 包含块是窄按钮时，auto 宽度会做 shrink-to-fit，提示条被压成一格一字；用 max-content 再交给 max-width 换行 */
  width: max-content;
  max-width: min(320px, 85vw);
  box-sizing: border-box;
  padding: 6px 10px;
  font-size: 11px;
  line-height: 1.35;
  font-weight: 500;
  text-align: center;
  color: var(--vtip-slash-item-text);
  background-color: var(--vtip-slash-menu-bg);
  background-clip: padding-box;
  border: 1px solid var(--vtip-slash-menu-border);
  border-radius: 6px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--vtip-slash-menu-border) 65%, transparent),
    0 10px 28px rgba(0, 0, 0, 0.22);
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
  pointer-events: none;
}
</style>
