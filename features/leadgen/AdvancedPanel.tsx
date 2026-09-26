'use client'

import React from 'react'

interface AdvancedPanelProps {
  engine: string
  onChangeEngine: (val: string) => void
  pagesPerSite: number
  onChangePagesPerSite: (val: number) => void
  robotsObey: boolean
  onChangeRobotsObey: (val: boolean) => void
  isArabic?: boolean
}

export function AdvancedPanel({
  engine,
  onChangeEngine,
  pagesPerSite,
  onChangePagesPerSite,
  robotsObey,
  onChangeRobotsObey,
  isArabic
}: AdvancedPanelProps) {
  return (
    <details className="group border border-border rounded-md p-3 text-sm text-foreground bg-muted/20">
      <summary className="cursor-pointer font-medium select-none list-none flex items-center justify-between">
        <span>{isArabic ? 'إعدادات متقدمة' : 'Advanced settings'}</span>
        <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
      </summary>

      <div className="pt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {isArabic ? 'طريقة فتح الصفحات' : 'How pages are opened'}
            </label>
            <select
              value={engine}
              onChange={(e) => onChangeEngine(e.target.value)}
              className="fld"
            >
              <option value="auto">{isArabic ? 'تلقائي' : 'Automatic'}</option>
              <option value="http">{isArabic ? 'صفحة بسيطة' : 'Simple page'}</option>
              <option value="dynamic">{isArabic ? 'صفحة تحتاج متصفحاً' : 'Page that needs a browser'}</option>
              <option value="stealth">{isArabic ? 'صفحة صعبة الفتح' : 'Hard-to-open page'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {isArabic ? 'الصفحات لكل موقع' : 'Pages per site'}
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={pagesPerSite}
              onChange={(e) => onChangePagesPerSite(Number(e.target.value))}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <input
            type="checkbox"
            id="robots-obey-opt"
            checked={robotsObey}
            onChange={(e) => onChangeRobotsObey(e.target.checked)}
            className="rounded border-input text-foreground focus:ring-ring"
          />
          <label htmlFor="robots-obey-opt" className="text-xs text-foreground">
            {isArabic ? 'احترام robots.txt للمواقع' : 'Respect robots.txt on targets'}
          </label>
        </div>
      </div>
    </details>
  )
}
