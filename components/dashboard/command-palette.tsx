'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Globe, History, Plus, Radar, Search } from 'lucide-react'

export interface PaletteCommand {
  group: string
  label: string
  href: string
  hint?: string
  badge?: string
  icon: 'search' | 'radar' | 'plus' | 'globe' | 'download' | 'history'
}

const ICONS = {
  search: Search,
  radar: Radar,
  plus: Plus,
  globe: Globe,
  download: Download,
  history: History,
}

export const DASHBOARD_COMMANDS: PaletteCommand[] = [
  { group: 'Pages', label: 'Overview', href: '/dashboard', hint: 'G O', icon: 'radar' },
  { group: 'Pages', label: 'Lead Generation', href: '/dashboard/lead-generation', hint: 'G L', icon: 'radar' },
  { group: 'Pages', label: 'Search', href: '/dashboard/search', hint: 'G S', icon: 'search' },
  { group: 'Pages', label: 'Contacts', href: '/dashboard/contacts', hint: 'G C', icon: 'search' },
  { group: 'Pages', label: 'CRM', href: '/dashboard/crm', hint: 'G R', icon: 'search' },
  { group: 'Pages', label: 'Studio', href: '/dashboard/studio', hint: 'G T', icon: 'search' },
  { group: 'Pages', label: 'Attention queue', href: '/dashboard/queue', icon: 'search' },
  { group: 'Pages', label: 'Integrations', href: '/dashboard/integrations', icon: 'globe' },
  { group: 'Pages', label: 'Reports', href: '/dashboard/reports', icon: 'download' },
  { group: 'Pages', label: 'Billing', href: '/dashboard/billing', icon: 'search' },
  { group: 'Pages', label: 'Support', href: '/dashboard/support', icon: 'search' },
  { group: 'Pages', label: 'Settings', href: '/settings', icon: 'search' },
  { group: 'Actions', label: 'New “Find leads” job', href: '/dashboard/lead-generation', icon: 'plus' },
  { group: 'Actions', label: 'Enrich a website…', href: '/dashboard/lead-generation', icon: 'globe' },
  { group: 'Actions', label: 'Export last job (.xlsx)', href: '/dashboard/lead-generation', icon: 'download' },
]

export function CommandPalette({
  open,
  onClose,
  commands = DASHBOARD_COMMANDS,
  initialQuery = '',
}: {
  open: boolean
  onClose: () => void
  commands?: PaletteCommand[]
  initialQuery?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
      setActive(0)
    }
  }, [open, initialQuery])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(command => command.label.toLowerCase().includes(q) || command.group.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive(index => Math.min(index + 1, Math.max(filtered.length - 1, 0)))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive(index => Math.max(index - 1, 0))
      }
      if (event.key === 'Enter' && filtered[active]) {
        event.preventDefault()
        router.push(filtered[active].href)
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, active, onClose, router])

  if (!open) return null

  const groups = [...new Set(filtered.map(command => command.group))]

  return (
    <div className="palette-back" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="row" style={{ gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
          <Search size={18} style={{ color: 'var(--subtle)' }} />
          <input
            autoFocus
            value={query}
            onChange={event => {
              setQuery(event.target.value)
              setActive(0)
            }}
            placeholder="Search or jump to…"
            aria-label="Search commands"
            style={{ flex: 1, border: 0, outline: 'none', fontSize: 16, background: 'transparent', color: 'var(--ink)' }}
          />
          <span className="kbd">esc</span>
        </div>
        <div style={{ padding: 8, maxHeight: 420, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--muted)', fontSize: 13.5 }}>No matching commands.</div>
          ) : (
            groups.map(group => (
              <div key={group}>
                <div className="label" style={{ padding: '8px 10px' }}>{group}</div>
                {filtered.map((command, index) => {
                  if (command.group !== group) return null
                  const Icon = ICONS[command.icon]
                  const on = index === active
                  return (
                    <button
                      key={command.label}
                      type="button"
                      className="row"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => {
                        router.push(command.href)
                        onClose()
                      }}
                      style={{
                        gap: 10,
                        padding: 10,
                        borderRadius: 10,
                        width: '100%',
                        textAlign: 'start',
                        background: on ? '#F1F8F4' : 'transparent',
                      }}
                    >
                      <Icon size={14} style={{ color: on ? 'var(--accent)' : 'var(--muted)' }} />
                      <span>
                        {highlight(command.label, query)}
                      </span>
                      <span className="grow" />
                      {command.badge ? <span className="chip info">{command.badge}</span> : null}
                      {command.hint ? <span className="kbd">{command.hint}</span> : null}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="row" style={{ gap: 14, padding: '10px 16px', borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--subtle)', background: 'var(--surface2)' }}>
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> open</span>
          <span className="grow" />
          <span>cmdk · shadcn Command</span>
        </div>
      </div>
    </div>
  )
}

function highlight(label: string, query: string) {
  const q = query.trim()
  if (!q) return label
  const index = label.toLowerCase().indexOf(q.toLowerCase())
  if (index < 0) return label
  return (
    <>
      {label.slice(0, index)}
      <b>{label.slice(index, index + q.length)}</b>
      {label.slice(index + q.length)}
    </>
  )
}
