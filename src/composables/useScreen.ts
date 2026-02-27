import { ref, computed, type ComputedRef } from 'vue';

export interface MediaQueryProvider {
  isMaxSm: ComputedRef<boolean>;
  isMaxMd: ComputedRef<boolean>;
  isMaxLg: ComputedRef<boolean>;
  isMaxXl: ComputedRef<boolean>;
  isMax2Xl: ComputedRef<boolean>;
  /**
   * 当前匹配的断点列表 (例如: ['sm', 'md'] 表示当前宽度 >= md)
   */
  current: ComputedRef<string[]>;
}

// Tailwind CSS 默认断点
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// 全局单例状态，确保所有组件共享同一个响应式源
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0);

// 初始化监听器 (仅执行一次)
if (typeof window !== 'undefined') {
  const updateWidth = () => {
    windowWidth.value = window.innerWidth;
  };
  
  window.addEventListener('resize', updateWidth, { passive: true });
  
  // 初始化时更新一次
  updateWidth();
}

/**
 * 获取屏幕尺寸响应式状态
 * 基于 window.innerWidth 和 Tailwind CSS 断点
 */
export function useScreen(): MediaQueryProvider {
  // max-width 查询逻辑: isMaxSm 意味着 "当前视口宽度 < sm (640px)"
  const isMaxSm = computed(() => windowWidth.value < breakpoints.sm);
  const isMaxMd = computed(() => windowWidth.value < breakpoints.md);
  const isMaxLg = computed(() => windowWidth.value < breakpoints.lg);
  const isMaxXl = computed(() => windowWidth.value < breakpoints.xl);
  const isMax2Xl = computed(() => windowWidth.value < breakpoints['2xl']);

  const current = computed(() => {
    const matched: string[] = [];
    if (windowWidth.value >= breakpoints.sm) matched.push('sm');
    if (windowWidth.value >= breakpoints.md) matched.push('md');
    if (windowWidth.value >= breakpoints.lg) matched.push('lg');
    if (windowWidth.value >= breakpoints.xl) matched.push('xl');
    if (windowWidth.value >= breakpoints['2xl']) matched.push('2xl');
    return matched;
  });

  return {
    isMaxSm,
    isMaxMd,
    isMaxLg,
    isMaxXl,
    isMax2Xl,
    current,
  };
}
