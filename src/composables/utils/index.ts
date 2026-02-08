import type { Node } from '@tiptap/pm/model';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import { Editor } from '@tiptap/vue-3';

export const browser = typeof window !== 'undefined'

/**
 * Check if the current browser is in mac or not
 */
export const isMac = browser
    ? navigator.userAgent.includes('Macintosh') || navigator.userAgent.includes('Mac OS X')
    : false


export const findColors = (doc: Node) => {
    const hexColor = /(#[0-9a-f]{3,6})\b/gi;
    const decorations: Decoration[] = [];

    doc.descendants((node, position) => {
        if (!node.text) {
            return;
        }

        Array.from(node.text.matchAll(hexColor)).forEach((match) => {
            const color = match[0];
            const index = match.index || 0;
            const from = position + index;
            const to = from + color.length;
            const decoration = Decoration.inline(from, to, {
                class: 'color',
                style: `--color: ${color}`
            });

            decorations.push(decoration);
        });
    });

    return DecorationSet.create(doc, decorations);
};

/**
 * Dupilcate content at the current selection
 * @param editor Editor instance
 * @param node Node to be duplicated
 */
export const duplicateContent = (editor: Editor, node: Node) => {
    const { view } = editor;
    const { state } = view;
    const { selection } = state;

    editor
        .chain()
        .insertContentAt(selection.to, node.toJSON(), {
            updateSelection: true
        })
        .focus(selection.to)
        .run();
};

export enum FileType {
	IMAGE = 'image/*',
	VIDEO = 'video/*',
	AUDIO = 'audio/*',
	DOCS = 'docs/*',
	UNKNOWN = 'unknown'
}