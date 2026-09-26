import type { ReactNode } from 'react'

export function AdminFrame({ children }: { children: ReactNode }) {
  return <div className="hx-admin">{children}</div>
}

export function PageHead({
  kicker,
  kickerAr,
  title,
  titleAr,
  lede,
  ledeAr,
  actions,
}: {
  kicker?: string
  kickerAr?: string
  title: string
  titleAr?: string
  lede?: string
  ledeAr?: string
  actions?: ReactNode
}) {
  return (
    <header className="hx-admin-head">
      <div>
        {kicker ? <p className="hx-admin-kicker">{kicker}</p> : null}
        {kickerAr ? (
          <p className="hx-admin-ar" lang="ar" dir="rtl">
            {kickerAr}
          </p>
        ) : null}
        <h1>{title}</h1>
        {titleAr ? (
          <p className="hx-admin-ar" lang="ar" dir="rtl">
            {titleAr}
          </p>
        ) : null}
        {lede ? <p className="hx-admin-lede">{lede}</p> : null}
        {ledeAr ? (
          <p className="hx-admin-ar" lang="ar" dir="rtl">
            {ledeAr}
          </p>
        ) : null}
      </div>
      {actions ? <div className="hx-admin-actions">{actions}</div> : null}
    </header>
  )
}

export function Panel({
  title,
  titleAr,
  actions,
  children,
}: {
  title?: string
  titleAr?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="hx-admin-panel">
      {title || actions ? (
        <div className="hx-admin-panel-head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {titleAr ? (
              <p className="hx-admin-ar" lang="ar" dir="rtl">
                {titleAr}
              </p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Stat({
  label,
  labelAr,
  value,
  hint,
  hintAr,
}: {
  label: string
  labelAr?: string
  value: ReactNode
  hint?: string
  hintAr?: string
}) {
  return (
    <div className="hx-admin-stat">
      <span>{label}</span>
      {labelAr ? (
        <p className="hx-admin-ar" lang="ar" dir="rtl">
          {labelAr}
        </p>
      ) : null}
      <b>{value}</b>
      {hint ? <small>{hint}</small> : null}
      {hintAr ? (
        <p className="hx-admin-ar" lang="ar" dir="rtl">
          {hintAr}
        </p>
      ) : null}
    </div>
  )
}

export function DataTable({
  columns,
  children,
}: {
  columns: Array<{ key: string; label: string; align?: 'start' | 'end' }>
  children: ReactNode
}) {
  return (
    <div className="hx-admin-table-wrap">
      <table className="hx-admin-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} scope="col" style={{ textAlign: column.align ?? 'start' }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function EmptyState({
  title,
  titleAr,
  body,
  bodyAr,
}: {
  title: string
  titleAr?: string
  body?: string
  bodyAr?: string
}) {
  return (
    <div className="hx-admin-empty">
      <h2>{title}</h2>
      {titleAr ? (
        <p className="hx-admin-ar" lang="ar" dir="rtl">
          {titleAr}
        </p>
      ) : null}
      {body ? <p>{body}</p> : null}
      {bodyAr ? (
        <p className="hx-admin-ar" lang="ar" dir="rtl">
          {bodyAr}
        </p>
      ) : null}
    </div>
  )
}
