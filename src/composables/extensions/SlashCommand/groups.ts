import { Editor } from '@tiptap/vue-3'
import { VtipToolBarCommands } from '../../commands/types'

export interface CommandGroup {
  title: string
  items: VtipToolBarCommands[]
}

export const renderItems = (): CommandGroup[] => {
  return [
    {
      title: 'Basic',
      items: [
        {
          name: 'Text',
          description: 'Just start typing with plain text.',
          onClick: (editor: Editor) => {
            editor
              .chain()
              .focus()
              .toggleNode('paragraph', 'paragraph')
              .run()
          },
        },
        {
          name: 'Heading 1',
          description: 'Big section heading.',
          onClick: (editor: Editor) => {
            editor
              .chain()
              .focus()
              .setNode('heading', { level: 1 })
              .run()
          },
        },
        {
          name: 'Heading 2',
          description: 'Medium section heading.',
          onClick: (editor: Editor) => {
            editor
              .chain()
              .focus()
              .setNode('heading', { level: 2 })
              .run()
          },
        },
        {
          name: 'Heading 3',
          description: 'Small section heading.',
          onClick: (editor: Editor) => {
            editor
              .chain()
              .focus()
              .setNode('heading', { level: 3 })
              .run()
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
}
