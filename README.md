# vtip

A lightweight, Vue 3 specific rich text editor based on Tiptap, Reka UI, and Windi CSS.

## Features

- 📦 **Lightweight**: Core Tiptap + StarterKit only. Dependencies externalized.
- 🔌 **Vue 3 Ready**: Built with Composition API, supports `v-model`.
- 🎨 **Reka UI & Windi CSS**: Integrated for accessible and styled components.
- 🛠 **Customizable**: Extend with Tiptap extensions, custom styles.
- 📝 **TypeScript**: Full type support.

## Installation

You need to install `vtip` along with its peer dependencies:

```bash
npm install vtip vue reka-ui
# OR
pnpm add vtip vue reka-ui
```

Note: You do **not** need to install Windi CSS in your project. Styles are pre-compiled.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VtipEditor } from 'vtip'
import 'vtip/style.css' // Import the styles

const content = ref('<p>Hello World!</p>')
</script>

<template>
  <VtipEditor
    v-model="content"
    placeholder="Write something..."
    custom-class="my-editor"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Content (HTML) |
| `editable` | `boolean` | `true` | Editable mode |
| `placeholder` | `string` | `'Write something...'` | Placeholder text |
| `extensions` | `Extension[]` | `[StarterKit, Placeholder]` | Custom Tiptap extensions |
| `customClass` | `string` | `''` | Custom class for the editor wrapper |

## Styling

The editor is wrapped in `.reka-tiptap-editor`. You can override styles using this class or pass a `customClass`.

The styles are isolated to avoid pollution, but you can customize using CSS variables or overriding classes.

## License

MIT
