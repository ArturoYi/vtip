import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({
      preflight: false, // Disable preflight to avoid conflicts with Reka UI/User styles
    }),
  ],
  content: {
    pipeline: {
      include: ['src/**/*.{vue,html,jsx,tsx,ts}'],
      exclude: ['node_modules', '.git'],
    }
  },
  // UnoCSS uses 'class' strategy for dark mode by default, which matches WindiCSS 'darkMode: class'
  theme: {
    colors: {
      // Add custom colors here if needed
    },
  },
})
