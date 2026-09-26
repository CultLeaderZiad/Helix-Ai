'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

export function QaAccordion({
  items,
  idPrefix = 'qa',
  defaultOpen = 0,
}: {
  items: { q: string; a: string }[]
  idPrefix?: string
  defaultOpen?: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1
    let next = -1
    if (event.key === 'ArrowDown') next = Math.min(last, index + 1)
    else if (event.key === 'ArrowUp') next = Math.max(0, index - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next >= 0 && next !== index) {
      event.preventDefault()
      buttons.current[next]?.focus()
    }
  }

  return (
    <div>
      {items.map((item, index) => {
        const expanded = open === index
        const buttonId = `${idPrefix}-q-${index}`
        const panelId = `${idPrefix}-a-${index}`
        return (
          <div className="qa" key={item.q}>
            <button
              ref={node => {
                buttons.current[index] = node
              }}
              id={buttonId}
              type="button"
              className="q"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen(expanded ? -1 : index)}
              onKeyDown={event => onKey(event, index)}
            >
              <span>{item.q}</span>
              <span className="ico" aria-hidden="true">{expanded ? '−' : '+'}</span>
            </button>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded}>
              {expanded ? <div className="a">{item.a}</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
