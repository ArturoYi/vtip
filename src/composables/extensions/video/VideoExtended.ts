import { VueNodeViewRenderer, type CommandProps, Node, type NodeViewProps } from '@tiptap/vue-3';
import { Component } from 'vue';

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attrs: { src: string; title?: string | null }) => ReturnType;
    };
  }
}

export const VideoExtended = (component?: Component<NodeViewProps>): Node<VideoOptions, unknown> => {
  return Node.create<VideoOptions>({
    name: 'video',
    group: 'block',
    draggable: true,
    atom: true,
    addOptions() {
      return {
        HTMLAttributes: {}
      };
    },
    addAttributes() {
      return {
        src: {
          default: null,
          parseHTML: (el) => (el as HTMLVideoElement).getAttribute('src'),
          renderHTML: (attrs) => (attrs.src ? { src: attrs.src } : {})
        },
        title: {
          default: null,
          parseHTML: (el) => (el as HTMLVideoElement).getAttribute('data-title'),
          renderHTML: (attrs) => (attrs.title ? { 'data-title': attrs.title } : {})
        },
        controls: {
          default: true,
          parseHTML: (el) => (el as HTMLVideoElement).hasAttribute('controls'),
          renderHTML: (attrs) => (attrs.controls !== false ? { controls: '' } : {})
        },
        width: {
          default: '100%',
          parseHTML: (el) => (el as HTMLElement).style?.width ?? '100%',
          renderHTML: (attrs) => ({})
        },
        align: {
          default: 'center',
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-align') ?? 'center',
          renderHTML: (attrs) => (attrs.align ? { 'data-align': attrs.align } : {})
        }
      };
    },
    parseHTML() {
      return [{ tag: 'video' }];
    },
    renderHTML({ node, HTMLAttributes }) {
      const attrs: Record<string, unknown> = {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        src: node.attrs.src,
        'data-align': node.attrs.align ?? 'center'
      };
      if (node.attrs.controls !== false) attrs.controls = '';
      if (node.attrs.title) attrs['data-title'] = node.attrs.title;
      return ['video', attrs];
    },
    addNodeView() {
      if (!component) return null;
      return VueNodeViewRenderer(component);
    },
    addCommands() {
      return {
        setVideo:
          (attrs: { src: string; title?: string | null }) =>
          ({ chain }: CommandProps) => {
            return chain()
              .focus()
              .insertContent({ type: this.name, attrs: { src: attrs.src, title: attrs.title ?? null } })
              .run();
          }
      };
    }
  });
};
