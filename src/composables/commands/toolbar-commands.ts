import { Editor } from "@tiptap/vue-3";
import { Heading1, Heading2, Heading3, Heading4, Link, Pilcrow, Bold, Italic, Underline, Strikethrough as StrikeThrough, Quote, Code, Superscript, Subscript, List, ListOrdered, CheckSquare, Minus, Table, Image, Music, Video, Globe } from "lucide-vue-next";
import { isMac } from "../utils";
import { VtipToolBarCommands } from "./types";

export const toolbarCommands: Record<string, VtipToolBarCommands[]> = {
    headings: [
        {
            icon: Heading1,
            name: 'Heading 1',
            tooltip: 'Heading 1',
            shortCut: `${isMac ? '⌘⌥' : 'Ctrl+Alt+'}1`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleHeading({ level: 1 }).run()
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setHeading({ level: 1 }).run()
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleHeading({ level: 1 })
            },
            isActive: (editor: Editor) => {
                return editor.isActive('heading', { level: 1 })
            },
        },
        {
            icon: Heading2,
            name: 'Heading 2',
            tooltip: 'Heading 2',
            shortCut: `${isMac ? '⌘⌥' : 'Ctrl+Alt+'}2`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleHeading({ level: 2 }).run()
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setHeading({ level: 2 }).run()
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleHeading({ level: 2 })
            },
            isActive: (editor: Editor) => {
                return editor.isActive('heading', { level: 2 })
            },
        },
        {
            icon: Heading3,
            name: 'Heading 3',
            tooltip: 'Heading 3',
            shortCut: `${isMac ? '⌘⌥' : 'Ctrl+Alt+'}3`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleHeading({ level: 3 }).run()
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setHeading({ level: 3 }).run()
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleHeading({ level: 3 })
            },
            isActive: (editor: Editor) => {
                return editor.isActive('heading', { level: 3 })
            },
        },
        {
            icon: Heading4,
            name: 'Heading 4',
            tooltip: 'Heading 4',
            shortCut: `${isMac ? '⌘⌥' : 'Ctrl+Alt+'}4`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleHeading({ level: 4 }).run()
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setHeading({ level: 4 }).run()
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleHeading({ level: 4 })
            },
            isActive: (editor: Editor) => {
                return editor.isActive('heading', { level: 4 })
            },
        },
    ],
    format: [
        {
            icon: Link,
            name: 'link',
            tooltip: 'Link',
            onClick: (editor: Editor) => {
                if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run();
                } else {
                    const url = window.prompt('Enter the URL of the link:');
                    if (url) {
                        editor.chain().focus().toggleLink({ href: url }).run();
                    }
                }
            },
            isActive: (editor: Editor) => {
                return editor.isActive('link');
            }
        },
        {
            icon: Pilcrow,
            name: 'paragraph',
            tooltip: 'Paragraph',
            shortCut: `${isMac ? '⌘⇧' : 'Ctrl+Shift+'}0`,
            onClick: (editor: Editor) => {
                editor.chain().focus().setParagraph().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setParagraph().run();
            },
            clickable: (editor: Editor) => {
                return editor.can().setParagraph();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('paragraph');
            }
        },
        {
            icon: Bold,
            name: 'bold',
            tooltip: 'Bold',
            shortCut: `${isMac ? '⌘' : 'Ctrl+'}B`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleBold().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setMark('bold').run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleBold();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('bold');
            }
        },
        {
            icon: Italic,
            name: 'italic',
            tooltip: 'Italic',
            shortCut: `${isMac ? '⌘' : 'Ctrl+'}I`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleItalic().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setMark('italic').run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleItalic();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('italic');
            }
        },
        {
            icon: Underline,
            name: 'underline',
            tooltip: 'Underline',
            shortCut: `${isMac ? '⌘' : 'Ctrl+'}U`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleUnderline().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setMark('underline').run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleUnderline();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('underline');
            }
        },
        {
            icon: StrikeThrough,
            name: 'strikethrough',
            tooltip: 'Strikethrough',
            shortCut: `${isMac ? '⌘⇧' : 'Ctrl+Shift+'}S`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleStrike().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).setMark('strike').run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleStrike();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('strike');
            }
        },
        {
            icon: Quote,
            name: 'blockQuote',
            tooltip: 'BlockQuote',
            shortCut: `${isMac ? '⌘⇧' : 'Ctrl+Shift+'}B`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleBlockquote().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).toggleBlockquote().run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleBlockquote();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('blockquote');
            }
        },
        {
            icon: Code,
            name: 'code',
            tooltip: 'Inline Code',
            shortCut: `${isMac ? '⌘' : 'Ctrl+'}E`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleCode().run();
            },
            turnInto: (editor: Editor, node: any, pos: number) => {
                editor.chain().setNodeSelection(pos).toggleCodeBlock().run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleCode();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('code');
            }
        },
        {
            icon: Superscript,
            name: 'superscript',
            tooltip: 'Superscript',
            shortCut: `${isMac ? '⌘' : 'Ctrl+'}.`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleSuperscript().run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleSuperscript();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('superscript');
            }
        },
        {
            icon: Subscript,
            name: 'subscript',
            tooltip: 'Subscript',
            shortCut: `${isMac ? '⌘' : 'Ctrl+'},`,
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleSubscript().run();
            },
            clickable: (editor: Editor) => {
                return editor.can().toggleSubscript();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('subscript');
            }
        }
    ],
    list: [
        {
            icon: List,
            name: 'Bullet List',
            description: 'Create a simple bulleted list.',
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleBulletList().run();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('bulletList');
            }
        },
        {
            icon: ListOrdered,
            name: 'Ordered List',
            description: 'Create a list with numbering.',
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleOrderedList().run();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('orderedList');
            }
        },
        {
            icon: CheckSquare,
            name: 'Task List',
            description: 'Track tasks with a todo list.',
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleTaskList().run();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('taskList');
            }
        },
        {
            icon: Code,
            name: 'Code Block',
            description: 'Capture a code snippet.',
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleCodeBlock().run();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('codeBlock');
            }
        },
        {
            icon: Quote,
            name: 'Blockquote',
            description: 'Capture a quote.',
            onClick: (editor: Editor) => {
                editor.chain().focus().toggleBlockquote().run();
            },
            isActive: (editor: Editor) => {
                return editor.isActive('blockquote');
            }
        },
        {
            icon: Minus,
            name: 'Horizontal Rule',
            tooltip: 'Horizontal Rule',
            description: 'Insert a horizontal divider.',
            onClick: (editor: Editor) => {
                editor.chain().focus().setHorizontalRule().run();
            },
            clickable: (editor: Editor) => editor.can().setHorizontalRule(),
            isActive: (editor: Editor) => editor.isActive('horizontalRule'),
        }
    ],
    table: [
        {
            icon: Table,
            name: 'table',
            description: 'Table.',
            onClick: (editor: Editor) => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            },
        }
    ],
    media: [
        {
            icon: Image,
            name: 'image-placeholder',
            tooltip: 'Image Placeholder',
            onClick: (editor) => {
                editor.chain().focus().insertImagePlaceholder().run();
            },
            isActive: (editor) => editor.isActive('image-placeholder')
        },
        {
            icon: Music,
            name: 'audio-placeholder',
            tooltip: 'Audio Placeholder',
            onClick: (editor) => {
                editor.chain().focus().insertAudioPlaceholder().run();
            },
            isActive: (editor) => editor.isActive('audio-placeholder')
        },
        {
            icon: Video,
            name: 'video-placeholder',
            tooltip: 'Video Placeholder',
            onClick: (editor) => {
                editor.chain().focus().insertVideoPlaceholder().run();
            },
            isActive: (editor) => editor.isActive('video-placeholder')
        },
        {
            icon: Globe,
            name: 'iframe-placeholder',
            tooltip: 'Embed',
            description: 'Embed an external page via URL.',
            onClick: (editor) => {
                editor.chain().focus().insertIFramePlaceholder().run();
            },
            isActive: (editor) => editor.isActive('iframe-placeholder')
        },
    ],
}

// —— 工具栏：字号与快捷色（TextStyle + FontSize + Color，Highlight multicolor）——

export interface ToolbarFontSizePreset {
    /** 空字符串表示恢复默认（unsetFontSize） */
    value: string
    /** 存在时用 i18n；否则界面直接显示 value（如 1rem） */
    labelKey?: string
}

export const TOOLBAR_FONT_SIZE_PRESETS: ToolbarFontSizePreset[] = [
    { value: '', labelKey: 'fontSizeDefault' },
    { value: '0.75rem' },
    { value: '0.875rem' },
    { value: '1rem' },
    { value: '1.125rem' },
    { value: '1.25rem' },
    { value: '1.5rem' },
    { value: '2rem' },
]

/**
 * 工具栏色板：2×5，与「文字色 / 高亮色」共用同一组 hex（高亮区用实心底 + 白 A）。
 * 顺序：上行左→右，下行左→右。
 */
export const TOOLBAR_SWATCH_PALETTE: readonly string[] = [
    '#ffffff',
    '#1e40af',
    '#b91c1c',
    '#15803d',
    '#6b7280',
    '#c2410c',
    '#db2777',
    '#6b21a8',
    '#7f1d1d',
    '#65a30d',
]

export interface ToolbarTypographyState {
    fontSize: string
    color: string
    highlightColor: string
}

/** 读选区/光标处的 textStyle、highlight，供下拉展示 */
export function getToolbarTypographyState(editor: Editor): ToolbarTypographyState {
    const ts = editor.getAttributes('textStyle') as { fontSize?: string | null; color?: string | null }
    const hl = editor.getAttributes('highlight') as { color?: string | null }
    return {
        fontSize: ts.fontSize ?? '',
        color: ts.color ?? '',
        highlightColor: hl.color ?? '',
    }
}

/** 统一 hex 大小写与 #rgb → #rrggbb，便于与预设选项比对 */
export function normalizeToolbarHexColor(input: string): string {
    const s = input.trim().toLowerCase()
    if (!s || !s.startsWith('#')) return s
    if (s.length === 4) {
        return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
    }
    return s
}

export function toolbarHexEquals(a: string, b: string): boolean {
    if (!a && !b) return true
    return normalizeToolbarHexColor(a) === normalizeToolbarHexColor(b)
}

export function isToolbarFontSizePreset(value: string): boolean {
    return TOOLBAR_FONT_SIZE_PRESETS.some((p) => p.value === value)
}

export function isToolbarSwatchPaletteColor(value: string): boolean {
    if (!value) return true
    return TOOLBAR_SWATCH_PALETTE.some((c) => toolbarHexEquals(c, value))
}

export function isToolbarQuickTextColor(value: string): boolean {
    return isToolbarSwatchPaletteColor(value)
}

export function isToolbarQuickHighlightColor(value: string): boolean {
    return isToolbarSwatchPaletteColor(value)
}

export function applyToolbarFontSize(editor: Editor, value: string): void {
    const chain = editor.chain().focus()
    if (!value) {
        chain.unsetFontSize().run()
        return
    }
    chain.setFontSize(value).run()
}

export function applyToolbarTextColor(editor: Editor, value: string): void {
    const chain = editor.chain().focus()
    if (!value) {
        chain.unsetColor().run()
        return
    }
    chain.setColor(value).run()
}

export function applyToolbarHighlightColor(editor: Editor, value: string): void {
    const chain = editor.chain().focus()
    if (!value) {
        chain.unsetHighlight().run()
        return
    }
    chain.setHighlight({ color: value }).run()
}