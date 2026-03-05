<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Sheet,
  Trash2,
} from 'lucide-vue-next'
import {
  isColumnGripSelected,
  moveColumnLeft,
  moveColumnRight,
} from '../extensions/table/utils'
import { tableStrings } from '../extensions/table/strings'

const s = tableStrings.menu

defineProps<{
  editor: Editor
  parentElement?: HTMLElement
}>()

function shouldShowColMenu(props: {
  editor: { isEditable: boolean }
  view: import('@tiptap/pm/view').EditorView
  state: import('@tiptap/pm/state').EditorState
  from: number
}) {
  if (!props.editor?.isEditable) return false
  if (!props.state) return false
  return isColumnGripSelected({
    editor: props.editor as Editor,
    view: props.view,
    state: props.state,
    from: props.from,
  })
}

const shouldShowColMenuFn = shouldShowColMenu as (p: unknown) => boolean
</script>

<template>
  <BubbleMenu
    :editor="editor"
    plugin-key="table-col-menu"
    :should-show="shouldShowColMenuFn"
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
      :title="s.headerColumn"
      @click="editor.chain().focus().toggleHeaderColumn().run()"
    >
      <Sheet class="vtip-table-menu-icon" />
      {{ s.headerColumn }}
    </button>
    <div class="vtip-table-menu-sep" />
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.addColumnAfter"
      @click="editor.chain().focus().addColumnAfter().run()"
    >
      <ArrowRightFromLine class="vtip-table-menu-icon" />
      {{ s.addColumnAfter }}
    </button>
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.addColumnBefore"
      @click="editor.chain().focus().addColumnBefore().run()"
    >
      <ArrowLeftFromLine class="vtip-table-menu-icon" />
      {{ s.addColumnBefore }}
    </button>
    <div class="vtip-table-menu-sep" />
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.moveColumnLeft"
      @click="editor.view.dispatch(moveColumnLeft(editor.state.tr))"
    >
      <ArrowLeft class="vtip-table-menu-icon" />
      {{ s.moveColumnLeft }}
    </button>
    <button
      type="button"
      class="vtip-table-menu-item"
      :title="s.moveColumnRight"
      @click="editor.view.dispatch(moveColumnRight(editor.state.tr))"
    >
      <ArrowRight class="vtip-table-menu-icon" />
      {{ s.moveColumnRight }}
    </button>
    <div class="vtip-table-menu-sep" />
    <button
      type="button"
      class="vtip-table-menu-item vtip-table-menu-item--destructive"
      :title="s.deleteColumn"
      @click="editor.chain().focus().deleteColumn().run()"
    >
      <Trash2 class="vtip-table-menu-icon" />
      {{ s.deleteColumn }}
    </button>
  </BubbleMenu>
</template>
