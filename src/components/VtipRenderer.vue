<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useVtip } from '../composables/useVtip'

const props = defineProps<{
  /** 渲染内容 (HTML 或 JSON) */
  modelValue?: any
  /** 语言设置，默认为 'zh' */
  locale?: 'zh' | 'en'
}>()

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
  <div class="vtip-renderer" v-if="editor">
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
