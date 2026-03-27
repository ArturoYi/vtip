import { ref, watch, type Ref } from 'vue';

export type MediaLoadStatus = 'loading' | 'loaded' | 'error';

/**
 * 跟踪远程媒体（图片、音频等）加载状态，随 src 变化重置。
 */
export function useMediaLoadStatus(src: Ref<string>): {
  status: Ref<MediaLoadStatus>;
  markLoaded: () => void;
  markError: () => void;
} {
  const status = ref<MediaLoadStatus>('loading');

  watch(
    src,
    (s) => {
      if (s == null || String(s).trim() === '') {
        status.value = 'error';
        return;
      }
      status.value = 'loading';
    },
    { immediate: true }
  );

  function markLoaded(): void {
    status.value = 'loaded';
  }

  function markError(): void {
    status.value = 'error';
  }

  return { status, markLoaded, markError };
}
