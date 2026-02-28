<script setup lang="ts">
import type { Editor, NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, ref, type VNodeRef } from 'vue';
import { AlignCenter, AlignLeft, AlignRight, Copy, Maximize, Trash2, Captions } from 'lucide-vue-next';
import { duplicateContent } from '../utils';

const { node, editor, selected, deleteNode, updateAttributes } = defineProps<NodeViewProps>();

const minWidthPercent = 15; // 最小宽度百分比
const maxWidthPercent = 100; // 最大宽度百分比

const nodeRef = ref<HTMLElement | null>(null); // 节点引用
const mediaRef = ref<HTMLElement | null>(null); // 媒体元素引用

const resizing = ref(false); // 是否正在调整大小
const resizingInitialWidthPercent = ref(0); // 初始宽度百分比
const resizingInitialMouseX = ref(0); // 初始鼠标X坐标
const resizingPosition = ref<'left'|'center'|'right'>('center'); // 调整位置

const caption = computed<string | null>({
  get: () => (node.attrs.title ?? null),
  set: (value) => {
    const normalized = value?.trim() === '' ? null : value;
    updateAttributes({ title: normalized });
  }
}); // 标题

const wrapperClass = computed(() => [
  selected ? 'selected' : '',
  `align-${node.attrs.align}`
].filter(Boolean).join(' '));

const groupClass = computed(() => [
  'edra-media-group',
  resizing.value ? 'resizing' : ''
].filter(Boolean).join(' '));

const setMediaRef: VNodeRef = (el) => {
  mediaRef.value = el instanceof HTMLElement ? el : null;
};

</script>

<template>
  <NodeViewWrapper
    ref="nodeRef"
    :class="['edra-media-container', wrapperClass]"
  >
    <div :class="[groupClass]">
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
