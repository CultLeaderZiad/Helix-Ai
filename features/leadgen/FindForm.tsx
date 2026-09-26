'use client'

import React from 'react'

interface FindFormProps {
  query: string
  onChangeQuery: (val: string) => void
  limit: number
  onChangeLimit: (val: number) => void
  hunterEnabled: boolean
  onChangeHunterEnabled: (val: boolean) => void
  hunterAvailable: boolean
  googleAvailable: boolean
  osmAvailable: boolean
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  isArabic?: boolean
}

export function FindForm({
  query,
  onChangeQuery,
  limit,
  onChangeLimit,
  hunterEnabled,
  onChangeHunterEnabled,
  hunterAvailable,
  googleAvailable,
  osmAvailable,
  onSubmit,
  isSubmitting,
  isArabic
}: FindFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {isArabic ? 'عن ماذا تبحث؟' : 'What are you looking for?'}
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder={isArabic ? 'مثال: شركات مقاولات في جدة' : 'e.g. roofing contractors in Jeddah'}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {isArabic
            ? 'أمثلة: عيادات أسنان دبي مع واتساب · مدربين لياقة في القاهرة'
            : 'Examples: dental clinics Dubai with WhatsApp · fitness coaches in Cairo'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>{isArabic ? 'المصادر:' : 'Sources:'}</span>
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${googleAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          {isArabic ? 'خرائط Google' : 'Google Maps'} {!googleAvailable && <span>{isArabic ? '(غير متاح)' : '(not available)'}</span>}
        </span>
        <span className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${osmAvailable ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          OpenStreetMap
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            {isArabic ? 'العدد:' : 'How many:'}
          </label>
          <select
            value={limit}
            onChange={(e) => onChangeLimit(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <input
            type="checkbox"
            id="hunter-find-opt"
            checked={hunterEnabled}
            disabled={!hunterAvailable}
            onChange={(e) => onChangeHunterEnabled(e.target.checked)}
            className="rounded border-input text-foreground focus:ring-ring"
          />
          <label htmlFor="hunter-find-opt" className="text-sm text-foreground">
            {isArabic ? 'البحث عن البريد (يستهلك رصيداً)' : 'Find emails (uses credits)'}
          </label>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !query.trim()}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting
            ? (isArabic ? 'جاري البحث...' : 'Searching...')
            : (isArabic ? 'البحث عن عملاء' : 'Find leads')}
        </button>
      </div>
    </form>
  )
}
