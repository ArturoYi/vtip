import { Editor } from '@tiptap/vue-3'
import { VtipToolBarCommands } from '../../commands/types'
import { Heading1, Heading2, Heading3, Heading4 } from 'lucide-vue-next'

export const browser = typeof window !== 'undefined'

/**
 * Check if the current browser is in mac or not
 */
export const isMac = browser
  ? navigator.userAgent.includes('Macintosh') || navigator.userAgent.includes('Mac OS X')
  : false


export interface CommandGroup {
  title: string
  items: VtipToolBarCommands[]
}

export const defaultCommandGroups: CommandGroup[] = [
  {
    title: 'Basic',
    items: [
      {
        icon: Heading1,
        name: 'h1',
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
        name: 'h2',
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
        name: 'h3',
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
        name: 'h4',
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
      {
        name: 'Bullet List',
        description: 'Create a simple bulleted list.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .toggleBulletList()
            .run()
        },
      },
      {
        name: 'Ordered List',
        description: 'Create a list with numbering.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .toggleOrderedList()
            .run()
        },
      },
      {
        name: 'Task List',
        description: 'Track tasks with a todo list.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .toggleTaskList()
            .run()
        },
      },
      {
        name: 'Code Block',
        description: 'Capture a code snippet.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .toggleCodeBlock()
            .run()
        },
      },
      {
        name: 'Blockquote',
        description: 'Capture a quote.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .toggleBlockquote()
            .run()
        },
      },
      {
        name: 'Horizontal Rule',
        description: 'Insert a horizontal divider.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .setHorizontalRule()
            .run()
        },
      },
    ],
  },
  {
    title: 'Advanced',
    items: [
      {
        name: 'Table',
        description: 'Insert a table.',
        onClick: (editor: Editor) => {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        },
      }
    ],
  },
]
