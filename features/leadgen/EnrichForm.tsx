'use client'

import React from 'react'

interface EnrichFormProps {
  urlsText: string
  onChangeUrlsText: (val: string) => void
  hunterEnabled: boolean
  onChangeHunterEnabled: (val: boolean) => void
  hunterAvailable: boolean
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  isArabic?: boolean
}

export function EnrichForm({
  urlsText,
  onChangeUrlsText,
  hunterEnabled,
  onChangeHunterEnabled,
  hunterAvailable,
  onSubmit,
  isSubmitting,
  isArabic
}: EnrichFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {isArabic ? 'الصق المواقع، موقع واحد في كل سطر (بحد أقصى 25)' : 'Paste websites, one per line (max 25)'}
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          {isArabic ? 'نفحص الصفحة الرئيسية وصفحات التواصل ومن نحن المرتبطة بها.' : 'We check the homepage plus contact and about pages linked from it.'}
        </p>
        <textarea
          rows={5}
          value={urlsText}
          onChange={(e) => onChangeUrlsText(e.target.value)}
          placeholder={isArabic ? 'acme-roofing.sa\nexample-company.ae' : 'acme-roofing.sa\nexample-company.ae'}
          dir="ltr"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
        />
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <input
          type="checkbox"
          id="hunter-enrich-opt"
          checked={hunterEnabled}
          disabled={!hunterAvailable}
          onChange={(e) => onChangeHunterEnabled(e.target.checked)}
          className="rounded border-input text-foreground focus:ring-ring"
        />
        <label htmlFor="hunter-enrich-opt" className="text-sm text-foreground">
          {isArabic
            ? 'البحث عن بريد صناع القرار عبر Hunter (يستهلك أرصدة)'
            : 'Find decision-maker emails with Hunter (uses credits)'}
          {!hunterAvailable && (
            <span className="text-xs text-muted-foreground ms-2">
              ({isArabic ? 'غير متاح: أضف HUNTER_API_KEY' : 'unavailable: set HUNTER_API_KEY'})
            </span>
          )}
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !urlsText.trim()}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting
            ? (isArabic ? 'جاري المعالجة...' : 'Processing...')
            : (isArabic ? 'إثراء' : 'Enrich')}
        </button>
      </div>
    </form>
  )
}
