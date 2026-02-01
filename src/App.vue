<script setup lang="ts">
import { ref } from 'vue'
import { useVtip, EditorContent } from './index'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './components/EditorToolbar.vue'

const content = ref('<p>Hello <b>Tiptap</b>!</p>')

const editor = useVtip({
  content: content.value,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Write something...',
    }),
  ],
  onUpdate: ({ editor }) => {
    content.value = editor.getHTML()
  },
})
</script>

<template>
  <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
    <h1>Vue3 Tiptap Editor Demo</h1>
    
    <div class="editor-wrapper">
      <EditorToolbar v-if="editor" :editor="editor" />
      <editor-content :editor="editor" class="tiptap-content" />
    </div>
    
    <div style="margin-top: 2rem; background: #f0f0f0; padding: 1rem; border-radius: 4px;">
      <h3>Preview Model Value:</h3>
      <pre style="white-space: pre-wrap; word-break: break-all;">{{ content }}</pre>
    </div>
  </div>
</template>

<style>
.editor-wrapper {
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.tiptap-content {
  padding: 1rem;
  min-height: 200px;
  outline: none;
}

.tiptap-content .ProseMirror {
  outline: none;
  min-height: 100%;
}

.tiptap-content p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
