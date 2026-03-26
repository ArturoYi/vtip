import 'virtual:uno.css'
import { useVtip } from './composables/useVtip'
import './style/index.css'
import EditorToolbar from './components/toolbar/EditorToolbar.vue'
import { EditorContent } from '@tiptap/vue-3'
import TableColMenu from './composables/components/TableColMenu.vue'
import TableRowMenu from './composables/components/TableRowMenu.vue'

import VtipEditor from './components/VtipEditor.vue'
import VtipRenderer from './components/VtipRenderer.vue'

export { 
  useVtip, 
  EditorContent, 
  EditorToolbar, 
  TableColMenu, 
  TableRowMenu,
  VtipEditor,
  VtipRenderer
}
