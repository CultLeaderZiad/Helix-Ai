'use client'

import React, { useState } from 'react'

interface CrmUpsertButtonProps {
  onUpsert: () => Promise<void>
  disabled?: boolean
  status?: string | null
  isArabic?: boolean
}

export function CrmUpsertButton({
  onUpsert,
  disabled = false,
  status,
  isArabic = false,
}: CrmUpsertButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onUpsert()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleClick}
        className="rounded-md bg-[#0e8da6] dark:bg-[#38c6e0] px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#06141a] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading
          ? isArabic ? 'جارٍ النقل إلى CRM...' : 'Pushing to CRM...'
          : isArabic ? 'نقل إلى CRM (Contact & Company)' : 'Push to CRM (Contact & Company)'}
      </button>

      {status && (
        <span className="text-[11px] font-mono text-[#5b6577] dark:text-[#8b95a7]">
          {status}
        </span>
      )}
    </div>
  )
}
