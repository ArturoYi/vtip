import { VueNodeViewRenderer, type CommandProps, Node, type NodeViewProps } from '@tiptap/vue-3';
import { Component } from 'vue';

export interface IFrameOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    iframe: {
      setIFrame: (attrs: { src: string; title?: string | null }) => ReturnType;
    };
  }
}

export const IFrameExtended = (component?: Component<NodeViewProps>): Node<IFrameOptions, unknown> => {
  return Node.create<IFrameOptions>({
    name: 'iframe',
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
          parseHTML: (el) => (el as HTMLIFrameElement).getAttribute('src'),
          renderHTML: (attrs) => (attrs.src ? { src: attrs.src } : {})
        },
        title: {
          default: null,
          parseHTML: (el) => (el as HTMLIFrameElement).getAttribute('data-title'),
          renderHTML: (attrs) => (attrs.title ? { 'data-title': attrs.title } : {})
        },
        frameborder: {
          default: '0',
          parseHTML: (el) => (el as HTMLIFrameElement).getAttribute('frameborder') ?? '0',
          renderHTML: (attrs) => ({ frameborder: attrs.frameborder ?? '0' })
        },
        allowfullscreen: {
          default: true,
          parseHTML: (el) => (el as HTMLIFrameElement).hasAttribute('allowfullscreen'),
          renderHTML: (attrs) => (attrs.allowfullscreen !== false ? { allowfullscreen: '' } : {})
        },
        width: {
          default: '100%',
          parseHTML: (el) => (el as HTMLElement).style?.width ?? '100%',
          renderHTML: () => ({})
        },
        align: {
          default: 'center',
          parseHTML: (el) => (el as HTMLElement).getAttribute('data-align') ?? 'center',
          renderHTML: (attrs) => (attrs.align ? { 'data-align': attrs.align } : {})
        }
      };
    },
    parseHTML() {
      return [{ tag: 'iframe' }];
    },
    renderHTML({ node, HTMLAttributes }) {
      const attrs: Record<string, unknown> = {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        src: node.attrs.src,
        frameborder: node.attrs.frameborder ?? '0',
        'data-align': node.attrs.align ?? 'center'
      };
      if (node.attrs.allowfullscreen !== false) attrs.allowfullscreen = '';
      if (node.attrs.title) attrs['data-title'] = node.attrs.title;
      return ['iframe', attrs];
    },
    addNodeView() {
      if (!component) return null;
      return VueNodeViewRenderer(component);
    },
    addCommands() {
      return {
        setIFrame:
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
