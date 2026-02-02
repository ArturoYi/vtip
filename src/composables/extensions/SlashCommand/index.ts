import { Editor, Extension } from '@tiptap/vue-3'
import Suggestion, { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion'
import { EditorState, PluginKey } from '@tiptap/pm/state'
import { VueRenderer } from '@tiptap/vue-3'
import { computePosition, autoUpdate, flip, shift, offset, Placement } from '@floating-ui/dom'
import SlashCommandList from './SlashCommandList.vue'
import { defaultCommandGroups, CommandGroup } from './groups'
import { SuggestionRange } from './suggestion'

const extensionName = 'slashCommand'

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
  name: extensionName,
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
        pluginKey: new PluginKey(extensionName),
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const groups = defaultCommandGroups
          if (!query) {
            return groups.map(group => ({
              ...group,
              items: group.items.map(item => ({ ...item, isEnabled: true }))
            }))
          }

          const filteredGroups: any[] = []

          groups.forEach(group => {
            const filteredItems = group.items.filter(item => {
              const nameMatch = item.name.toLowerCase().includes(query.toLowerCase())
              const tooltipMatch = item.tooltip?.toLowerCase().includes(query.toLowerCase())
              const descMatch = item.description && item.description.toLowerCase().includes(query.toLowerCase())
              return nameMatch || tooltipMatch || descMatch
            })

            if (filteredItems.length) {
              filteredGroups.push({
                ...group,
                items: filteredItems.map(item => ({ ...item, isEnabled: true }))
              })
            }
          })

          return filteredGroups
        },
        render: () => {
          let component: VueRenderer

          let scrollHandler: (() => void) | null = null;

          return {
            onStart: (props: SuggestionProps) => {
              component = new VueRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              })

              const { view } = props.editor;

              if (popup.element && component.element) {
                popup.element.appendChild(component.element);
                popup.element.style.visibility = 'visible';
                popup.element.style.pointerEvents = 'auto';
                popup.isVisible = true;

                const updatePosition = () => {
                  if (!popup.element || !props.clientRect) return;

                  const rect = props.clientRect();
                  if (!rect) return;

                  const referenceElement = {
                    getBoundingClientRect: () => rect
                  };

                  computePosition(referenceElement, popup.element, {
                    placement: 'bottom-start' as Placement,
                    middleware: [
                      offset({ mainAxis: 8, crossAxis: 16 }),
                      flip({ fallbackPlacements: ['top-start', 'bottom-start'] })
                    ]
                  }).then(({ x, y }) => {
                    if (popup.element) {
                      popup.element.style.left = `${x}px`;
                      popup.element.style.top = `${y}px`;
                    }
                  });
                };

                updatePosition();

                // Set up auto-update for scroll events
                if (props.clientRect) {
                  const referenceElement = {
                    getBoundingClientRect: () => props.clientRect?.() || new DOMRect()
                  };
                  popup.cleanup = autoUpdate(referenceElement, popup.element, updatePosition);
                }

                scrollHandler = updatePosition;
                view.dom.parentElement?.addEventListener('scroll', scrollHandler);
              }
            },

            onUpdate(props: SuggestionProps) {
              component.updateProps(props)
              if (popup.element && popup.isVisible && props.clientRect) {
                const rect = props.clientRect();
                if (rect) {
                  const referenceElement = {
                    getBoundingClientRect: () => rect
                  };

                  computePosition(referenceElement, popup.element, {
                    placement: 'bottom-start' as Placement,
                    middleware: [
                      offset({ mainAxis: 8, crossAxis: 16 }),
                      flip({ fallbackPlacements: ['top-start', 'bottom-start'] })
                    ]
                  }).then(({ x, y }) => {
                    if (popup.element) {
                      popup.element.style.left = `${x}px`;
                      popup.element.style.top = `${y}px`;
                    }
                  });

                  // @ts-ignore
                  props.editor.storage[extensionName].rect = rect;
                }
              }
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                if (popup.element) {
                  popup.element.style.visibility = 'hidden';
                  popup.element.style.pointerEvents = 'none';
                  popup.isVisible = false;
                }
                return true;
              }

              if (!popup.isVisible && popup.element) {
                popup.element.style.visibility = 'visible';
                popup.element.style.pointerEvents = 'auto';
                popup.isVisible = true;
              }

              if (props.event.key === 'Enter') {
                return component.ref?.onKeyDown(props) || false
              }

              return component.ref?.onKeyDown(props);
            },

            onExit(props: SuggestionProps) {
              if (popup.element) {
                popup.element.style.visibility = 'hidden';
                popup.element.style.pointerEvents = 'none';
                popup.element.innerHTML = '';
                popup.isVisible = false;
              }

              if (popup.cleanup) {
                popup.cleanup();
                popup.cleanup = null;
              }

              if (scrollHandler) {
                const { view } = props.editor;
                view.dom.parentElement?.removeEventListener('scroll', scrollHandler);
                scrollHandler = null;
              }

              component.destroy();
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
