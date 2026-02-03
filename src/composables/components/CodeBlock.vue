<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3';
import { computed, ref, watch } from 'vue';
import { Copy, Check, ChevronDown } from 'lucide-vue-next';

const { node, extension, updateAttributes } = defineProps<NodeViewProps>();

const defaultLanguage = computed({
  get: () => node.attrs.language || 'plaintext',
  set: (language: string) => updateAttributes({ language }),
});

const preRef = ref<HTMLPreElement>();
const isCopying = ref(false);

const languages = computed<Array<string>>(() => {
  return extension.options.lowlight.listLanguages().sort()
});

function copyCode() {
  if (!preRef.value) return
  const code = preRef.value.textContent || ''
  navigator.clipboard.writeText(code)
  isCopying.value = true
  setTimeout(() => {
    isCopying.value = false
  }, 1000)
}
</script>

<template>
  <NodeViewWrapper
    class="code-wrapper group rounded-lg overflow-hidden my-4 bg-[var(--vtip-code-bg)] text-[var(--vtip-code-text)]"
    :draggable="false" :spellcheck="false">
    <!-- Toolbar -->
    <div contenteditable="false"
      class="flex items-center justify-between px-3 py-1.5 bg-[var(--vtip-code-toolbar-bg)] text-[var(--vtip-code-toolbar-text)] text-xs select-none">
      <!-- Language Selector -->
      <div class="relative group/lang">
        <select v-model="defaultLanguage"
          class="appearance-none bg-transparent border-none cursor-pointer pr-4 focus:outline-none hover:text-[var(--vtip-code-toolbar-hover)] transition-colors">
          <option value="plaintext">Auto</option>
          <option v-for="(lang, index) in languages" :key="index" :value="lang">
            {{ lang }}
          </option>
        </select>
        <ChevronDown class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
      </div>

      <!-- Copy Button -->
      <button @click="copyCode"
        class="flex items-center gap-1 cursor-pointer hover:text-[var(--vtip-code-toolbar-hover)] transition-colors focus:outline-none"
        :title="isCopying ? 'Copied!' : 'Copy code'">
        <span v-if="isCopying" class="flex items-center gap-1">
          <Check class="w-3.5 h-3.5" />
          <span>Copied</span>
        </span>
        <span v-else class="flex items-center gap-1">
          <Copy class="w-3.5 h-3.5" />
          <span>Copy</span>
        </span>
      </button>
    </div>

    <!-- Code Content -->
    <pre ref="preRef" :draggable="false"
      class="p-4 m-0 overflow-x-auto font-mono text-sm leading-relaxed !bg-transparent"><NodeViewContent as="code" :class="`language-${defaultLanguage}`" v-bind="node.attrs" /></pre>
  </NodeViewWrapper>
</template>

<style scoped>
/* Scoped styles are mostly replaced by utility classes, but keeping for reference if needed */
.code-wrapper {
  /* Ensuring wrapper takes full width available */
  width: 100%;
}
</style>
