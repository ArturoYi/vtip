<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3';
import { computed, ref } from 'vue';
import { Copy, Check, ChevronDown, Search, } from 'lucide-vue-next';
import {
  ComboboxRoot,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxViewport,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxPortal,
  ComboboxAnchor, // Add ComboboxAnchor
} from 'reka-ui'

const { node, extension, updateAttributes } = defineProps<NodeViewProps>();

const defaultLanguage = computed({
  get: () => node.attrs.language || 'plaintext',
  set: (language: string) => updateAttributes({ language }),
});

const preRef = ref<HTMLElement>();
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
    class="code-wrapper group rounded-lg overflow-hidden my-4 bg-[var(--vtip-code-bg)] text-[var(--vtip-code-text)] border border-border"
    :draggable="false" :spellcheck="false" contenteditable="false">
    <!-- Toolbar -->
    <div contenteditable="false"
      class="vtip-code-toolbar flex items-center justify-between px-3 py-1.5 bg-[var(--vtip-code-toolbar-bg)] text-[var(--vtip-code-toolbar-text)] text-xs select-none border-b border-border">

      <!-- Language Selector -->
      <ComboboxRoot v-model="defaultLanguage" class="relative">
        <ComboboxAnchor>
          <ComboboxTrigger
            class="flex items-center gap-1 hover:text-[var(--vtip-code-toolbar-hover)] transition-colors focus:outline-none cursor-pointer">
            <span>{{ defaultLanguage === 'plaintext' ? 'Auto' : defaultLanguage }}</span>
            <ChevronDown class="w-3 h-3 opacity-50" />
          </ComboboxTrigger>
        </ComboboxAnchor>

        <ComboboxPortal>
          <ComboboxContent
            class="z-[9999] min-w-[150px] bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-lg outline-none mt-1 max-h-[300px] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95"
            :side-offset="5" position="popper" align="start">
            <!-- Fixed Search Input -->
            <div
              class="flex items-center border-b border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 z-10 sticky top-0">
              <Search class="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              <ComboboxInput
                class="flex h-4 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search language..." autoFocus />
            </div>

            <!-- Scrollable List -->
            <ComboboxViewport class="p-1 overflow-y-auto">
              <ComboboxEmpty class="py-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No language found.
              </ComboboxEmpty>

              <ComboboxGroup>
                <ComboboxItem value="plaintext"
                  class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors">
                  <ComboboxItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <CheckIcon class="h-3 w-3" />
                  </ComboboxItemIndicator>
                  <span class="pl-6">Auto</span>
                </ComboboxItem>

                <ComboboxItem v-for="lang in languages" :key="lang" :value="lang"
                  class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors">
                  <ComboboxItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <CheckIcon class="h-3 w-3" />
                  </ComboboxItemIndicator>
                  <span class="pl-6">{{ lang }}</span>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxPortal>
      </ComboboxRoot>

      <!-- Copy Button -->
      <button contenteditable="false" @click="copyCode"
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
    <pre ref="preRef" contenteditable="true"
      class="p-4 m-0 overflow-x-auto font-mono text-sm leading-relaxed !bg-transparent"><NodeViewContent as="code" :class="`language-${defaultLanguage}`" /></pre>
  </NodeViewWrapper>
</template>

<style scoped>
.code-wrapper {
  width: 100%;
}
</style>
