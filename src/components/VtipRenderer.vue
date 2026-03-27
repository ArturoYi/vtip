<script setup lang="ts">
import { onUnmounted, watch, withDefaults } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useVtip } from '../composables/useVtip'
import { useVtipThemeShell, type VtipThemeMode, type VtipThemeTokens } from '../composables/useVtipTheme'

const props = withDefaults(defineProps<{
  /** 渲染内容 (HTML 或 JSON) */
  modelValue?: any
  /** 语言设置，默认为 'zh' */
  locale?: 'zh' | 'en'
  /** 主题：`light` / `dark`，或 `auto` 跟随系统 */
  theme?: VtipThemeMode
  /** 按实例覆盖 `theme.css` 中的 `--vtip-*` 变量 */
  themeTokens?: VtipThemeTokens
}>(), {
  theme: 'auto',
})

const { resolvedTheme, themeInlineStyle } = useVtipThemeShell(
  () => props.theme,
  () => props.themeTokens
)

const { editor } = useVtip({
  content: props.modelValue,
  editable: false,
  locale: props.locale,
})

// 当内容变化时更新编辑器
watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML() && JSON.stringify(val) !== JSON.stringify(editor.value.getJSON())) {
    editor.value.commands.setContent(val, { emitUpdate: false })
  }
})

onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div
    class="vtip-renderer"
    :data-theme="resolvedTheme"
    :style="themeInlineStyle"
    v-if="editor"
  >
    <editor-content :editor="editor" />
  </div>
</template>

<style scoped>
.vtip-renderer {
  width: 100%;
}

:deep(.tiptap) {
  outline: none;
}
</style>
