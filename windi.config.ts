import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  preflight: false, // Disable preflight to avoid conflicts with Reka UI/User styles
  extract: {
    include: ['src/**/*.{vue,html,jsx,tsx,ts}'],
    exclude: ['node_modules', '.git'],
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Add custom colors here if needed
      },
    },
  },
})
