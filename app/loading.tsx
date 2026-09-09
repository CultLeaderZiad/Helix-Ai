import { HelixMark } from '@/components/brand/helix-mark'

export default function RootLoading() {
  return (
    <div
      aria-label="Loading Helix AI"
      className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground"
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative flex size-12 items-center justify-center rounded-2xl border border-border bg-panel shadow-lg">
          <HelixMark size={28} className="animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 animate-ping rounded-full bg-accent" />
          <span className="font-mono text-xs text-muted-foreground">Loading workspace...</span>
        </div>
      </div>
    </div>
  )
}
