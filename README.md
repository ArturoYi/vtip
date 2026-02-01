# vtip

A lightweight, Vue 3 specific rich text editor based on Tiptap.

## Features

- 📦 **Lightweight**: Core Tiptap + StarterKit only.
- 🔌 **Vue 3 Ready**: Built with Composition API, supports `v-model`.
- 🛠 **Customizable**: Extend with Tiptap extensions, custom styles.
- 📝 **TypeScript**: Full type support.

## Installation

```bash
npm install vtip
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TiptapEditor } from 'vtip'
import 'vtip/dist/style.css'

const content = ref('<p>Hello World!</p>')
</script>

<template>
  <TiptapEditor
    v-model="content"
    placeholder="Write something..."
    :readonly="false"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string` | `''` | Content (HTML) |
| `readonly` | `boolean` | `false` | Read-only mode |
| `placeholder` | `string` | `'请输入内容...'` | Placeholder text |
| `extensions` | `Extension[]` | `[]` | Additional Tiptap extensions |
| `editorClass` | `string` | `''` | Custom class for editor content |

## Events

- `update:modelValue`: Emitted when content changes.
- `focus`: Emitted when editor is focused.
- `blur`: Emitted when editor loses focus.

## License

MIT
