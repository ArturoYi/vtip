import { Editor, Extension } from '@tiptap/vue-3'
import Suggestion from '@tiptap/suggestion'
import { EditorState, PluginKey } from '@tiptap/pm/state'
import { VueRenderer } from '@tiptap/vue-3'
import { computePosition, autoUpdate, flip, shift, offset } from '@floating-ui/dom'
import SlashCommandList from './SlashCommandList.vue'
import { renderItems, CommandGroup } from './groups'
import { SuggestionRange } from './suggestion'

const SlashCommandPluginKey = new PluginKey('slashCommand')

interface PopupState {
  element: HTMLElement | null;
  cleanup: (() => void) | null;
  isVisible: boolean;
}

const popup: PopupState = {
  element: null,
  cleanup: null,
  isVisible: false
};


export const SlashCommand = Extension.create({
  name: SlashCommandPluginKey.get.name,
  priority: 200,
  onCreate() {
    // Create popup container
    popup.element = document.createElement('div');
    popup.element.style.position = 'fixed';
    popup.element.style.zIndex = '9999';
    popup.element.style.maxWidth = '16rem';
    popup.element.style.visibility = 'hidden';
    popup.element.style.pointerEvents = 'none';
    popup.element.className = 'slash-command-popup';
    document.body.appendChild(popup.element);
  },
  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: true,
        allow: ({ editor, state, range }: { editor: Editor, state: EditorState, range: SuggestionRange }) => {
          const $from = state.doc.resolve(range.from);
          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent?.indexOf('/')
          );
          const isValidAfterContent = !afterContent?.endsWith('  ');

          return isValidAfterContent;
        },
        command: ({ editor, range, props }: any) => {
          // props is the item data (VtipToolBarCommands)
          // We need to delete the range (the slash command text) first
          editor.chain().focus().deleteRange(range).run();
          
          // Then execute the item's onClick handler
          if (props.onClick) {
            props.onClick(editor);
          }
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: SlashCommandPluginKey,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const groups = renderItems()
          if (!query) return groups

          const filteredGroups: CommandGroup[] = []

          groups.forEach(group => {
            const filteredItems = group.items.filter(item =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
            )
            if (filteredItems.length) {
              filteredGroups.push({
                ...group,
                items: filteredItems
              })
            }
          })

          return filteredGroups
        },
        render: () => {
          let component: VueRenderer
          let popup: HTMLDivElement
          let cleanup: () => void

          return {
            onStart: (props: any) => {
              component = new VueRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })

              popup = document.createElement('div')
              popup.style.position = 'absolute'
              popup.style.zIndex = '9999'
              popup.style.pointerEvents = 'auto'
              // Prevent clicking on the popup from closing it immediately
              popup.addEventListener('mousedown', (e) => e.preventDefault())

              document.body.appendChild(popup)
              if (component.element) {
                popup.appendChild(component.element)
              }

              const virtualEl = {
                getBoundingClientRect: props.clientRect,
              }

              cleanup = autoUpdate(virtualEl as any, popup, () => {
                computePosition(virtualEl as any, popup, {
                  placement: 'bottom-start',
                  middleware: [offset(10), flip(), shift()]
                }).then(({ x, y }) => {
                  Object.assign(popup.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                  })
                })
              })
            },

            onUpdate(props: any) {
              component.updateProps(props)
              // No need to update position manually as autoUpdate handles it 
              // and props.clientRect is a function that is called by autoUpdate via virtualEl
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                // logic to hide is handled by onExit which is called by Tiptap
                return false
              }

              return component.ref?.onKeyDown(props)
            },

            onExit() {
              if (cleanup) cleanup()
              if (popup && popup.parentNode) popup.parentNode.removeChild(popup)
              component.destroy()
            },
          }
        },
      }),
    ]
  },

  addStorage() {
    return {
      rect: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    };
  }
})
