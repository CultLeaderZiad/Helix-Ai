export default function AdminLoading() {
  return (
    <div className="flex min-h-dvh w-full bg-helix-canvas text-helix-ink">
      <aside className="hidden h-dvh w-[232px] shrink-0 bg-helix-sidebar lg:block" />
      <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-[12px] bg-helix-surface" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[88px] animate-pulse rounded-[16px] border border-helix-border bg-helix-surface" />
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-[16px] border border-helix-border bg-helix-surface">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-14 animate-pulse border-b border-helix-border last:border-0" />
          ))}
        </div>
      </div>
    </div>
  )
}
