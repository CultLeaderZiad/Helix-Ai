export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse p-4 sm:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-56 rounded-lg bg-panel" />
          <div className="mt-2 h-4 w-80 rounded bg-raised" />
        </div>
        <div className="h-10 w-36 rounded-md bg-panel" />
      </div>

      {/* Roster Table Skeleton */}
      <div className="mt-8 rounded-xl border border-border bg-panel p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="h-9 w-64 rounded-md bg-raised" />
          <div className="h-9 w-28 rounded-md bg-raised" />
        </div>

        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex h-14 items-center justify-between rounded-lg bg-raised/40 px-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-raised" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 rounded bg-raised" />
                  <div className="h-2.5 w-24 rounded bg-raised/60" />
                </div>
              </div>
              <div className="h-6 w-20 rounded bg-raised" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
