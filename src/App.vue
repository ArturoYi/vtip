<script setup lang="ts">
import { ref } from 'vue'
import { useVtip, EditorContent } from './index'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './components/toolbar/EditorToolbar.vue'

const content = ref('<p>Hello <strong>Tiptap</strong>!</p><p></p><pre><code></code></pre><p></p>')

const editor = useVtip({
  content: content.value,
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML()
  },
})
</script>

<template>
  <div style="padding: 2rem; margin: 0 auto;">
    <h1>Vue3 Tiptap Editor Demo</h1>
    <div class="editor-wrapper" v-if="editor">
      <EditorToolbar :editor="editor" />
      <editor-content :editor="editor" />
    </div>

    <div style="margin-top: 2rem; background: #f0f0f0; padding: 1rem; border-radius: 4px;">
      <h3>Preview Model Value:</h3>
      <pre style="white-space: pre-wrap; word-break: break-all;">{{ content }}</pre>
    </div>
  </div>
</template>

<style scoped>
</style>
