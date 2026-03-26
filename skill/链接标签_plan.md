# 支持 Markdown 链接语法 `[text](url)` 行内输入

## 背景

当前编辑器的链接插入方式存在两个问题：
1. **工具栏按钮**使用 `window.prompt()` 弹窗输入 URL，体验不佳
2. **不支持行内 Markdown 链接语法** — 用户无法直接在编辑器中输入 `[链接文本](https://example.com)` 来创建链接

### 为什么当前不支持？

Tiptap 的 StarterKit Link 扩展默认只提供了：
- `autolink`: 自动识别纯 URL 文本（如 `https://example.com`）并转为链接
- `linkOnPaste`: 粘贴 URL 时自动设为选中文本的链接

但它**不包含** Markdown 风格的 `[text](url)` Input Rule。虽然项目引入了 `@tiptap/markdown`，但该扩展用于**整体内容的序列化/反序列化**（将编辑器内容导出为 Markdown 或从 Markdown 导入），而不是提供实时的 Markdown 快捷输入。

## 方案

创建一个自定义 Tiptap 扩展 `MarkdownLinkInputRule`，通过 ProseMirror 的 **InputRule** 机制，在用户输入 `[text](url)` 并按下最后的 `)` 时，自动将该文本替换为一个带有 `href` 属性的链接节点。

这种方式与项目中已有的 `InlineMathReplacer`（`$$latex$$` → 行内数学公式）模式一致，保持代码风格统一。

> [!IMPORTANT]
> 这个 InputRule 支持在**行内任意位置**插入链接，不需要整行都是链接语法。例如：`这是一段文字 [点击这里](https://example.com) 继续输入` 也能正确工作。

## Proposed Changes

### Extension

#### [NEW] [MarkdownLinkInputRule.ts](file:///Users/chenyiren/project/js/vtip/src/composables/extensions/MarkdownLinkInputRule.ts)

创建一个新的 Tiptap Extension，使用 [addInputRules()](file:///Users/chenyiren/project/js/vtip/src/composables/extensions/InlineMathReplacer.ts#6-15) 添加一个匹配 `[text](url)` 模式的 InputRule：

- **正则表达式**：`/(?:^|\s)\[([^\]]+)\]\(([^)]+)\)$/`
  - [(?:^|\s)](file:///Users/chenyiren/project/js/vtip/src/composables/commands/toolbar-commands.ts#31-34) — 行首或空白开头，避免与其他语法冲突
  - `\[([^\]]+)\]` — 捕获方括号内的链接文本
  - `\(([^)]+)\)$` — 捕获圆括号内的 URL
- **处理逻辑**：使用 `markInputRule` 的方式，但因为链接需要同时替换文本内容和设置 mark 属性，需要通过 [addInputRules](file:///Users/chenyiren/project/js/vtip/src/composables/extensions/InlineMathReplacer.ts#6-15) + 手动创建 [InputRule](file:///Users/chenyiren/project/js/vtip/src/composables/extensions/InlineMathReplacer.ts#6-15) 来实现：
  1. 删除匹配到的原始 Markdown 文本
  2. 插入链接文本
  3. 为插入的文本添加 `link` mark，设置 `href` 属性

---

### Editor Setup

#### [MODIFY] [useVtip.ts](file:///Users/chenyiren/project/js/vtip/src/composables/useVtip.ts)

在 extensions 列表中引入新的 `MarkdownLinkInputRule` 扩展，放在 `Markdown` 扩展附近。

## Verification Plan

### Manual Verification

由于项目无测试框架，采用浏览器手动验证：

1. 确保 dev server 运行 (`pnpm run dev`)
2. 打开编辑器页面
3. **测试基本功能**：输入 `[Markdown语法](https://markdown.com.cn)` 然后按下最后的 `)`，观察是否自动转为超链接"Markdown语法"
4. **测试行内插入**：先输入一些文字，然后在行内输入 `[点击](https://example.com)`，确认链接在行内正确创建
5. **测试无效 URL**：输入 `[test]()` 确认空 URL 不会创建链接
6. **测试取消链接**：点击已有链接，使用工具栏 Link 按钮取消链接，确认依然正常工作
