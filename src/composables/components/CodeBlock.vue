<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3';
import { computed, ref, watch } from 'vue';
import { Copy, Check, ChevronDown, Search } from 'lucide-vue-next';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverAnchor,
  ListboxRoot,
  ListboxContent,
  ListboxItem,
} from 'reka-ui'

const { node, extension, updateAttributes } = defineProps<NodeViewProps>();
const popoverOpen = ref(false)

const defaultLanguage = computed({
  get: () => node.attrs.language || 'plaintext',
  set: (language: string) => {
    updateAttributes({ language });
  },
});

const searchValue = ref<string>('')
watch(popoverOpen, (open) => {
  if (!open) {
    searchValue.value = ''
  }
})

const isCopying = ref(false);

const languages = computed<Array<string>>(() => {
  const sortedLanguages = extension.options.lowlight.listLanguages().sort()
  const currentLanguage = defaultLanguage.value
  if (currentLanguage && sortedLanguages.includes(currentLanguage)) {
    return [currentLanguage, ...sortedLanguages.filter((lang: string) => lang !== currentLanguage)]
  }
  return sortedLanguages
});

/**
 * 过滤后的语言列表
 */
const filteredLanguages = computed<Array<string>>(() => {
  const query = searchValue.value.trim().toLowerCase()
  if (!query) return languages.value
  return languages.value.filter((lang: string) => lang.toLowerCase().includes(query))
})

const updateLanguage = (language: unknown) => {
  if (typeof language !== 'string' || language === defaultLanguage.value) {
    return
  }
  defaultLanguage.value = language
}



function copyCode() {
  const code = node.textContent || ''
  navigator.clipboard.writeText(code)
  isCopying.value = true
  setTimeout(() => {
    isCopying.value = false
  }, 1000)
}
</script>

<template>
  <NodeViewWrapper
    class="w-full group rounded-lg overflow-hidden my-4 bg-[var(--vtip-code-bg)] text-[var(--vtip-code-text)] border border-border"
    :draggable="false" :spellcheck="false">
    <!-- Toolbar -->
    <div contenteditable="false"
      class="flex items-center justify-end gap-4 px-4 py-1.5 bg-[var(--vtip-code-toolbar-bg)] text-[var(--vtip-code-toolbar-text)] text-xs select-none border-b border-border">
      <!-- Language Selector -->
      <PopoverRoot v-model:open="popoverOpen">
        <PopoverAnchor>
          <PopoverTrigger contenteditable="false"
            class="flex items-center gap-1 hover:text-[var(--vtip-code-toolbar-hover)] border-none transition-colors cursor-pointer rounded-1 focus:outline-none">
            <span>{{ defaultLanguage }}</span>
            <ChevronDown class="w-3 h-3 opacity-50" />
          </PopoverTrigger>
        </PopoverAnchor>

        <PopoverPortal>
          <PopoverContent contenteditable="false"
            class="z-[99] w-50 rounded-md border shadow-lg outline-none mt-1 p-0 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 bg-[var(--vtip-code-lang-menu-bg)] border-[var(--vtip-code-lang-menu-border)] text-[var(--vtip-code-lang-item-text)]"
            :side-offset="5" position="popper" @openAutoFocus="(e: Event) => e.preventDefault()"
            @closeAutoFocus="(e: Event) => e.preventDefault()">
            <div class="flex items-center border-b px-3 py-2 border-[var(--vtip-code-lang-menu-border)]">
              <Search class="mr-2 h-3.5 w-3.5 shrink-0 text-[var(--vtip-code-lang-search-icon)]" />
              <input v-model="searchValue" contenteditable="false"
                class="flex h-6 w-full rounded-md bg-transparent text-sm outline-none border-none appearance-none truncate text-[var(--vtip-code-lang-search-text)] placeholder:text-[var(--vtip-code-lang-search-placeholder)] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search language..." type="text" />
            </div>
            <ListboxRoot :model-value="defaultLanguage" class="flex flex-col rounded-lg"
              @update:model-value="updateLanguage">
              <ListboxContent class="p-[5px] max-h-72 overflow-auto overflow-x-hidden vtip-scrollbar">
                <div v-if="!filteredLanguages.length"
                  class="p-3 text-center text-xs text-[var(--vtip-code-lang-search-placeholder)]">
                  No result
                </div>
                <ListboxItem v-for="lang in filteredLanguages" :key="lang" :value="lang"
                  class="flex w-full min-w-0 items-center text-left bg-transparent border-none px-3 py-2 cursor-pointer rounded transition-colors duration-100 ease appearance-none overflow-hidden text-[var(--vtip-code-lang-item-text)] hover:bg-[var(--vtip-code-lang-item-bg-hover)] hover:text-[var(--vtip-code-lang-item-text-hover)] data-[state=checked]:bg-[var(--vtip-code-lang-item-bg-hover)] data-[state=checked]:text-[var(--vtip-code-lang-item-text-hover)]">
                  <span class="mr-2 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    <Check v-if="lang === defaultLanguage" class="h-3.5 w-3.5" />
                  </span>
                  <span class="truncate">{{ lang }}</span>
                </ListboxItem>
              </ListboxContent>
            </ListboxRoot>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>

      <!-- Copy Button -->
      <button contenteditable="false" @click="copyCode"
        class="flex items-center gap-1 cursor-pointer hover:text-[var(--vtip-code-toolbar-hover)] transition-colors focus:outline-none border-none rounded-1"
        :title="isCopying ? 'Copied!' : 'Copy code'">
        <span v-if="isCopying" class="flex items-center gap-1">
          <Check class="w-3.5 h-3.5" />
        </span>
        <span v-else class="flex items-center gap-1">
          <Copy class="w-3.5 h-3.5" />
        </span>
      </button>
    </div>

    <NodeViewContent as="pre"
      :class="`language-${defaultLanguage} p-4 m-0 overflow-x-auto font-mono text-sm leading-relaxed !bg-transparent`" />
  </NodeViewWrapper>
</template>
