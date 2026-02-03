import type { Editor } from '@tiptap/vue-3';
import type { LucideIcon } from 'lucide-vue-next';
import type { Node } from '@tiptap/pm/model';

export interface VtipToolBarCommands {
	name: string;
	icon?: LucideIcon;
	tooltip?: string;
	description?: string;
	shortCut?: string;
	onClick?: (editor: Editor) => void;
	turnInto?: (editor: Editor, node: Node, pos: number) => void;
	isActive?: (editor: Editor) => boolean;
	clickable?: (editor: Editor) => boolean;
}
