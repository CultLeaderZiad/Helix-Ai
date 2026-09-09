export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-pulse p-4 sm:p-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <div className="h-8 w-48 rounded-lg bg-panel" />
        <div className="h-4 w-72 rounded bg-raised" />
      </div>

      {/* KPI Cards Row */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-panel p-5">
            <div className="h-3 w-24 rounded bg-raised" />
            <div className="mt-4 h-7 w-32 rounded bg-raised" />
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="h-96 rounded-xl border border-border bg-panel p-6 lg:col-span-2">
          <div className="h-5 w-40 rounded bg-raised" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full rounded bg-raised/60" />
            ))}
          </div>
        </div>

        <div className="h-96 rounded-xl border border-border bg-panel p-6">
          <div className="h-5 w-32 rounded bg-raised" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-raised/60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
