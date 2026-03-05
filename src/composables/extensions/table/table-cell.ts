import { mergeAttributes, Node } from '@tiptap/vue-3'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import {
  getCellsInColumn,
  getRowIndexFromY,
  isRowSelected,
  selectRow,
  TABLE_EDGE_ZONE,
  TABLE_GUTTER,
} from './utils'
import { tableStrings } from './strings'

export interface TableCellOptions {
  HTMLAttributes: Record<string, unknown>
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',
  content: 'block+',
  tableRole: 'cell',
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['td', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addAttributes() {
    return {
      colspan: {
        default: 1,
        parseHTML: (element: HTMLElement) => {
          const colspan = element.getAttribute('colspan')
          return colspan ? Number.parseInt(colspan, 10) : 1
        },
      },
      rowspan: {
        default: 1,
        parseHTML: (element: HTMLElement) => {
          const rowspan = element.getAttribute('rowspan')
          return rowspan ? Number.parseInt(rowspan, 10) : 1
        },
      },
      colwidth: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const colwidth = element.getAttribute('colwidth')
          return colwidth ? [Number.parseInt(colwidth, 10)] : null
        },
      },
      style: { default: null },
    }
  },

  addProseMirrorPlugins() {
    const { isEditable } = this.editor
    const s = tableStrings.extension
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            if (!isEditable) return DecorationSet.empty
            const { doc, selection } = state
            const decorations: Decoration[] = []
            const firstColCells = getCellsInColumn(0)(selection)
            if (firstColCells) {
              firstColCells.forEach(({ pos }: { pos: number }, index: number) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection)
                    let className = 'grip-row'
                    if (rowSelected) className += ' selected'
                    if (index === 0) className += ' first'
                    if (index === firstColCells.length - 1) className += ' last'
                    const grip = document.createElement('a')
                    grip.className = className
                    grip.setAttribute('role', 'button')
                    grip.setAttribute('aria-label', s.selectRow)
                    grip.setAttribute('tabindex', '0')
                    grip.dataset.rowIndex = String(index)
                    grip.addEventListener('mousedown', (event) => {
                      event.preventDefault()
                      event.stopImmediatePropagation()
                      this.editor.view.dispatch(selectRow(index)(this.editor.state.tr))
                    })
                    return grip
                  })
                )
              })
            }
            if (firstColCells && firstColCells.length > 0) {
              const lastRowCell = firstColCells[firstColCells.length - 1]
              decorations.push(
                Decoration.widget(lastRowCell.pos + 1, () => {
                  const btn = document.createElement('button')
                  btn.className = 'add-row-btn'
                  btn.type = 'button'
                  btn.setAttribute('aria-label', s.addRow)
                  btn.setAttribute('title', s.addRowAfter)
                  btn.textContent = '+'
                  btn.addEventListener('mousedown', (event) => {
                    event.preventDefault()
                    event.stopImmediatePropagation()
                    this.editor.view.dispatch(
                      selectRow(firstColCells.length - 1)(this.editor.state.tr)
                    )
                    this.editor.chain().focus().addRowAfter().run()
                  })
                  return btn
                })
              )
            }
            return DecorationSet.create(doc, decorations)
          },
        },
      }),
      new Plugin({
        props: {
          handleDOMEvents: {
            mousemove: (view, event) => {
              const target = event.target as HTMLElement
              const ev = event as MouseEvent
              const wrapper = target.closest('.tableWrapper')
              const table = wrapper?.querySelector('table')
              if (wrapper && table) {
                const rect = table.getBoundingClientRect()
                const inRowZone =
                  ev.clientX >= rect.left - TABLE_GUTTER &&
                  ev.clientX < rect.left + TABLE_EDGE_ZONE &&
                  ev.clientY >= rect.top &&
                  ev.clientY <= rect.bottom
                if (inRowZone) {
                  const rowIndex = getRowIndexFromY(table as HTMLTableElement, ev.clientY)
                  const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
                  grips.forEach((g, idx) => {
                    if (idx === rowIndex) g.classList.add('show-row-grip')
                    else g.classList.remove('show-row-grip')
                  })
                  const lastIndex = table.rows.length ? table.rows.length - 1 : -1
                  if (rowIndex === lastIndex) wrapper.classList.add('last-row-hover')
                  else wrapper.classList.remove('last-row-hover')
                  return false
                }
              }
              const cell = target.closest('td, th')
              const tableInCell = target.closest('table')
              if (!cell || !tableInCell) return false
              const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex
              const grips = tableInCell.querySelectorAll<HTMLAnchorElement>('a.grip-row')
              grips.forEach((g, idx) => {
                if (idx === rowIndex) g.classList.add('show-row-grip')
                else g.classList.remove('show-row-grip')
              })
              const wrapperCell = tableInCell.closest('.tableWrapper')
              if (wrapperCell) {
                const lastIndex = tableInCell.rows.length ? tableInCell.rows.length - 1 : -1
                if (rowIndex === lastIndex) wrapperCell.classList.add('last-row-hover')
                else wrapperCell.classList.remove('last-row-hover')
              }
              return false
            },
            focusin: (view, event) => {
              const target = event.target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
              grips.forEach((g, idx) => {
                if (idx === rowIndex) g.classList.add('show-row-grip')
                else g.classList.remove('show-row-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows.length ? table.rows.length - 1 : -1
                if (rowIndex === lastIndex) wrapper.classList.add('last-row-hover')
                else wrapper.classList.remove('last-row-hover')
              }
              return false
            },
            mousedown: (view, event) => {
              const target = event.target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
              grips.forEach((g, idx) => {
                if (idx === rowIndex) g.classList.add('show-row-grip')
                else g.classList.remove('show-row-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows.length ? table.rows.length - 1 : -1
                if (rowIndex === lastIndex) wrapper.classList.add('last-row-hover')
                else wrapper.classList.remove('last-row-hover')
              }
              return false
            },
            mouseleave: (view, event) => {
              const target = event.target as HTMLElement
              const table = target.closest('table')
              const wrapper = target.closest('.tableWrapper')
              const el = table ?? wrapper
              if (!el) return false
              const t = table || wrapper?.querySelector('table')
              if (t) {
                const grips = t.querySelectorAll<HTMLAnchorElement>('a.grip-row')
                grips.forEach((g) => g.classList.remove('show-row-grip'))
              }
              if (wrapper) wrapper.classList.remove('last-row-hover')
              return false
            },
            mouseout: (view, event) => {
              const target = event.target as HTMLElement
              const to = (event as MouseEvent).relatedTarget as HTMLElement | null
              const wrapper = target.closest('.tableWrapper')
              if (wrapper && to && !to.closest('.tableWrapper')) {
                const table = wrapper.querySelector('table')
                if (table) {
                  const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
                  grips.forEach((g) => g.classList.remove('show-row-grip'))
                }
                wrapper.classList.remove('last-row-hover')
              }
              const table = target.closest('table')
              if (!table) return false
              if (!to?.closest('table') || to.closest('table') !== table) {
                const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
                grips.forEach((g) => g.classList.remove('show-row-grip'))
                const wr = table.closest('.tableWrapper')
                if (wr) wr.classList.remove('last-row-hover')
              }
              return false
            },
            touchstart: (view, event) => {
              const target = (event as TouchEvent).target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
              grips.forEach((g, idx) => {
                if (idx === rowIndex) g.classList.add('show-row-grip')
                else g.classList.remove('show-row-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows.length ? table.rows.length - 1 : -1
                if (rowIndex === lastIndex) wrapper.classList.add('last-row-hover')
                else wrapper.classList.remove('last-row-hover')
              }
              return false
            },
            touchmove: (view, event) => {
              const target = (event as TouchEvent).target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const rowIndex = (cell.parentElement as HTMLTableRowElement).rowIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-row')
              grips.forEach((g, idx) => {
                if (idx === rowIndex) g.classList.add('show-row-grip')
                else g.classList.remove('show-row-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows.length ? table.rows.length - 1 : -1
                if (rowIndex === lastIndex) wrapper.classList.add('last-row-hover')
                else wrapper.classList.remove('last-row-hover')
              }
              return false
            },
          },
        },
      }),
    ]
  },
})

export default TableCell
