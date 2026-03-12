<script setup lang="ts">
import { ref } from 'vue'
import { useVtip, EditorContent, TableColMenu, TableRowMenu } from './index'
import EditorToolbar from './components/toolbar/EditorToolbar.vue'

const content = ref('<ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>34</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>34</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>34</p></div></li></ul><p></p>')

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
