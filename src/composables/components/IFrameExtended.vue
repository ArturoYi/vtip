<script lang="ts" setup>
import type { NodeViewProps } from '@tiptap/vue-3';
import { computed, ref, watch } from 'vue';
import { MousePointerClick } from 'lucide-vue-next';
import MediaExtended from '../commands/MediaExtended.vue';

const props = defineProps<NodeViewProps>();

const isInteractive = ref(false);
const isEditable = computed(() => !!props.editor?.isEditable);

function enterInteractive() {
  if (isEditable.value) {
    isInteractive.value = true;
  }
}

function exitInteractive() {
  isInteractive.value = false;
}

watch(() => props.selected, (sel) => {
  if (!sel) exitInteractive();
});
</script>
<template>
  <MediaExtended v-bind="props" v-slot="{ setMediaRef, resizing }">
    <div class="vtip-iframe-wrap">
      <iframe
        :ref="setMediaRef"
        :src="props.node.attrs.src"
        :title="props.node.attrs.title"
        frameborder="0"
        allowfullscreen
        class="w-full max-w-full aspect-video"
      />
      <div
        v-if="isEditable && (!isInteractive || resizing)"
        class="vtip-iframe-overlay"
        @click.stop="enterInteractive"
      >
        <span v-if="!resizing" class="vtip-iframe-overlay-hint">
          <MousePointerClick class="size-4" />
          <span>Click to interact</span>
        </span>
      </div>
    </div>
  </MediaExtended>
</template>

<style scoped>
.vtip-iframe-wrap {
  position: relative;
  width: 100%;
}

.vtip-iframe-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  transition: background 0.15s;
}

.vtip-iframe-overlay:hover {
  background: rgba(0, 0, 0, 0.04);
}

.vtip-iframe-overlay-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--vtip-placeholder-text, #888);
  background: var(--vtip-placeholder-bg, rgba(255, 255, 255, 0.85));
  border: 1px solid var(--vtip-placeholder-border, #e0e0e0);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
  user-select: none;
}

.vtip-iframe-overlay:hover .vtip-iframe-overlay-hint {
  opacity: 1;
}
</style>
