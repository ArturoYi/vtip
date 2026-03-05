import {
  type CommandProps,
  type Editor,
  Node,
  type NodeViewProps,
  VueNodeViewRenderer
} from '@tiptap/vue-3';
import { Component } from 'vue';

export interface IFramePlaceholderOptions {
  HTMLAttributes: Record<string, object>;
  onEmbed: (url: string, editor: Editor) => void;
}

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    iframePlaceholder: {
      insertIFramePlaceholder: () => ReturnType;
    };
  }
}

export const IFramePlaceholder = (
  component: Component<NodeViewProps>
): Node<IFramePlaceholderOptions> =>
  Node.create({
    name: 'iframe-placeholder',
    group: 'block',
    draggable: true,
    atom: true,
    content: 'inline*',
    isolating: true,
    addOptions() {
      return {
        HTMLAttributes: {},
        onEmbed: () => {}
      };
    },
    parseHTML() {
      return [{ tag: `div[data-type="${this.name}"]` }];
    },
    renderHTML() {
      return ['div', { 'data-type': this.name }];
    },
    addNodeView() {
      return VueNodeViewRenderer(component);
    },
    addCommands() {
      return {
        insertIFramePlaceholder: () => (props: CommandProps) => {
          return props.commands.insertContent({
            type: 'iframe-placeholder'
          });
        }
      };
    }
  });
