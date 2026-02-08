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

const applyResize = (clientX: number) => {
  const parentWidth = getParentWidth();
  if (!parentWidth) return;
  let dx = clientX - resizingInitialMouseX.value;
  if (resizingPosition.value === 'left') {
    dx = resizingInitialMouseX.value - clientX;
  }
  const deltaPercent = (dx / parentWidth) * 100;
  const newWidthPercent = Math.max(
    Math.min(resizingInitialWidthPercent.value + deltaPercent, maxWidthPercent),
    minWidthPercent
  );
  updateAttributes({ width: `${newWidthPercent}%` });
};

const handleResizeMove = (event: MouseEvent) => {
  if (!resizing.value) return;
  applyResize(event.clientX);
};

const handleTouchMove = (event: TouchEvent) => {
  if (!resizing.value) return;
  event.preventDefault();
  applyResize(event.touches[0].clientX);
};

const endResize = () => {
  if (!resizing.value) return;
  resizing.value = false;
  resizingInitialMouseX.value = 0;
  resizingInitialWidthPercent.value = 0;
  window.removeEventListener('mousemove', handleResizeMove);
  window.removeEventListener('mouseup', endResize);
  window.removeEventListener('touchmove', handleTouchMove, touchOptions);
  window.removeEventListener('touchend', endResize);
};

const startResize = (event: MouseEvent) => {
  event.preventDefault();
  resizing.value = true;
  resizingInitialMouseX.value = event.clientX;
  resizingInitialWidthPercent.value = getCurrentWidthPercent();
  window.addEventListener('mousemove', handleResizeMove);
  window.addEventListener('mouseup', endResize);
};

const handleResizingPosition = (event: MouseEvent, position: 'left' | 'right') => {
  resizingPosition.value = position;
  startResize(event);
};

const handleTouchStart = (event: TouchEvent, position: 'left' | 'right') => {
  event.preventDefault();
  resizing.value = true;
  resizingPosition.value = position;
  resizingInitialMouseX.value = event.touches[0].clientX;
  resizingInitialWidthPercent.value = getCurrentWidthPercent();
  window.addEventListener('touchmove', handleTouchMove, touchOptions);
  window.addEventListener('touchend', endResize);
};

const toggleCaption = () => {
  if (caption.value === null || caption.value.trim() === '') {
    caption.value = 'Media Caption';
    return;
  }
  caption.value = null;
};

const handleDuplicate = () => {
  if (!editor) return;
  duplicateContent(editor as Editor, node);
};

const handleFullWidth = () => {
  updateAttributes({ width: 'fit-content' });
};

onBeforeUnmount(() => {
  endResize();
});
</script>

<template>
  <NodeViewWrapper
    ref="nodeRef"
    :style="{ width: node.attrs.width }"
    :class="containerClass"
  >
    <div :class="groupClass">
      <slot :setMediaRef="setMediaRef" />

      <input
        v-if="caption !== null"
        v-model="caption"
        type="text"
        class="edra-media-caption"
      />

      <div v-if="editor?.isEditable">
        <div
          role="button"
          tabindex="0"
          aria-label="Resize left"
          class="edra-media-resize-handle edra-media-resize-handle-left"
          @mousedown="(event) => handleResizingPosition(event, 'left')"
          @touchstart="(event) => handleTouchStart(event, 'left')"
        >
          <div class="edra-media-resize-indicator"></div>
        </div>

        <div
          role="button"
          tabindex="0"
          aria-label="Resize right"
          class="edra-media-resize-handle edra-media-resize-handle-right"
          @mousedown="(event) => handleResizingPosition(event, 'right')"
          @touchstart="(event) => handleTouchStart(event, 'right')"
        >
          <div class="edra-media-resize-indicator"></div>
        </div>

        <div class="edra-media-toolbar edra-media-toolbar-audio">
          <button
            class="edra-toolbar-button"
            :class="{ active: node.attrs.align === 'left' }"
            @click="updateAttributes({ align: 'left' })"
            title="Align Left"
          >
            <AlignLeft />
          </button>
          <button
            class="edra-toolbar-button"
            :class="{ active: node.attrs.align === 'center' }"
            @click="updateAttributes({ align: 'center' })"
            title="Align Center"
          >
            <AlignCenter />
          </button>
          <button
            class="edra-toolbar-button"
            :class="{ active: node.attrs.align === 'right' }"
            @click="updateAttributes({ align: 'right' })"
            title="Align Right"
          >
            <AlignRight />
          </button>
          <button
            class="edra-toolbar-button"
            @click="toggleCaption"
            title="Caption"
          >
            <Captions />
          </button>
          <button
            class="edra-toolbar-button"
            @click="handleDuplicate"
            title="Duplicate"
          >
            <Copy />
          </button>
          <button
            class="edra-toolbar-button"
            @click="handleFullWidth"
            title="Full Screen"
          >
            <Maximize />
          </button>
          <button
            class="edra-toolbar-button edra-destructive"
            @click="deleteNode()"
            title="Delete"
          >
            <Trash2 />
          </button>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>
