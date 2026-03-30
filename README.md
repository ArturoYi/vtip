# VtipEdit

基于 **Vue 3**、**Tiptap 3**、**Reka UI** 与 **UnoCSS** 的富文本编辑器。原子化样式已预编译进发布的 CSS，**使用方无需**在业务项目里再配置 UnoCSS。

npm 包名：`@arturoyi/vtip-edit`。

目前只为个人使用，如果你感兴趣请二开，我还在不断更改中。

## 特性

- **编辑与预览**：`VtipEditor`（工具栏、气泡菜单等）与 `VtipRenderer`（只读）共用同一套文档模型。
- **内置扩展**（部分列举）：StarterKit（已按需裁剪配置）、标题、列表、任务列表、链接、排版优化、上标/下标、对齐、多色高亮、文字颜色与字号、Markdown 输入、带行列操作的表格、基于 **lowlight** 的代码高亮、目录、字数统计、**KaTeX** 数学公式、`/` 斜杠命令面板，以及图片 / 音频 / 视频 / iframe 嵌入，并支持可选的**文件上传**钩子。
- **国际化**：工具栏与界面文案支持 `locale="zh" | "en"`，默认 `zh`.
- **TypeScript**：随包导出类型；进阶场景下 `useVtip` 可传入标准 Tiptap `EditorOptions`。
- **主题**：以暗色为默认方向的 CSS 变量，定义在 `:root` / `.light` 中（见 [样式](#样式)）。

## 环境要求

| | |
| --- | --- |
| **Peer 依赖** | `vue` ^3、`reka-ui` ^2.8 |
| **与 Tiptap 的关系** | 安装 `@arturoyi/vtip-edit` 时会携带其对 Tiptap 的 **dependencies**，但库构建时 **不会** 把 `@tiptap/*` 打进包内，需由你的打包器从 `node_modules` 解析（通常与本包一并提升安装）。请与当前 `vtip-edit` 版本所使用的 Tiptap 大版本保持兼容。 |

## 安装

```bash
npm install @arturoyi/vtip-edit vue reka-ui
# 或
pnpm add @arturoyi/vtip-edit vue reka-ui
```

在应用中一次性引入样式：

```ts
import '@arturoyi/vtip-edit/style.css'
```

## 使用说明

### 编辑器（`VtipEditor`）

`v-model` 既可传 **HTML 字符串**，也可传 **ProseMirror JSON 对象**。`update:modelValue` 的输出类型与初始类型一致：**字符串进则出 HTML，对象进则出 JSON**.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VtipEditor } from '@arturoyi/vtip-edit'
import '@arturoyi/vtip-edit/style.css'

const content = ref('<p>Hello World!</p>')

async function uploadFile(file: File, fileType: 'image' | 'audio' | 'video') {
  // 返回上传完成后的资源 URL
  return 'https://example.com/media/' + file.name
}
</script>

<template>
  <VtipEditor
    v-model="content"
    locale="zh"
    :upload-file="uploadFile"
    @focus="() => {}"
    @blur="() => {}"
  />
</template>
```

### 只读预览（`VtipRenderer`）

内容与编辑器相同形状；无工具栏，不可编辑。

```vue
<script setup lang="ts">
import { VtipRenderer } from '@arturoyi/vtip-edit'
import '@arturoyi/vtip-edit/style.css'

const content = '<p>仅预览。</p>'
</script>

<template>
  <VtipRenderer :model-value="content" locale="zh" />
</template>
```

### 进阶：`useVtip`

内部使用的无 UI 钩子。可传入额外的 Tiptap **`extensions`**（会接在内置扩展之后），以及任意 **`EditorOptions`** 字段（例如 `editorProps`、`autocorrect` 等）。

```ts
import { useVtip } from '@arturoyi/vtip-edit'
import { EditorContent } from '@tiptap/vue-3'
// ……再与自定义布局、工具栏等组合
```

## 组件 API

### `VtipEditor`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` \| Tiptap JSON | `undefined` | 文档：HTML 字符串或 ProseMirror JSON |
| `locale` | `'zh'` \| `'en'` | `'zh'` | 界面语言 |
| `uploadFile` | `(file, fileType) => Promise<string>` | `undefined` | 若提供，图片/音频/视频相关流程可上传并插入返回的 URL；未提供时占位等流程可能使用兜底 URL |

**事件：** `update:modelValue`、`focus`、`blur`。

外层布局类名：`.vtip-editor-container`、`.vtip-editor-content`；ProseMirror 根节点为 `.tiptap`.

### `VtipRenderer`

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` \| Tiptap JSON | `undefined` | 与编辑器相同 |
| `locale` | `'zh'` \| `'en'` | `'zh'` | 只读模式下仍会显示的文案所用语言 |

### 公开导出

`VtipEditor`、`VtipRenderer`、`useVtip`、`EditorContent`、`EditorToolbar`、`TableColMenu`、`TableRowMenu`。

## 样式

- 编辑器全局样式在 **`@arturoyi/vtip-edit/style.css`**（含主题 token 与 ProseMirror / Tiptap 规则）。
- 可通过覆盖 **CSS 变量** 快速换肤，例如：`--vtip-editor-bg`、`--vtip-editor-text`、`--vtip-table-border`、`--vtip-code-bg`、`--vtip-slash-menu-bg`。完整列表见本仓库 `src/style/theme/theme.css`.
- UnoCSS 工具类已编译进发布 CSS；业务项目**不必**为使用 `vtip-edit` 而单独配置 UnoCSS。
- 数学公式依赖 **KaTeX**；若公式无样式，可在应用中引入 KaTeX 的 CSS（例如 `katex/dist/katex.min.css`），版本尽量与依赖中的 KaTeX 一致。

## 本地开发

```bash
pnpm install
pnpm dev      # Vite 演示应用
pnpm build    # 类型检查 + 构建库产物至 dist/
```

## 许可证

MIT
