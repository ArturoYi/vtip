import { VueNodeViewRenderer, type Node, type NodeViewProps } from '@tiptap/vue-3';
import Image, { type ImageOptions } from '@tiptap/extension-image';
import { Component } from 'vue';


export const ImageExtended = (component?: Component<NodeViewProps>): Node<ImageOptions, unknown> => {
    return Image.extend({
        addAttributes() {
            // 扩展图片节点属性，支持尺寸与对齐
            return {
                src: {
                    default: null
                },
                alt: {
                    default: null
                },
                title: {
                    default: null
                },
                width: {
                    default: '100%'
                },
                height: {
                    default: null
                },
                align: {
                    default: 'left'
                }
            };
        },
        addNodeView: () => {
            // 绑定 Vue 组件作为 NodeView，未传入时跳过
            if (!component) {
                return null;
            }
            return VueNodeViewRenderer(component);
        }
    }).configure({
        // 禁止 base64，避免内容过大
        allowBase64: false
    });
};
