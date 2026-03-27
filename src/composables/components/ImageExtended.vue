<script lang="ts" setup>
import type { NodeViewProps } from '@tiptap/vue-3';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ImageOff, Loader2, X } from 'lucide-vue-next';
import MediaExtended from '../commands/MediaExtended.vue';
import { useMediaLoadStatus } from './useMediaLoadStatus';
import { t, locale } from '../i18n';

const props = defineProps<NodeViewProps>();

const src = computed(() => String(props.node.attrs.src ?? ''));
const { status, markLoaded, markError } = useMediaLoadStatus(src);

const imgRef = ref<HTMLImageElement | null>(null);

/** 仅只读模式下允许全屏预览，避免与编辑态选区、缩放手势冲突 */
const isReadOnly = computed(() => !props.editor?.isEditable);

const previewOpen = ref(false);
const previewDialogRef = ref<HTMLElement | null>(null);

/** 轻预览内缩放/平移（仅遮罩打开时有效） */
const previewScale = ref(1);
const previewPanX = ref(0);
const previewPanY = ref(0);
const MIN_PREVIEW_SCALE = 0.5;
const MAX_PREVIEW_SCALE = 4;

/**
 * 预览手势：Pointer Events 统一接鼠标 / 触控笔 / 触摸屏，
 * setPointerCapture 保证拖出图片区域仍跟手；双指捏合同时取消单指平移。
 */
const previewGesture = {
  points: new Map<number, { x: number; y: number }>(),
  pinching: false,
  panPointerId: null as number | null,
  pinchD0: 0,
  pinchS0: 1,
  pan0: { x: 0, y: 0, tx: 0, ty: 0 }
};

function previewTwoFingerDistance(): number {
  const v = [...previewGesture.points.values()];
  if (v.length < 2) return 0;
  return Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
}

function resetPreviewGesture(): void {
  previewGesture.points.clear();
  previewGesture.pinching = false;
  previewGesture.panPointerId = null;
}

const canPreview = computed(
  () => isReadOnly.value && status.value === 'loaded' && src.value !== ''
);

const caption = computed(() => {
  const raw = props.node.attrs.title;
  if (raw == null || String(raw).trim() === '') return null;
  return String(raw);
});

/**
 * 缓存命中的图片可能在挂载前就已 decode 完成，早于 @load 绑定，导致 status 一直停在 loading、
 * 占位层挡住点击。根据 complete / naturalWidth 补上终态。
 */
function syncImageAlreadyDecoded(): void {
  const el = imgRef.value;
  if (!el || src.value.trim() === '') return;
  if (!el.complete) return;
  if (el.naturalWidth > 0) {
    markLoaded();
  } else {
    markError();
  }
}

watch(src, () => {
  void nextTick(syncImageAlreadyDecoded);
});

onMounted(() => {
  void nextTick(syncImageAlreadyDecoded);
});

function openPreview(e?: MouseEvent): void {
  if (!canPreview.value) return;
  e?.stopPropagation();
  previewOpen.value = true;
}

function closePreview(): void {
  previewOpen.value = false;
}

function resetPreviewView(): void {
  previewScale.value = 1;
  previewPanX.value = 0;
  previewPanY.value = 0;
  resetPreviewGesture();
}

function onPreviewWheel(e: WheelEvent): void {
  e.preventDefault();
  /** 触控板捏合缩放常带 ctrlKey；步进略小更顺 */
  const trackpadPinch = e.ctrlKey || e.metaKey;
  const factor =
    e.deltaY < 0 ? (trackpadPinch ? 1.06 : 1.1) : trackpadPinch ? 0.94 : 0.9;
  previewScale.value = Math.min(
    MAX_PREVIEW_SCALE,
    Math.max(MIN_PREVIEW_SCALE, previewScale.value * factor)
  );
}

function tryResumeSingleFingerPan(el: HTMLElement): void {
  if (previewGesture.points.size !== 1 || previewScale.value <= 1) return;
  const remId = previewGesture.points.keys().next().value as number;
  const p = previewGesture.points.get(remId);
  if (p == null) return;
  previewGesture.panPointerId = remId;
  previewGesture.pan0 = {
    x: p.x,
    y: p.y,
    tx: previewPanX.value,
    ty: previewPanY.value
  };
  try {
    el.setPointerCapture(remId);
  } catch {
    /* empty */
  }
}

function onPreviewPointerDown(e: PointerEvent): void {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const el = e.currentTarget as HTMLElement;

  previewGesture.points.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (previewGesture.points.size === 2) {
    previewGesture.pinching = true;
    if (previewGesture.panPointerId != null) {
      try {
        el.releasePointerCapture(previewGesture.panPointerId);
      } catch {
        /* empty */
      }
      previewGesture.panPointerId = null;
    }
    previewGesture.pinchD0 = Math.max(previewTwoFingerDistance(), 1);
    previewGesture.pinchS0 = previewScale.value;
  } else if (previewGesture.points.size === 1 && previewScale.value > 1 && !previewGesture.pinching) {
    previewGesture.panPointerId = e.pointerId;
    previewGesture.pan0 = {
      x: e.clientX,
      y: e.clientY,
      tx: previewPanX.value,
      ty: previewPanY.value
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* empty */
    }
  }
}

function onPreviewPointerMove(e: PointerEvent): void {
  if (!previewGesture.points.has(e.pointerId)) return;
  previewGesture.points.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (previewGesture.pinching && previewGesture.points.size >= 2) {
    const d = previewTwoFingerDistance();
    if (d > 0 && previewGesture.pinchD0 > 0) {
      previewScale.value = Math.min(
        MAX_PREVIEW_SCALE,
        Math.max(MIN_PREVIEW_SCALE, previewGesture.pinchS0 * (d / previewGesture.pinchD0))
      );
    }
  } else if (
    previewGesture.panPointerId === e.pointerId &&
    !previewGesture.pinching &&
    previewScale.value > 1
  ) {
    previewPanX.value = previewGesture.pan0.tx + (e.clientX - previewGesture.pan0.x);
    previewPanY.value = previewGesture.pan0.ty + (e.clientY - previewGesture.pan0.y);
  }
}

function onPreviewPointerUp(e: PointerEvent): void {
  const el = e.currentTarget as HTMLElement;
  const id = e.pointerId;
  if (id === previewGesture.panPointerId) {
    try {
      el.releasePointerCapture(id);
    } catch {
      /* empty */
    }
    previewGesture.panPointerId = null;
  }
  previewGesture.points.delete(id);
  if (previewGesture.points.size < 2) {
    previewGesture.pinching = false;
  }
  tryResumeSingleFingerPan(el);
}

watch(previewScale, (s) => {
  if (s <= 1) {
    previewPanX.value = 0;
    previewPanY.value = 0;
  }
});

watch(previewOpen, (open, _wasOpen, onCleanup) => {
  if (!open) {
    resetPreviewView();
    document.body.style.overflow = '';
    return;
  }
  resetPreviewView();
  document.body.style.overflow = 'hidden';
  void nextTick(() => {
    previewDialogRef.value?.focus();
  });
  function onWindowKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      closePreview();
      return;
    }
    if (ev.key === '+' || ev.key === '=' || ev.code === 'NumpadAdd') {
      ev.preventDefault();
      previewScale.value = Math.min(MAX_PREVIEW_SCALE, previewScale.value * 1.15);
      return;
    }
    if (ev.key === '-' || ev.key === '_' || ev.code === 'NumpadSubtract') {
      ev.preventDefault();
      previewScale.value = Math.max(MIN_PREVIEW_SCALE, previewScale.value / 1.15);
    }
  }
  window.addEventListener('keydown', onWindowKeydown);
  onCleanup(() => {
    window.removeEventListener('keydown', onWindowKeydown);
    document.body.style.overflow = '';
    resetPreviewGesture();
  });
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  resetPreviewGesture();
});

const imageErrorAria = computed(() => {
  const base = t('mediaImageAriaLoadFailed');
  const raw = props.node.attrs.alt;
  if (raw == null || String(raw).trim() === '') return base;
  const sep = locale.value === 'zh' ? '：' : ': ';
  return `${base}${sep}${String(raw)}`;
});
</script>

<template>
  <MediaExtended v-bind="props" v-slot="{ setMediaRef }">
    <div
      :ref="setMediaRef"
      class="edra-media-asset-root relative w-full overflow-hidden rounded-md bg-[color-mix(in_srgb,var(--vtip-placeholder-text,#9ca3af)_14%,transparent)]"
      :class="status !== 'loaded' ? 'min-h-48' : ''"
    >
      <img
        ref="imgRef"
        v-show="status !== 'error'"
        :src="props.node.attrs.src"
        :alt="props.node.attrs.alt"
        :title="props.node.attrs.title"
        class="relative z-0 m-0 block w-full max-w-full object-cover"
        :class="canPreview ? 'cursor-zoom-in' : ''"
        :tabindex="canPreview ? 0 : undefined"
        :role="canPreview ? 'button' : undefined"
        :aria-label="canPreview ? t('mediaImagePreviewOpen') : undefined"
        @load="markLoaded"
        @error="markError"
        @click="openPreview($event)"
        @keydown.enter.prevent="openPreview()"
        @keydown.space.prevent="openPreview()"
      />
      <div
        v-if="status === 'loading'"
        class="edra-media-placeholder edra-media-placeholder--image absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 bg-[color-mix(in_srgb,var(--vtip-placeholder-text,#9ca3af)_14%,transparent)] py-10 text-[var(--vtip-placeholder-text,#6b7280)]"
        aria-busy="true"
      >
        <Loader2 class="size-10 animate-spin opacity-70" aria-hidden="true" />
        <span class="text-sm">{{ t('mediaImageLoading') }}</span>
      </div>
      <div
        v-else-if="status === 'error'"
        class="edra-media-placeholder edra-media-placeholder--image flex min-h-48 flex-col items-center justify-center gap-2 py-10 text-[var(--vtip-placeholder-text,#6b7280)]"
        role="img"
        :aria-label="imageErrorAria"
      >
        <ImageOff class="size-10 opacity-80" aria-hidden="true" />
        <span class="text-sm">{{ t('mediaImageLoadFailed') }}</span>
      </div>
    </div>
    <Teleport to="body">
      <div
        v-if="previewOpen"
        ref="previewDialogRef"
        class="vtip-image-preview fixed inset-0 z-[10050] flex flex-col bg-black/80 outline-none"
        role="dialog"
        aria-modal="true"
        :aria-label="t('mediaImagePreviewDialog')"
        tabindex="-1"
        @click.self="closePreview"
      >
        <button
          type="button"
          class="vtip-image-preview-close absolute end-3 top-3 z-[2] flex min-h-11 min-w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full border-2 border-white/80 text-white shadow-[0_2px_12px_rgba(0,0,0,0.55)] [-webkit-tap-highlight-color:transparent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 active:brightness-95"
          style="background-color: rgb(55, 55, 55)"
          :aria-label="t('mediaImagePreviewClose')"
          @click.stop="closePreview"
        >
          <X class="size-6 shrink-0" aria-hidden="true" />
        </button>
        <div
          class="flex min-h-0 flex-1 touch-none flex-col overscroll-none pt-14"
          @wheel.prevent="onPreviewWheel"
        >
          <div
            class="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3"
            @click.self="closePreview"
          >
            <div
              class="max-w-full origin-center touch-none select-none"
              :class="previewScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'"
              :style="{
                transform: `translate(${previewPanX}px, ${previewPanY}px) scale(${previewScale})`
              }"
              @click.stop
              @pointerdown="onPreviewPointerDown"
              @pointermove="onPreviewPointerMove"
              @pointerup="onPreviewPointerUp"
              @pointercancel="onPreviewPointerUp"
            >
              <img
                :src="src"
                :alt="props.node.attrs.alt"
                draggable="false"
                class="pointer-events-none max-h-[min(85vh,100%)] max-w-full object-contain shadow-xl"
              />
            </div>
          </div>
          <p
            v-if="caption != null"
            class="shrink-0 px-3 pb-3 text-center text-sm text-white/90"
            @click.stop
          >
            {{ caption }}
          </p>
        </div>
      </div>
    </Teleport>
  </MediaExtended>
</template>
