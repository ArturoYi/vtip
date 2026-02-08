import {
    type CommandProps,
    type Editor,
    Node,
    type NodeViewProps,
    VueNodeViewRenderer
} from '@tiptap/vue-3';
import { Component } from 'vue';

export interface ImagePlaceholderOptions {
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
        imagePlaceholder: {
            /**
             * Inserts an image placeholder
             */
            insertImagePlaceholder: () => ReturnType;
        };
    }
}

export const ImagePlaceholder = (
    component: Component<NodeViewProps>,
): Node<ImagePlaceholderOptions> => Node.create({
    name: 'image-placeholder',
    group: 'block', // 作为块级节点参与排版
    draggable: true, // 允许在编辑器中拖拽移动
    atom: true, // 视为不可拆分的原子节点
    content: 'inline*', // 允许包含行内内容
    isolating: true, // 与周围内容隔离，避免自动合并
    addOptions() { // 定义可配置项与默认值
        return {
            HTMLAttributes: {}, // 传递到占位节点的 HTML 属性
            onDrop: () => { }, // 处理拖拽上传的回调
            onDropRejected: () => { }, // 文件不符合规则时的回调
            onEmbed: () => { } // 外链/链接嵌入的回调
        };
    },
    parseHTML() { // 识别 DOM 中的占位节点
        return [{ tag: `div[data-type="${this.name}"]` }];
    },
    renderHTML() { // 序列化为可导出的 HTML，以避免 getHTML 报错
        return ['div', { 'data-type': this.name }];
    },
    addNodeView() { // 使用 Vue 组件渲染占位节点
        return VueNodeViewRenderer(component);
    },
    addCommands() { // 注册插入占位节点的命令
        return {
            insertImagePlaceholder: () => (props: CommandProps) => {
                // 插入一个 image-placeholder 节点
                return props.commands.insertContent({
                    type: 'image-placeholder'
                });
            }
        };
    }
})
