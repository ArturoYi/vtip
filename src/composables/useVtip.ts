import { Editor, useEditor, VueNodeViewRenderer, type EditorOptions } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Typography } from '@tiptap/extension-typography'
import { TextAlign } from '@tiptap/extension-text-align'
import { Markdown } from '@tiptap/markdown'
import { Table } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { Mathematics } from '@tiptap/extension-mathematics'
import { all, createLowlight } from 'lowlight'
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { CharacterCount } from '@tiptap/extensions'
import { InlineMathReplacer } from './extensions/InlineMathReplacer'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import CodeBlock from './components/CodeBlock.vue'
import { ColorHighlighter } from './extensions/ColorHighlighter'
import { AutoJoiner } from './extensions/AutoJoiner'
import { SlashCommand } from './extensions/SlashCommand'
import { TaskItem, TaskList } from '@tiptap/extension-list';


export const useVtip = (options: Partial<EditorOptions> = {}) => {
  const { extensions = [], ...otherOptions } = options
  // create a lowlight instance
  const lowlight = createLowlight(all)

  const editor = useEditor(
    {
      ...otherOptions,
      extensions: [
        // 基础功能套件
        StarterKit.configure({
          orderedList: {
            HTMLAttributes: {
              class: 'list-decimal'
            }
          },
          bulletList: {
            HTMLAttributes: {
              class: 'list-disc'
            }
          },
          heading: {
            levels: [1, 2, 3, 4]
          },
          link: {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
            HTMLAttributes: {
              target: '_tab',
              rel: 'noopener noreferrer nofollow'
            }
          },
          codeBlock: false
        }),
        CharacterCount, // 字数统计
        Highlight.configure({
          multicolor: true
        }),
        Placeholder.configure({
          emptyEditorClass: 'is-empty',
          // Use a placeholder:
          // Use different placeholders depending on the node type:
          placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
              return 'What’s the title?';
            }
            if (node.type.name === 'paragraph') {
              return 'Write, press space for AI or / for commands';
            }
            return '';
          }
        }),
        Color, // 颜色 
        FontSize, // 字体大小
        TextStyle, // 文本样式
        Subscript, // 下标
        Superscript, // 上标
        Typography, // 排版
        ColorHighlighter,// 颜色高亮
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }), // 文本对齐
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        AutoJoiner,
        Table, // 表格
        TableHeader, // 表格头
        TableRow, // 表格行
        TableCell, // 表格单元格
        Mathematics, // 行内数学公式 (Using installed @tiptap/extension-mathematics)
        InlineMathReplacer, // 行内数学公式替换器
        Markdown, // markdown 语法

        //-------------------UI扩展----------------------
        CodeBlockLowlight.configure({
          lowlight
        }).extend({
          addNodeView() {
            return VueNodeViewRenderer(CodeBlock);
          }
        }),
        
        SlashCommand,// 斜杠命令
        //-------------------自定义扩展----------------------
        ...extensions,
      ],
    }
  )

  return editor
}

