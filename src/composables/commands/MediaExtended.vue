<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, onMounted, ref, watch, type VNodeRef } from 'vue';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-vue-next';

const { node, selected, updateAttributes, editor } = defineProps<NodeViewProps>();

/** 是否为编辑模式（可编辑时显示输入框，只读时显示文案或隐藏） */
const isEditable = computed(() => !!editor?.isEditable);

/** 水平对齐方式：left | center | right */
type AlignValue = 'left' | 'center' | 'right';

function setAlign(value: AlignValue): void {
  updateAttributes({ align: value });
}

/** 拖拽时允许的最小宽度（相对编辑器内容区的百分比） */
const minWidthPercent = 20;
/** 拖拽时允许的最大宽度（相对编辑器内容区的百分比） */
const maxWidthPercent = 100;

/** 媒体容器内层 DOM 引用，其 parentElement 为带 width 的根容器 */
const containerRef = ref<HTMLElement | null>(null);
/** 媒体元素（如图片）的 DOM 引用，由 slot 通过 setMediaRef 注入 */
const mediaRef = ref<HTMLElement | null>(null);
/** 鼠标是否悬停在媒体容器上，用于控制左右指示条显隐 */
const groupHover = ref(false);
/** 是否正处于拖拽缩放中 */
const resizing = ref(false);
/** 拖拽开始时的宽度百分比（按当前 DOM 尺寸计算） */
const resizingInitialWidthPercent = ref(0);
/** 拖拽开始时指针的 clientX，用于计算位移 */
const resizingInitialMouseX = ref(0);
/** 当前拖拽的是左侧还是右侧手柄 */
const resizingPosition = ref<'left' | 'right'>('left');

/** 媒体标题（对应 node.attrs.title），双向绑定到节点属性 */
const caption = computed<string | null>({
  get: () => (node.attrs.title ?? null),
  set: (value) => {
    const normalized = value?.trim() === '' ? null : value;
    updateAttributes({ title: normalized });
  }
});

/** 外层 NodeViewWrapper 的 class：选中态 + 对齐方式 */
const wrapperClass = computed(() => [
  selected ? 'selected' : '',
  `align-${node.attrs.align}`
].filter(Boolean).join(' '));

/** 媒体组内层 class：基础类名 + 拖拽中的状态类 */
const groupClass = computed(() => [
  'edra-media-group',
  resizing.value ? 'edra-media-group--resizing' : ''
].filter(Boolean).join(' '));

/** 获取编辑器内容区根元素（.ProseMirror/.tiptap），作为宽度百分比的计算基准 */
function getParentEl(): HTMLElement | null {
  const from = containerRef.value?.parentElement;
  const editorRoot = from?.closest?.('.ProseMirror') ?? from?.closest?.('.tiptap');
  return (editorRoot as HTMLElement) ?? from ?? null;
}

/** PC 端：在指定左/右侧手柄上按下时开始拖拽，记录初始宽度与指针位置 */
function startResize(e: MouseEvent, position: 'left' | 'right'): void {
  e.preventDefault();
  resizing.value = true;
  resizingPosition.value = position;
  resizingInitialMouseX.value = e.clientX;
  const parent = getParentEl();
  if (mediaRef.value && parent) {
    const currentWidth = mediaRef.value.offsetWidth;
    const parentWidth = parent.offsetWidth;
    resizingInitialWidthPercent.value = parentWidth > 0 ? (currentWidth / parentWidth) * 100 : 100;
  } else {
    const raw = node.attrs.width;
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '100'));
    resizingInitialWidthPercent.value = Number.isFinite(num) ? num : 100;
  }
}

/** PC 端：拖拽过程中根据指针位移更新宽度百分比并写回节点属性 */
function resize(e: MouseEvent): void {
  const parent = getParentEl();
  if (!resizing.value || !parent) return;
  let dx = e.clientX - resizingInitialMouseX.value;
  if (resizingPosition.value === 'left') {
    dx = resizingInitialMouseX.value - e.clientX;
  }
  const parentWidth = parent.offsetWidth;
  if (parentWidth <= 0) return;
  const deltaPercent = (dx / parentWidth) * 100;
  const newWidthPercent = Math.max(
    Math.min(resizingInitialWidthPercent.value + deltaPercent, maxWidthPercent),
    minWidthPercent
  );
  updateAttributes({ width: `${newWidthPercent}%` });
}

/** PC 端：鼠标松开时结束拖拽并重置状态 */
function endResize(): void {
  resizing.value = false;
  resizingInitialMouseX.value = 0;
  resizingInitialWidthPercent.value = 0;
}

/** 移动端：在指定左/右侧手柄上触摸开始时，记录初始宽度与触点位置 */
function handleTouchStart(e: TouchEvent, position: 'left' | 'right'): void {
  e.preventDefault();
  resizing.value = true;
  resizingPosition.value = position;
  resizingInitialMouseX.value = e.touches[0].clientX;
  const parent = getParentEl();
  if (mediaRef.value && parent) {
    const currentWidth = mediaRef.value.offsetWidth;
    const parentWidth = parent.offsetWidth;
    resizingInitialWidthPercent.value = parentWidth > 0 ? (currentWidth / parentWidth) * 100 : 100;
  } else {
    const raw = node.attrs.width;
    const num = typeof raw === 'number' ? raw : parseFloat(String(raw ?? '100'));
    resizingInitialWidthPercent.value = Number.isFinite(num) ? num : 100;
  }
}

/** 移动端：触摸移动时根据位移更新宽度百分比并写回节点属性 */
function handleTouchMove(e: TouchEvent): void {
  const parent = getParentEl();
  if (!resizing.value || !parent) return;
  let dx = e.touches[0].clientX - resizingInitialMouseX.value;
  if (resizingPosition.value === 'left') {
    dx = resizingInitialMouseX.value - e.touches[0].clientX;
  }
  const parentWidth = parent.offsetWidth;
  if (parentWidth <= 0) return;
  const deltaPercent = (dx / parentWidth) * 100;
  const newWidthPercent = Math.max(
    Math.min(resizingInitialWidthPercent.value + deltaPercent, maxWidthPercent),
    minWidthPercent
  );
  updateAttributes({ width: `${newWidthPercent}%` });
}

/** 移动端：触摸结束或取消时结束拖拽并重置状态 */
function handleTouchEnd(): void {
  resizing.value = false;
  resizingInitialMouseX.value = 0;
  resizingInitialWidthPercent.value = 0;
}

/** 挂载时在 window 上绑定拖拽相关事件，保证移出手柄后仍能继续缩放 */
onMounted(() => {
  window.addEventListener('mousemove', resize);
  window.addEventListener('mouseup', endResize);
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd);
  window.addEventListener('touchcancel', handleTouchEnd);
});

/** 卸载时移除 window 上的拖拽事件监听，避免泄漏 */
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', resize);
  window.removeEventListener('mouseup', endResize);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
  window.removeEventListener('touchcancel', handleTouchEnd);
  resizeObserver?.disconnect();
});

/** 左/右侧手柄的 mousedown 委托，调用 startResize */
function handleResizeMouseDown(position: 'left' | 'right', e: MouseEvent): void {
  startResize(e, position);
}

/** 左/右侧手柄的 touchstart 委托，调用 handleTouchStart */
function handleResizeTouchStart(position: 'left' | 'right', e: TouchEvent): void {
  handleTouchStart(e, position);
}

/** 供 slot 使用的 ref 回调，用于接收媒体元素（如图片）的 DOM，便于按实际尺寸算宽度百分比 */
const setMediaRef: VNodeRef = (el) => {
  mediaRef.value = el instanceof HTMLElement ? el : null;
};

/** 将媒体元素高度同步到容器 CSS 变量，用于限制缩放手柄高度，避免矮媒体（如 audio）时手柄超出 */
function updateMediaHeightVar(): void {
  if (!containerRef.value) return;
  const h = mediaRef.value?.offsetHeight;
  if (h != null && h > 0) {
    containerRef.value.style.setProperty('--edra-media-height', `${h}px`);
  } else {
    containerRef.value.style.removeProperty('--edra-media-height');
  }
}

let resizeObserver: ResizeObserver | null = null;

watch(
  mediaRef,
  (el) => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (!el) {
      updateMediaHeightVar();
      return;
    }
    resizeObserver = new ResizeObserver(updateMediaHeightVar);
    resizeObserver.observe(el);
    updateMediaHeightVar();
  },
  { immediate: true }
);
</script>

<template>
  <NodeViewWrapper :class="['edra-media-container', 'edra-media-container-outer', 'my-4', wrapperClass]"
    @mouseenter="groupHover = true" @mouseleave="groupHover = false">
    <!-- 外层占满编辑器宽度，内层用百分比相对外层，这样放大可超过图片原宽 -->
    <div ref="containerRef" class="edra-media-container-inner" :style="{ width: node.attrs.width, maxWidth: '100%' }">
      <!-- 编辑模式下才显示左右缩放手柄 -->
      <template v-if="isEditable">
        <div class="edra-media-handle edra-media-handle--left" @mousedown.left="handleResizeMouseDown('left', $event)"
          @touchstart="handleResizeTouchStart('left', $event)">
          <div class="edra-media-handle-bar" :class="{ 'edra-media-handle-bar--visible': groupHover || resizing }" />
        </div>
        <div class="edra-media-handle edra-media-handle--right" @mousedown.left="handleResizeMouseDown('right', $event)"
          @touchstart="handleResizeTouchStart('right', $event)">
          <div class="edra-media-handle-bar" :class="{ 'edra-media-handle-bar--visible': groupHover || resizing }" />
        </div>
      </template>
      <div :class="[groupClass]" class="edra-media-group-inner">
        <!-- 编辑模式下才显示对齐操作栏 -->
        <div v-if="isEditable" class="edra-media-toolbar" :class="{ 'edra-media-toolbar--visible': groupHover || resizing }">
          <button type="button" class="vtip-btn vtip-btn--ghost edra-media-toolbar-btn"
            :class="{ 'edra-media-toolbar-btn--active': node.attrs.align === 'left' }" title="左对齐"
            @click="setAlign('left')">
            <AlignLeft class="size-4" />
          </button>
          <button type="button" class="vtip-btn vtip-btn--ghost edra-media-toolbar-btn"
            :class="{ 'edra-media-toolbar-btn--active': node.attrs.align === 'center' }" title="居中"
            @click="setAlign('center')">
            <AlignCenter class="size-4" />
          </button>
          <button type="button" class="vtip-btn vtip-btn--ghost edra-media-toolbar-btn"
            :class="{ 'edra-media-toolbar-btn--active': node.attrs.align === 'right' }" title="右对齐"
            @click="setAlign('right')">
            <AlignRight class="size-4" />
          </button>
        </div>
        <slot :setMediaRef="setMediaRef" />
        <!-- 编辑模式：始终显示无边框输入框，占位符 Your Media Caption -->
        <input
          v-if="isEditable"
          v-model="caption"
          type="text"
          class="edra-media-caption edra-media-caption--edit"
          placeholder="Your Media Caption"
        />
        <!-- 非编辑模式：caption 为空隐藏，有值则显示为文案 -->
        <div v-else-if="caption != null && caption !== ''" class="edra-media-caption edra-media-caption--readonly">
          {{ caption }}
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>
