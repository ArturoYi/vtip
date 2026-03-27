import { computed, onMounted, onUnmounted, ref, type ComputedRef } from 'vue'

export type VtipThemeMode = 'light' | 'dark' | 'auto'

/** 与 `theme.css` 中变量对应，键为 `--vtip-...`，用于按实例覆盖配色 */
export type VtipThemeTokens = Partial<Record<`--vtip-${string}`, string>>

export interface VtipThemeResolved {
  resolvedTheme: ComputedRef<'light' | 'dark'>
  themeInlineStyle: ComputedRef<Record<string, string> | undefined>
}

/**
 * 解析 `theme` / `themeTokens`，供编辑器与渲染器根节点绑定 `data-theme` 与内联 CSS 变量。
 */
export function useVtipThemeShell(
  theme: () => VtipThemeMode | undefined,
  themeTokens: () => VtipThemeTokens | undefined
): VtipThemeResolved {
  const systemDark = ref(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  let mq: MediaQueryList | undefined
  let onMqChange: (() => void) | undefined

  onMounted(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    onMqChange = () => {
      systemDark.value = mq!.matches
    }
    onMqChange()
    mq.addEventListener('change', onMqChange)
  })

  onUnmounted(() => {
    if (mq && onMqChange) {
      mq.removeEventListener('change', onMqChange)
    }
  })

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    const mode = theme() ?? 'auto'
    if (mode === 'auto') {
      return systemDark.value ? 'dark' : 'light'
    }
    return mode
  })

  const themeInlineStyle = computed(() => {
    const tokens = themeTokens()
    if (!tokens) return undefined
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(tokens)) {
      if (value != null && value !== '') {
        out[key] = value
      }
    }
    return Object.keys(out).length ? out : undefined
  })

  return { resolvedTheme, themeInlineStyle }
}
