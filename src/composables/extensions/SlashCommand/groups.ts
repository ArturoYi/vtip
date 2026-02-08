import { Editor } from '@tiptap/vue-3'
import { VtipToolBarCommands } from '../../commands/types'
import { toolbarCommands } from '../../commands/toolbar-commands'

export interface CommandGroup {
  title: string
  items: VtipToolBarCommands[]
}

export const defaultCommandGroups: CommandGroup[] = [
  {
    title: 'Basic',
    items: [
      ...toolbarCommands.headings,
      ...toolbarCommands.list,
    ],
  },
  {
    title: 'Insert',
    items: [
      ...toolbarCommands.table,
    ],
  },
  {
    title: 'Media',
    items: [
      ...toolbarCommands.media,
    ],
  },
]
