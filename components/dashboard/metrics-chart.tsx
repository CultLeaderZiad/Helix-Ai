'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useState } from 'react'

export function MetricsChart() {
  const [metrics, setMetrics] = useState<any[]>([])

  useReportWebVitals((metric) => {
    console.log('[Web Vitals]', metric.name, metric.value)
    // Avoid re-rendering too often, just keeping the latest 5 metrics in state for visualization if needed
    setMetrics(prev => {
      const updated = [...prev, metric].slice(-5)
      return updated
    })
  })

  if (metrics.length === 0) return null

  return (
    <div className="p-4 border border-helix-border bg-helix-surface rounded-lg">
      <h3 className="text-14 font-semibold text-ink mb-2">Performance Metrics</h3>
      <div className="flex flex-col gap-1 text-12 text-helix-muted">
        {metrics.map((m, i) => (
          <div key={i} className="flex justify-between">
            <span>{m.name}</span>
            <span>{Math.round(m.value)}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}
