<script setup lang="ts">
import type { Editor, NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, ref, type VNodeRef } from 'vue';
import { AlignCenter, AlignLeft, AlignRight, Copy, Maximize, Trash2, Captions } from 'lucide-vue-next';
import { duplicateContent } from '../utils';

const { node, editor, selected, deleteNode, updateAttributes } = defineProps<NodeViewProps>();

const minWidthPercent = 15;
const maxWidthPercent = 100;

const nodeRef = ref<HTMLElement | null>(null);
const mediaRef = ref<HTMLElement | null>(null);

const resizing = ref(false);
const resizingInitialWidthPercent = ref(0);
const resizingInitialMouseX = ref(0);
const resizingPosition = ref<'left' | 'right'>('left');

const caption = computed<string | null>({
  get: () => (node.attrs.title ?? null),
  set: (value) => {
    const normalized = value?.trim() === '' ? null : value;
    updateAttributes({ title: normalized });
  }
});

const containerClass = computed(() => [
  'edra-media-container',
  selected ? 'selected' : '',
  `align-${node.attrs.align}`
].filter(Boolean).join(' '));

const groupClass = computed(() => [
  'edra-media-group',
  resizing.value ? 'resizing' : ''
].filter(Boolean).join(' '));

const touchOptions: AddEventListenerOptions = { passive: false };

const getParentWidth = () => nodeRef.value?.parentElement?.offsetWidth ?? 0;

const getCurrentWidthPercent = () => {
  const parentWidth = getParentWidth();
  const currentWidth = mediaRef.value?.offsetWidth ?? nodeRef.value?.offsetWidth ?? 0;
  if (!parentWidth) return 0;
  return (currentWidth / parentWidth) * 100;
};

const setMediaRef: VNodeRef = (el) => {
  mediaRef.value = el instanceof HTMLElement ? el : null;
};

</script>

<template>
  <NodeViewWrapper
    ref="nodeRef"
  >
    <div :class="groupClass">
      <slot :setMediaRef="setMediaRef" />

      <input
        v-if="caption !== null"
        v-model="caption"
        type="text"
        class="edra-media-caption"
      />
    </div>
  </NodeViewWrapper>
</template>
