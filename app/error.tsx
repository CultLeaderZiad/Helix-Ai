'use client'

export default function PageError({ error, retry }: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 text-foreground">
      <section role="alert" className="w-full max-w-md rounded-xl border bg-panel p-8">
        <h1 className="font-display text-2xl font-bold">This page couldn’t load</h1>
        <p className="mt-3 text-muted-foreground">Check your connection and try again. If this continues, contact support.</p>
        {error.digest && <p className="mt-3 text-xs text-muted-foreground">Reference: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap gap-4">
          <button type="button" onClick={retry} className="min-h-11 rounded-md bg-primary px-5 py-2 text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4">Try again</button>
          <a href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">Go home</a>
        </div>
      </section>
    </main>
  )
}
