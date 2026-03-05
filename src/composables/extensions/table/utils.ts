import { findParentNode } from '@tiptap/vue-3'
import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorState, Selection, Transaction } from '@tiptap/pm/state'
import { CellSelection, type Rect, TableMap } from '@tiptap/pm/tables'
import type { EditorView } from '@tiptap/pm/view'
import { Table } from './table'

export const isRectSelected = (rect: Rect) => (selection: CellSelection) => {
  const map = TableMap.get(selection.$anchorCell.node(-1))
  const start = selection.$anchorCell.start(-1)
  const cells = map.cellsInRect(rect)
  const selectedCells = map.cellsInRect(
    map.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start)
  )
  for (let i = 0, count = cells.length; i < count; i += 1) {
    if (selectedCells.indexOf(cells[i]) === -1) return false
  }
  return true
}

export const findTable = (selection: Selection) =>
  findParentNode((node: Node) => node.type.spec.tableRole && node.type.spec.tableRole === 'table')(
    selection
  )

export const isCellSelection = (selection: Selection): selection is CellSelection =>
  selection instanceof CellSelection

export const isColumnSelected = (columnIndex: number) => (selection: Selection) => {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1))
    return isRectSelected({
      left: columnIndex,
      right: columnIndex + 1,
      top: 0,
      bottom: map.height,
    })(selection)
  }
  return false
}

export const isRowSelected = (rowIndex: number) => (selection: Selection) => {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1))
    return isRectSelected({
      left: 0,
      right: map.width,
      top: rowIndex,
      bottom: rowIndex + 1,
    })(selection)
  }
  return false
}

export const isTableSelected = (selection: Selection) => {
  if (isCellSelection(selection)) {
    const map = TableMap.get(selection.$anchorCell.node(-1))
    return isRectSelected({
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height,
    })(selection)
  }
  return false
}

export const getCellsInColumn =
  (columnIndex: number | number[]) => (selection: Selection) => {
    const table = findTable(selection)
    if (table) {
      const map = TableMap.get(table.node)
      const indexes = Array.isArray(columnIndex) ? columnIndex : [columnIndex]
      return indexes.reduce(
        (acc, index) => {
          if (index >= 0 && index <= map.width - 1) {
            const cells = map.cellsInRect({
              left: index,
              right: index + 1,
              top: 0,
              bottom: map.height,
            })
            return acc.concat(
              cells.map((nodePos) => {
                const node = table.node.nodeAt(nodePos)
                const pos = nodePos + table.start
                return { pos, start: pos + 1, node }
              })
            )
          }
          return acc
        },
        [] as { pos: number; start: number; node: Node | null | undefined }[]
      )
    }
    return null
  }

export const getCellsInRow = (rowIndex: number | number[]) => (selection: Selection) => {
  const table = findTable(selection)
  if (table) {
    const map = TableMap.get(table.node)
    const indexes = Array.isArray(rowIndex) ? rowIndex : [rowIndex]
    return indexes.reduce(
      (acc, index) => {
        if (index >= 0 && index <= map.height - 1) {
          const cells = map.cellsInRect({
            left: 0,
            right: map.width,
            top: index,
            bottom: index + 1,
          })
          return acc.concat(
            cells.map((nodePos) => {
              const node = table.node.nodeAt(nodePos)
              const pos = nodePos + table.start
              return { pos, start: pos + 1, node }
            })
          )
        }
        return acc
      },
      [] as { pos: number; start: number; node: Node | null | undefined }[]
    )
  }
  return null
}

export const getCellsInTable = (selection: Selection) => {
  const table = findTable(selection)
  if (table) {
    const map = TableMap.get(table.node)
    const cells = map.cellsInRect({
      left: 0,
      right: map.width,
      top: 0,
      bottom: map.height,
    })
    return cells.map((nodePos) => {
      const node = table.node.nodeAt(nodePos)
      const pos = nodePos + table.start
      return { pos, start: pos + 1, node }
    })
  }
  return null
}

const findParentNodeClosestToPos = ($pos: ResolvedPos, predicate: (node: Node) => boolean) => {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i)
    if (predicate(node)) {
      return { pos: i > 0 ? $pos.before(i) : 0, start: $pos.start(i), depth: i, node }
    }
  }
  return null
}

const findCellClosestToPos = ($pos: ResolvedPos) => {
  const predicate = (node: Node) =>
    node.type.spec.tableRole && /cell/i.test(node.type.spec.tableRole as string)
  return findParentNodeClosestToPos($pos, predicate)
}

const select = (type: 'row' | 'column') => (index: number) => (tr: Transaction) => {
  const table = findTable(tr.selection)
  const isRowSelection = type === 'row'
  if (table) {
    const map = TableMap.get(table.node)
    if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
      const left = isRowSelection ? 0 : index
      const top = isRowSelection ? index : 0
      const right = isRowSelection ? map.width : index + 1
      const bottom = isRowSelection ? index + 1 : map.height
      const cellsInFirstRow = map.cellsInRect({
        left,
        top,
        right: isRowSelection ? right : left + 1,
        bottom: isRowSelection ? top + 1 : bottom,
      })
      const cellsInLastRow =
        bottom - top === 1
          ? cellsInFirstRow
          : map.cellsInRect({
              left: isRowSelection ? left : right - 1,
              top: isRowSelection ? bottom - 1 : top,
              right,
              bottom,
            })
      const head = table.start + cellsInFirstRow[0]
      const anchor = table.start + cellsInLastRow[cellsInLastRow.length - 1]
      return tr.setSelection(new CellSelection(tr.doc.resolve(anchor), tr.doc.resolve(head)))
    }
  }
  return tr
}

export const selectColumn = select('column')
export const selectRow = select('row')

export const selectTable = (tr: Transaction) => {
  const table = findTable(tr.selection)
  if (table) {
    const { map } = TableMap.get(table.node)
    if (map && map.length) {
      const head = table.start + map[0]
      const anchor = table.start + map[map.length - 1]
      return tr.setSelection(
        new CellSelection(tr.doc.resolve(anchor), tr.doc.resolve(head))
      )
    }
  }
  return tr
}

export const isColumnGripSelected = ({
  editor,
  view,
  state,
  from,
}: {
  editor: { isActive: (name: string) => boolean }
  view: EditorView
  state: EditorState
  from: number
}) => {
  const domAtPos = view.domAtPos(from).node as HTMLElement
  const nodeDOM = view.nodeDOM(from) as HTMLElement
  const node = nodeDOM || domAtPos
  if (!editor.isActive(Table.name) || !node || isTableSelected(state.selection)) return false
  let container: HTMLElement | null = node
  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement
  }
  const gripColumn =
    container?.querySelector?.('a.grip-column.selected')
  return !!gripColumn
}

export const isRowGripSelected = ({
  editor,
  view,
  state,
  from,
}: {
  editor: { isActive: (name: string) => boolean }
  view: EditorView
  state: EditorState
  from: number
}) => {
  const domAtPos = view.domAtPos(from).node as HTMLElement
  const nodeDOM = view.nodeDOM(from) as HTMLElement
  const node = nodeDOM || domAtPos
  if (!editor.isActive(Table.name) || !node || isTableSelected(state.selection)) return false
  let container: HTMLElement | null = node
  while (container && !['TD', 'TH'].includes(container.tagName)) {
    container = container.parentElement
  }
  const gripRow = container?.querySelector?.('a.grip-row.selected')
  return !!gripRow
}

type CellInfo = { pos: number; start: number; node: Node | null | undefined }

const getSpanMetrics = (n: Node | null | undefined) => {
  const attrs = (n?.attrs ?? {}) as Record<string, unknown>
  const rowspan = typeof attrs.rowspan === 'number' ? attrs.rowspan : 1
  const colspan = typeof attrs.colspan === 'number' ? attrs.colspan : 1
  return { rowspan, colspan }
}

const hasSpans = (cellsA: CellInfo[] | null, cellsB: CellInfo[] | null) => {
  if (!cellsA || !cellsB) return true
  if (cellsA.length !== cellsB.length) return true
  for (let i = 0; i < cellsA.length; i++) {
    const a = cellsA[i].node
    const b = cellsB[i].node
    const aSp = getSpanMetrics(a)
    const bSp = getSpanMetrics(b)
    if (aSp.rowspan !== 1 || aSp.colspan !== 1) return true
    if (bSp.rowspan !== 1 || bSp.colspan !== 1) return true
  }
  return false
}

const getCurrentCellRect = (tr: Transaction) => {
  const table = findTable(tr.selection)
  if (!table || !isCellSelection(tr.selection)) return null
  const map = TableMap.get(table.node)
  const cell = map.findCell((tr.selection as CellSelection).$anchorCell.pos - table.start)
  return { table, map, cell }
}

export const moveColumnLeft = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr)
  if (!ctx) return tr
  const { cell } = ctx
  const source = cell.left
  const target = source - 1
  if (target < 0) return tr
  const sel = tr.selection as CellSelection
  const sourceCells = getCellsInColumn(source)(sel)
  const targetCells = getCellsInColumn(target)(sel)
  if (hasSpans(sourceCells, targetCells)) return tr
  for (let i = 0; i < sourceCells!.length; i++) {
    const a = sourceCells![i]
    const b = targetCells![i]
    const posA = tr.mapping.map(a.pos)
    const posB = tr.mapping.map(b.pos)
    const nodeA = tr.doc.nodeAt(posA)
    const nodeB = tr.doc.nodeAt(posB)
    if (!nodeA || !nodeB) continue
    tr = tr.replaceWith(posA, posA + nodeA.nodeSize, (nodeB as Node).copy((nodeB as Node).content))
    const mappedB = tr.mapping.map(posB)
    tr = tr.replaceWith(mappedB, mappedB + (nodeB as Node).nodeSize, (nodeA as Node).copy((nodeA as Node).content))
  }
  return tr
}

export const moveColumnRight = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr)
  if (!ctx) return tr
  const { map, cell } = ctx
  const source = cell.left
  const target = source + 1
  if (target >= map.width) return tr
  const sel = tr.selection as CellSelection
  const sourceCells = getCellsInColumn(source)(sel)
  const targetCells = getCellsInColumn(target)(sel)
  if (hasSpans(sourceCells, targetCells)) return tr
  for (let i = 0; i < sourceCells!.length; i++) {
    const a = sourceCells![i]
    const b = targetCells![i]
    const posA = tr.mapping.map(a.pos)
    const posB = tr.mapping.map(b.pos)
    const nodeA = tr.doc.nodeAt(posA)
    const nodeB = tr.doc.nodeAt(posB)
    if (!nodeA || !nodeB) continue
    tr = tr.replaceWith(posA, posA + nodeA.nodeSize, (nodeB as Node).copy((nodeB as Node).content))
    const mappedB = tr.mapping.map(posB)
    tr = tr.replaceWith(mappedB, mappedB + (nodeB as Node).nodeSize, (nodeA as Node).copy((nodeA as Node).content))
  }
  return tr
}

export const moveRowUp = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr)
  if (!ctx) return tr
  const { cell } = ctx
  const source = cell.top
  const target = source - 1
  if (target < 0) return tr
  const sel = tr.selection as CellSelection
  const sourceRow = getCellsInRow(source)(sel)
  const targetRow = getCellsInRow(target)(sel)
  if (hasSpans(sourceRow, targetRow)) return tr
  for (let i = 0; i < sourceRow!.length; i++) {
    const a = sourceRow![i]
    const b = targetRow![i]
    const posA = tr.mapping.map(a.pos)
    const posB = tr.mapping.map(b.pos)
    const nodeA = tr.doc.nodeAt(posA)
    const nodeB = tr.doc.nodeAt(posB)
    if (!nodeA || !nodeB) continue
    tr = tr.replaceWith(posA, posA + nodeA.nodeSize, (nodeB as Node).copy((nodeB as Node).content))
    const mappedB = tr.mapping.map(posB)
    tr = tr.replaceWith(mappedB, mappedB + (nodeB as Node).nodeSize, (nodeA as Node).copy((nodeA as Node).content))
  }
  return tr
}

export const moveRowDown = (tr: Transaction) => {
  const ctx = getCurrentCellRect(tr)
  if (!ctx) return tr
  const { map, cell } = ctx
  const source = cell.top
  const target = source + 1
  if (target >= map.height) return tr
  const sel = tr.selection as CellSelection
  const sourceRow = getCellsInRow(source)(sel)
  const targetRow = getCellsInRow(target)(sel)
  if (hasSpans(sourceRow, targetRow)) return tr
  for (let i = 0; i < sourceRow!.length; i++) {
    const a = sourceRow![i]
    const b = targetRow![i]
    const posA = tr.mapping.map(a.pos)
    const posB = tr.mapping.map(b.pos)
    const nodeA = tr.doc.nodeAt(posA)
    const nodeB = tr.doc.nodeAt(posB)
    if (!nodeA || !nodeB) continue
    tr = tr.replaceWith(posA, posA + nodeA.nodeSize, (nodeB as Node).copy((nodeB as Node).content))
    const mappedB = tr.mapping.map(posB)
    tr = tr.replaceWith(mappedB, mappedB + (nodeB as Node).nodeSize, (nodeA as Node).copy((nodeA as Node).content))
  }
  return tr
}

/** 行/列外侧悬浮区域宽度（表格外的 padding 区域） */
export const TABLE_GUTTER = 48
/** 表格内侧边缘宽度：靠近表格左/上边缘这一条也触发 grip，便于触发 */
export const TABLE_EDGE_ZONE = 36

/** 根据 clientY 在表格中解析行索引（用于左侧 gutter 悬浮） */
export function getRowIndexFromY(table: HTMLTableElement, clientY: number): number {
  for (let i = 0; i < table.rows.length; i += 1) {
    const rowRect = table.rows[i].getBoundingClientRect()
    if (clientY >= rowRect.top && clientY <= rowRect.bottom) return i
  }
  return Math.max(0, table.rows.length - 1)
}

/** 根据 clientX 在表格中解析列索引（用于顶部 gutter 悬浮） */
export function getColIndexFromX(table: HTMLTableElement, clientX: number): number {
  const firstRow = table.rows[0]
  if (!firstRow?.cells.length) return 0
  for (let i = 0; i < firstRow.cells.length; i += 1) {
    const cellRect = (firstRow.cells[i] as HTMLElement).getBoundingClientRect()
    if (clientX >= cellRect.left && clientX <= cellRect.right) return i
  }
  return Math.max(0, firstRow.cells.length - 1)
}
