<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import {
  ArrowDown,
  ArrowUp,
  ArrowDownFromLine,
  ArrowUpFromLine,
  Sheet,
  Trash2,
} from 'lucide-vue-next'
import {
  isRowGripSelected,
  moveRowDown,
  moveRowUp,
} from '../extensions/table/utils'
import { tableStrings } from '../extensions/table/strings'

const s = tableStrings.menu

defineProps<{
  editor: Editor
  parentElement?: HTMLElement
}>()

function shouldShowRowMenu(props: {
  editor: { isEditable: boolean }
  view: import('@tiptap/pm/view').EditorView
  state: import('@tiptap/pm/state').EditorState
  from: number
}) {
  if (!props.editor?.isEditable) return false
  if (!props.state) return false
  return isRowGripSelected({
    editor: props.editor as Editor,
    view: props.view,
    state: props.state,
    from: props.from,
  })
}

const shouldShowRowMenuFn = shouldShowRowMenu as (p: unknown) => boolean
</script>

<template>
  <BubbleMenu
    :editor="editor"
    plugin-key="table-row-menu"
    :should-show="shouldShowRowMenuFn"
    :options="{
      shift: { crossAxis: true, mainAxis: true },
      strategy: 'absolute',
      autoPlacement: { allowedPlacements: ['bottom', 'top'] },
      scrollTarget: parentElement ?? undefined,
    }"
    class="vtip-table-menu"
  >
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.headerRow"
      @click="editor.chain().focus().toggleHeaderRow().run()"
    >
      <Sheet class="vtip-table-menu-icon" />
      {{ s.headerRow }}
    </button>
    <div class="vtip-table-menu-sep" />
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.addRowAfter"
      @click="editor.chain().focus().addRowAfter().run()"
    >
      <ArrowDownFromLine class="vtip-table-menu-icon" />
      {{ s.addRowAfter }}
    </button>
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.addRowBefore"
      @click="editor.chain().focus().addRowBefore().run()"
    >
      <ArrowUpFromLine class="vtip-table-menu-icon" />
      {{ s.addRowBefore }}
    </button>
    <div class="vtip-table-menu-sep" />
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.moveRowUp"
      @click="editor.view.dispatch(moveRowUp(editor.state.tr))"
    >
      <ArrowUp class="vtip-table-menu-icon" />
      {{ s.moveRowUp }}
    </button>
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.moveRowDown"
      @click="editor.view.dispatch(moveRowDown(editor.state.tr))"
    >
      <ArrowDown class="vtip-table-menu-icon" />
      {{ s.moveRowDown }}
    </button>
    <div class="vtip-table-menu-sep" />
    <button
      type="button"
      class="vtip-table-menu-item vtip-table-menu-item--destructive"
      :title="s.deleteRow"
      @click="editor.chain().focus().deleteRow().run()"
    >
      <Trash2 class="vtip-table-menu-icon" />
      {{ s.deleteRow }}
    </button>
  </BubbleMenu>
</template>
