'use client'

import type { ReactNode } from 'react'

export function PageHead({
  title,
  lede,
  actions,
}: {
  title: string
  lede?: string
  actions?: ReactNode
}) {
  return (
    <div className="ph">
      <div>
        <h1>{title}</h1>
        {lede ? <p>{lede}</p> : null}
      </div>
      {actions ? <div className="ph-actions">{actions}</div> : null}
    </div>
  )
}

export function Panel({
  title,
  extra,
  children,
  className,
}: {
  title?: ReactNode
  extra?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`pnl${className ? ` ${className}` : ''}`}>
      {title || extra ? (
        <div className="pnl-h">
          {title ? <b>{title}</b> : <span />}
          {extra}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function KpiCard({
  label,
  value,
  small,
  hint,
  delta,
}: {
  label: string
  value: string
  small?: string
  hint?: string
  delta?: string | null
}) {
  const down = delta?.startsWith('-')
  return (
    <article className="kpi">
      <div className="kpi-l">{label}</div>
      <div className="kpi-v">
        <b className="num">
          {value}
          {small ? <small>{small}</small> : null}
        </b>
      </div>
      {hint || delta ? (
        <div className="foot">
          {delta ? <span className={down ? 'delta down' : 'delta'}>{delta}</span> : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      ) : null}
    </article>
  )
}

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  empty,
  rowKey,
}: {
  columns: Array<TableColumn<T>>
  rows: T[]
  empty?: ReactNode
  rowKey: (row: T, index: number) => string
}) {
  if (rows.length === 0) {
    return <>{empty}</>
  }
  return (
    <div className="table-wrap">
      <table className="dtable">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {columns.map(column => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StatusChip({
  tone = 'neutral',
  children,
}: {
  tone?: 'ok' | 'warn' | 'neutral' | 'bad'
  children: ReactNode
}) {
  return <span className={`chip chip-${tone}`}>{children}</span>
}

export function Tabs({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: Array<{ id: string; label: string }>
  value: string
  onChange: (id: string) => void
  label: string
}) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={value === tab.id ? 'on' : undefined}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string | null
  children: ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {body ? <p>{body}</p> : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skel${className ? ` ${className}` : ''}`} aria-hidden />
}

export function InlineError({
  children,
  retryLabel,
  onRetry,
}: {
  children: ReactNode
  retryLabel?: string
  onRetry?: () => void
}) {
  return (
    <div className="ierr" role="alert">
      <p>{children}</p>
      {onRetry && retryLabel ? (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}
