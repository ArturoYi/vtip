<script setup lang="ts">
import { ref } from 'vue'
import { useVtip, EditorContent, TableColMenu, TableRowMenu } from './index'
import EditorToolbar from './components/toolbar/EditorToolbar.vue'

const content = ref('<table style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p></p></th><th colspan="1" rowspan="1"><p></p></th><th colspan="1" rowspan="1"><p></p></th></tr><tr><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td></tr><tr><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td></tr></tbody></table><p></p>')

const editorWrapperRef = ref<HTMLElement | null>(null)

const { editor } = useVtip({
  content: content.value,
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML()
  },
  scrollParent: () => editorWrapperRef.value ?? window,
})
</script>

<template>
  <div style="padding: 2rem; margin: 0 auto;">
    <div ref="editorWrapperRef" class="editor-wrapper" v-if="editor">
      <EditorToolbar :editor="editor" />
      <editor-content :editor="editor" />
      <TableColMenu :editor="editor" :parent-element="editorWrapperRef || undefined" />
      <TableRowMenu :editor="editor" :parent-element="editorWrapperRef || undefined" />
    </div>

    <div style="margin-top: 2rem; background: #f0f0f0; padding: 1rem; border-radius: 4px;">
      <h3>Preview Model Value:</h3>
      <pre style="white-space: pre-wrap; word-break: break-all;">{{ content }}</pre>
    </div>
  </div>
</template>

<style scoped>
</style>
