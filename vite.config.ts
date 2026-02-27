import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
    }),
  ],
  server: {
    host: true,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Vtip',
      fileName: 'vtip',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        'vue',
        'reka-ui',
        /^@tiptap\/.*/, // Externalize all tiptap packages if intended to be peer or user-installed.
        // However, if we want them bundled (user prompt was ambiguous but "exclude node_modules" usually means externalize),
        // we should list them. Given "vtip" wraps them, users might expect them included OR peer.
        // Let's stick to the prompt "Exclude node_modules dependencies".
      ],
      output: {
        globals: {
          vue: 'Vue',
          'reka-ui': 'RekaUI'
        },
        exports: 'named',
      },
    },
  },
})
