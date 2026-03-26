<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useVtip } from '../composables/useVtip'
import EditorToolbar from './toolbar/EditorToolbar.vue'
import TableColMenu from '../composables/components/TableColMenu.vue'
import TableRowMenu from '../composables/components/TableRowMenu.vue'

const props = defineProps<{
  /** 编辑器内容 (HTML 或 JSON) */
  modelValue?: any
  /** 语言设置，默认为 'zh' */
  locale?: 'zh' | 'en'
  /** 自定义占位符 */
  placeholder?: string
  /** 文件上传钩子，返回上传后的 URL */
  uploadFile?: (file: File, fileType: 'image' | 'audio' | 'video') => Promise<string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

const editorWrapperRef = ref<HTMLElement | null>(null)

const { editor } = useVtip({
  content: props.modelValue,
  locale: props.locale,
  uploadFile: props.uploadFile,
  scrollParent: () => editorWrapperRef.value || window,
  onUpdate: ({ editor }) => {
    // 根据初始内容类型决定返回 HTML 还是 JSON
    const content = typeof props.modelValue === 'string' ? editor.getHTML() : editor.getJSON()
    emit('update:modelValue', content)
  },
  onFocus: () => emit('focus'),
  onBlur: () => emit('blur'),
})

// 监听外部内容变化
watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  
  const isHTML = typeof val === 'string'
  const currentContent = isHTML ? editor.value.getHTML() : editor.value.getJSON()
  
  if (isHTML) {
    if (val !== currentContent) {
      editor.value.commands.setContent(val, { emitUpdate: false })
    }
  } else {
    if (JSON.stringify(val) !== JSON.stringify(currentContent)) {
      editor.value.commands.setContent(val, { emitUpdate: false })
    }
  }
}, { deep: true })

onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div ref="editorWrapperRef" class="vtip-editor-container" v-if="editor">
    <EditorToolbar :editor="editor" />
    <div class="vtip-editor-content">
      <editor-content :editor="editor" />
    </div>
    
    <!-- 表格菜单 -->
    <TableColMenu :editor="editor" :parent-element="editorWrapperRef || undefined" />
    <TableRowMenu :editor="editor" :parent-element="editorWrapperRef || undefined" />
  </div>
</template>

<style scoped>
.vtip-editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  position: relative;
}

.vtip-editor-content {
  flex: 1;
  padding: 12px;
  min-height: 200px;
}

:deep(.tiptap) {
  outline: none;
  min-height: 180px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .vtip-editor-container {
    background: #111827;
    border-color: #374151;
  }
}
</style>
