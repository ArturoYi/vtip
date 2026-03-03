import {
  type CommandProps,
  type Editor,
  Node,
  type NodeViewProps,
  VueNodeViewRenderer
} from '@tiptap/vue-3';
import { Component } from 'vue';

export interface AudioPlaceholderOptions {
  HTMLAttributes: Record<string, object>;
  onDrop: (files: File[], editor: Editor) => void;
  onDropRejected?: (files: File[], editor: Editor) => void;
  onEmbed: (url: string, editor: Editor) => void;
  allowedMimeTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
}

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    audioPlaceholder: {
      insertAudioPlaceholder: () => ReturnType;
    };
  }
}

export const AudioPlaceholder = (
  component: Component<NodeViewProps>
): Node<AudioPlaceholderOptions> =>
  Node.create({
    name: 'audio-placeholder',
    group: 'block',
    draggable: true,
    atom: true,
    content: 'inline*',
    isolating: true,
    addOptions() {
      return {
        HTMLAttributes: {},
        onDrop: () => {},
        onDropRejected: () => {},
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
        insertAudioPlaceholder: () => (props: CommandProps) => {
          return props.commands.insertContent({
            type: 'audio-placeholder'
          });
        }
      };
    }
  });
