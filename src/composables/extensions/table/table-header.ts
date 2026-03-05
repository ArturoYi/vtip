import { TableHeader as TiptapTableHeader } from '@tiptap/extension-table'
import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import {
  getCellsInRow,
  getColIndexFromX,
  isColumnSelected,
  selectColumn,
  TABLE_EDGE_ZONE,
  TABLE_GUTTER,
} from './utils'
import { tableStrings } from './strings'

export const TableHeader = TiptapTableHeader.extend({
  addAttributes() {
    return {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute('colwidth')
          return colwidth
            ? colwidth.split(',').map((item) => Number.parseInt(item, 10))
            : null
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
            const cells = getCellsInRow(0)(selection)
            if (cells) {
              cells.forEach(({ pos }: { pos: number }, index: number) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const colSelected = isColumnSelected(index)(selection)
                    let className = 'grip-column'
                    if (colSelected) className += ' selected'
                    if (index === 0) className += ' first'
                    if (index === cells.length - 1) className += ' last'
                    const grip = document.createElement('a')
                    grip.className = className
                    grip.setAttribute('role', 'button')
                    grip.setAttribute('aria-label', s.selectColumn)
                    grip.setAttribute('tabindex', '0')
                    grip.dataset.colIndex = String(index)
                    grip.addEventListener('mousedown', (event) => {
                      event.preventDefault()
                      event.stopImmediatePropagation()
                      this.editor.view.dispatch(
                        selectColumn(index)(this.editor.state.tr)
                      )
                    })
                    return grip
                  })
                )
              })
              const lastHeaderCell = cells[cells.length - 1]
              decorations.push(
                Decoration.widget(lastHeaderCell.pos + 1, () => {
                  const btn = document.createElement('button')
                  btn.className = 'add-column-btn'
                  btn.type = 'button'
                  btn.setAttribute('aria-label', s.addColumn)
                  btn.setAttribute('title', s.addColumnAfter)
                  btn.textContent = '+'
                  btn.addEventListener('mousedown', (event) => {
                    event.preventDefault()
                    event.stopImmediatePropagation()
                    this.editor.view.dispatch(
                      selectColumn(cells.length - 1)(this.editor.state.tr)
                    )
                    this.editor.chain().focus().addColumnAfter().run()
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
                const inColZone =
                  ev.clientY >= rect.top - TABLE_GUTTER &&
                  ev.clientY < rect.top + TABLE_EDGE_ZONE &&
                  ev.clientX >= rect.left &&
                  ev.clientX <= rect.right
                if (inColZone) {
                  const colIndex = getColIndexFromX(table as HTMLTableElement, ev.clientX)
                  const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
                  grips.forEach((g, idx) => {
                    if (idx === colIndex) g.classList.add('show-col-grip')
                    else g.classList.remove('show-col-grip')
                  })
                  const lastIndex = table.rows[0]?.cells.length
                    ? table.rows[0].cells.length - 1
                    : -1
                  if (colIndex === lastIndex) wrapper.classList.add('last-column-hover')
                  else wrapper.classList.remove('last-column-hover')
                  return false
                }
              }
              const cell = target.closest('td, th')
              const tableInCell = target.closest('table')
              if (!cell || !tableInCell) return false
              const colIndex = (cell as HTMLTableCellElement).cellIndex
              const grips = tableInCell.querySelectorAll<HTMLAnchorElement>('a.grip-column')
              grips.forEach((g, idx) => {
                if (idx === colIndex) g.classList.add('show-col-grip')
                else g.classList.remove('show-col-grip')
              })
              const wrapperCell = tableInCell.closest('.tableWrapper')
              if (wrapperCell) {
                const lastIndex = tableInCell.rows[0]?.cells.length
                  ? tableInCell.rows[0].cells.length - 1
                  : -1
                if (colIndex === lastIndex) wrapperCell.classList.add('last-column-hover')
                else wrapperCell.classList.remove('last-column-hover')
              }
              return false
            },
            focusin: (view, event) => {
              const target = event.target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const colIndex = (cell as HTMLTableCellElement).cellIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
              grips.forEach((g, idx) => {
                if (idx === colIndex) g.classList.add('show-col-grip')
                else g.classList.remove('show-col-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows[0]?.cells.length ? table.rows[0].cells.length - 1 : -1
                if (colIndex === lastIndex) wrapper.classList.add('last-column-hover')
                else wrapper.classList.remove('last-column-hover')
              }
              return false
            },
            mousedown: (view, event) => {
              const target = event.target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const colIndex = (cell as HTMLTableCellElement).cellIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
              grips.forEach((g, idx) => {
                if (idx === colIndex) g.classList.add('show-col-grip')
                else g.classList.remove('show-col-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows[0]?.cells.length ? table.rows[0].cells.length - 1 : -1
                if (colIndex === lastIndex) wrapper.classList.add('last-column-hover')
                else wrapper.classList.remove('last-column-hover')
              }
              return false
            },
            mouseleave: (view, event) => {
              const target = event.target as HTMLElement
              const table = target.closest('table')
              const wrapper = target.closest('.tableWrapper')
              const t = table || wrapper?.querySelector('table')
              if (t) {
                const grips = t.querySelectorAll<HTMLAnchorElement>('a.grip-column')
                grips.forEach((g) => g.classList.remove('show-col-grip'))
              }
              if (wrapper) wrapper.classList.remove('last-column-hover')
              return false
            },
            mouseout: (view, event) => {
              const target = event.target as HTMLElement
              const to = (event as MouseEvent).relatedTarget as HTMLElement | null
              const wrapper = target.closest('.tableWrapper')
              if (wrapper && to && !to.closest('.tableWrapper')) {
                const table = wrapper.querySelector('table')
                if (table) {
                  const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
                  grips.forEach((g) => g.classList.remove('show-col-grip'))
                }
                wrapper.classList.remove('last-column-hover')
              }
              const table = target.closest('table')
              if (!table) return false
              if (!to?.closest('table') || to.closest('table') !== table) {
                const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
                grips.forEach((g) => g.classList.remove('show-col-grip'))
                const wr = table.closest('.tableWrapper')
                if (wr) wr.classList.remove('last-column-hover')
              }
              return false
            },
            touchstart: (view, event) => {
              const target = (event as TouchEvent).target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const colIndex = (cell as HTMLTableCellElement).cellIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
              grips.forEach((g, idx) => {
                if (idx === colIndex) g.classList.add('show-col-grip')
                else g.classList.remove('show-col-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows[0]?.cells.length ? table.rows[0].cells.length - 1 : -1
                if (colIndex === lastIndex) wrapper.classList.add('last-column-hover')
                else wrapper.classList.remove('last-column-hover')
              }
              return false
            },
            touchmove: (view, event) => {
              const target = (event as TouchEvent).target as HTMLElement
              const cell = target.closest('td, th')
              const table = target.closest('table')
              if (!cell || !table) return false
              const colIndex = (cell as HTMLTableCellElement).cellIndex
              const grips = table.querySelectorAll<HTMLAnchorElement>('a.grip-column')
              grips.forEach((g, idx) => {
                if (idx === colIndex) g.classList.add('show-col-grip')
                else g.classList.remove('show-col-grip')
              })
              const wrapper = table.closest('.tableWrapper')
              if (wrapper) {
                const lastIndex = table.rows[0]?.cells.length ? table.rows[0].cells.length - 1 : -1
                if (colIndex === lastIndex) wrapper.classList.add('last-column-hover')
                else wrapper.classList.remove('last-column-hover')
              }
              return false
            },
          },
        },
      }),
    ]
  },
})

export default TableHeader
