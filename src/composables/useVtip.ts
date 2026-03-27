import { ref } from 'vue'
import { Editor, useEditor, VueNodeViewRenderer, type EditorOptions } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Highlight } from '@tiptap/extension-highlight'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Typography } from '@tiptap/extension-typography'
import { TextAlign } from '@tiptap/extension-text-align'
import { Markdown } from '@tiptap/markdown'
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from './extensions/table'
import { Mathematics } from '@tiptap/extension-mathematics'
import { common, createLowlight } from 'lowlight'
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style';
import TableOfContents, { getHierarchicalIndexes } from '@tiptap/extension-table-of-contents';
import { CharacterCount } from '@tiptap/extensions'
import { InlineMathReplacer } from './extensions/InlineMathReplacer'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import CodeBlock from './components/CodeBlock.vue'
import { ColorHighlighter } from './extensions/ColorHighlighter'
import { AutoJoiner } from './extensions/AutoJoiner'
import { SlashCommand } from './extensions/SlashCommand'
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { ImageExtended } from './extensions/image/ImageExtended'
import ImageExtendedComponent from './components/ImageExtended.vue'
import ImagePlaceholderComponent from './components/ImagePlaceholder.vue'
import { ImagePlaceholder } from './extensions/image/ImagePlaceholder'
import { AudioExtended } from './extensions/audio/AudioExtended'
import AudioExtendedComponent from './components/AudioExtended.vue'
import AudioPlaceholderComponent from './components/AudioPlaceholder.vue'
import { AudioPlaceholder } from './extensions/audio/AudioPlaceholder'
import { VideoExtended } from './extensions/video/VideoExtended'
import VideoExtendedComponent from './components/VideoExtended.vue'
import VideoPlaceholderComponent from './components/VideoPlaceholder.vue'
import { VideoPlaceholder } from './extensions/video/VideoPlaceholder'
import { IFrameExtended } from './extensions/iframe/IFrameExtended'
import IFrameExtendedComponent from './components/IFrameExtended.vue'
import IFramePlaceholderComponent from './components/IFramePlaceholder.vue'
import { IFramePlaceholder } from './extensions/iframe/IFramePlaceholder'
import { FileDrop } from './extensions/HandleFileDrop'
import { locale as vtipLocale } from './i18n'
function resolveUploadKind(accept: string): 'image' | 'audio' | 'video' {
  if (accept.startsWith('image')) return 'image'
  if (accept.startsWith('audio')) return 'audio'
  return 'video'
}

/**
 * 打开文件选择并在取消时 resolve（仅 change 时浏览器在取消下可能不会触发，导致 Promise 挂起）
 */
function openFilePickerAndUpload(
  fileType: string,
  uploadFile: NonNullable<UseVtipOptions['uploadFile']>
): Promise<string | null> {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = fileType
  return new Promise((resolve) => {
    let settled = false
    const cleanup = () => {
      window.removeEventListener('focus', onWindowFocus)
      input.removeEventListener('change', onChange)
      input.removeEventListener('cancel', onCancel)
    }
    const finish = (value: string | null) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(value)
    }
    const onWindowFocus = () => {
      window.setTimeout(() => {
        if (!settled && !input.files?.length) {
          finish(null)
        }
      }, 300)
    }
    const onCancel = () => finish(null)
    const onChange = () => {
      void (async () => {
        if (!input.files?.length) {
          finish(null)
          return
        }
        const file = input.files[0]
        try {
          const url = await uploadFile(file, resolveUploadKind(fileType))
          finish(url)
        } catch (error) {
          console.error(error)
          finish(null)
        }
      })()
    }
    input.addEventListener('change', onChange)
    input.addEventListener('cancel', onCancel)
    window.addEventListener('focus', onWindowFocus)
    input.click()
  })
}

export type UseVtipOptions = Partial<EditorOptions> & {
  /** 目录滚动容器，传入编辑器根元素 ref 的 getter，如 () => editorRef.value */
  scrollParent?: () => HTMLElement | Window
  /** 语言设置，默认为 'zh' */
  locale?: 'zh' | 'en'
  /** 是否可编辑，默认为 true */
  editable?: boolean
  /** 文件上传钩子，返回上传后的 URL */
  uploadFile?: (file: File, fileType: 'image' | 'audio' | 'video') => Promise<string>
}

export const useVtip = (options: UseVtipOptions = {}) => {
  const {
    extensions = [],
    scrollParent: scrollParentFn,
    locale: customLocale = 'zh',
    editable = true,
    uploadFile,
    ...otherOptions
  } = options

  // 设置全局语言
  vtipLocale.value = customLocale

  // 创建 lowlight 实例
  const lowlight = createLowlight(common)

  // 数学公式点击状态，供 Math / MathInline 等菜单使用
  const blockMathPos = ref(0)
  const blockMathLatex = ref('')
  const inlineMathPos = ref(0)
  const inlineMathLatex = ref('')

  const editor = useEditor(
    {
      ...otherOptions,
      editable,
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
          // 使用占位符，根据节点类型使用不同占位文案
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
        InlineMathReplacer, // 行内数学公式替换器
        Markdown, // Markdown 语法

        //-------------------UI扩展----------------------
        CodeBlockLowlight.configure({
          lowlight
        }).extend({
          addNodeView() {
            return VueNodeViewRenderer(CodeBlock);
          }
        }),
        ImageExtended(ImageExtendedComponent),
        ImagePlaceholder(ImagePlaceholderComponent),
        AudioExtended(AudioExtendedComponent),
        AudioPlaceholder(AudioPlaceholderComponent),
        VideoExtended(VideoExtendedComponent),
        VideoPlaceholder(VideoPlaceholderComponent),
        IFrameExtended(IFrameExtendedComponent),
        IFramePlaceholder(IFramePlaceholderComponent),
        FileDrop.configure({
          supportsLocalUpload: !!uploadFile,
          localFileGetter: async (fileType) => {
            if (!uploadFile) {
              return null
            }
            return openFilePickerAndUpload(fileType as string, uploadFile)
          }
        }), // 文件上传
        SlashCommand,// 斜杠命令
        Mathematics.configure({
          // 块级数学公式节点配置（与 editor.svelte 一致）
          blockOptions: {
            onClick: (node, pos) => {
              blockMathPos.value = pos
              blockMathLatex.value = node.attrs.latex
            }
          },
          inlineOptions: {
            onClick: (node, pos) => {
              inlineMathPos.value = pos
              inlineMathLatex.value = node.attrs.latex
            }
          },
          // KaTeX 渲染器选项，参见：https://katex.org/docs/options.html
          katexOptions: {
            throwOnError: true, // LaTeX 无效时不抛出错误
            macros: {
              '\\R': '\\mathbb{R}', // 实数宏
              '\\N': '\\mathbb{N}' // 自然数宏
            }
          }
        }),
        TableOfContents.configure({
          getIndex: getHierarchicalIndexes,
          scrollParent: scrollParentFn ?? (() => window)
        }),
        //-------------------自定义扩展----------------------
        ...extensions,
      ],
    }
  )

  return {
    editor,
    blockMathPos,
    blockMathLatex,
    inlineMathPos,
    inlineMathLatex
  }
}
