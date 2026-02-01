import { useEditor, type EditorOptions } from '@tiptap/vue-3'

export type VtipOptions = Partial<EditorOptions>

export const useVtip = (options: VtipOptions = {}) => {
  const editor = useEditor(options)
  return editor
}
