<script setup lang="ts">
import { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor
}>()

</script>

<template>
  <div class="tiptap-toolbar" v-if="editor">
    <button
      @click="(editor.chain().focus() as any).toggleBold().run()"
      :disabled="!(editor.can().chain().focus() as any).toggleBold().run()"
      :class="{ 'is-active': editor.isActive('bold') }"
    >
      Bold
    </button>
    <button
      @click="(editor.chain().focus() as any).toggleItalic().run()"
      :disabled="!(editor.can().chain().focus() as any).toggleItalic().run()"
      :class="{ 'is-active': editor.isActive('italic') }"
    >
      Italic
    </button>
    <button
      @click="(editor.chain().focus() as any).toggleHeading({ level: 1 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
    >
      H1
    </button>
    <button
      @click="(editor.chain().focus() as any).toggleHeading({ level: 2 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
    >
      H2
    </button>
    <button
      @click="(editor.chain().focus() as any).toggleHeading({ level: 3 }).run()"
      :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
    >
      H3
    </button>
    <button
      @click="(editor.chain().focus() as any).toggleBulletList().run()"
      :class="{ 'is-active': editor.isActive('bulletList') }"
    >
      Bullet List
    </button>
    <button
      @click="(editor.chain().focus() as any).toggleOrderedList().run()"
      :class="{ 'is-active': editor.isActive('orderedList') }"
    >
      Ordered List
    </button>
    <button
      @click="(editor.chain().focus() as any).undo().run()"
      :disabled="!(editor.can().chain().focus() as any).undo().run()"
    >
      Undo
    </button>
    <button
      @click="(editor.chain().focus() as any).redo().run()"
      :disabled="!(editor.can().chain().focus() as any).redo().run()"
    >
      Redo
    </button>
  </div>
</template>

<style scoped>
.tiptap-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #ccc;
  background-color: #f8f9fa;
}

.tiptap-toolbar button {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.tiptap-toolbar button:hover {
  background-color: #e2e6ea;
}

.tiptap-toolbar button.is-active {
  background-color: #000;
  color: white;
  border-color: #000;
}

.tiptap-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
