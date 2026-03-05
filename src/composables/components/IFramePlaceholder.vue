<script setup lang="ts">
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/vue-3';
import { ref } from 'vue';
import { Link, Globe } from 'lucide-vue-next';
import { useScreen } from '../useScreen';

const props = defineProps<NodeViewProps>();
const { editor } = props;
const { isMaxSm } = useScreen();

const iframeUrl = ref('');

function handleSubmit(e: Event) {
  e.preventDefault();
  if (iframeUrl.value) {
    editor.chain().focus().setIFrame({ src: iframeUrl.value }).run();
  }
}
</script>

<template>
  <NodeViewWrapper
    class="media-placeholder-container my-4 relative w-full min-w-0 group"
    contenteditable="false"
  >
    <!-- Read-only State -->
    <div
      v-if="!editor.isEditable"
      :class="[
        'flex flex-col items-center justify-center w-full rounded-xl border border-dashed border-[var(--vtip-placeholder-border)] bg-[var(--vtip-placeholder-bg)] text-[var(--vtip-placeholder-text)]',
        isMaxSm ? 'h-[300px]' : 'h-[150px]'
      ]"
    >
      <Globe class="w-10 h-10 opacity-50 mb-3" stroke-width="1.5" />
      <span class="text-sm">No embed selected</span>
    </div>

    <div
      v-else
      class="w-full min-w-0 max-w-full rounded-xl border border-dashed border-[var(--vtip-placeholder-border)] bg-[var(--vtip-placeholder-bg)] overflow-hidden relative"
    >
      <div
        :class="[
          'flex items-center justify-center min-w-0 rounded-xl',
          isMaxSm ? 'w-full h-[200px] p-4' : 'w-full max-w-2xl h-[150px] p-6'
        ]"
      >
        <form
          class="link-form flex flex-col w-full min-w-0 max-w-full sm:max-w-[360px] gap-3 overflow-hidden"
          @submit="handleSubmit"
        >
          <div class="flex items-center gap-2 mb-1 text-[var(--vtip-placeholder-text)]">
            <Globe class="w-5 h-5 opacity-70 shrink-0" stroke-width="1.5" />
            <span class="text-sm font-medium">Embed URL</span>
          </div>
          <div
            :class="[
              'link-form__input flex items-center gap-2 min-h-[44px] px-3 rounded-lg border border-[var(--vtip-slash-menu-border)] bg-[var(--vtip-code-bg)] shadow-sm transition-[border-color,box-shadow]',
              'focus-within:border-[var(--vtip-code-function)] focus-within:ring-2 focus-within:ring-[var(--vtip-code-function)]/20'
            ]"
          >
            <Link class="w-4 h-4 text-[var(--vtip-placeholder-text)] shrink-0" />
            <input
              v-model="iframeUrl"
              placeholder="Paste embed URL..."
              required
              type="url"
              class="link-form__field flex-1 bg-transparent border-none outline-none text-sm text-[var(--vtip-slash-item-text)] placeholder-[var(--vtip-placeholder-text)] min-h-[28px]"
              @keydown.stop
            />
          </div>
          <button
            type="submit"
            class="vtip-btn vtip-btn--primary w-full min-h-[44px] py-2.5 flex-shrink-0"
            title="Embed IFrame"
          >
            <Link class="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<style scoped>
.media-placeholder-container * {
  transition-property: color, background-color, border-color, opacity, transform, box-shadow;
  transition-duration: 200ms;
}

.link-form__input {
  min-width: 0;
}

.link-form__field {
  min-width: 0;
}
</style>
