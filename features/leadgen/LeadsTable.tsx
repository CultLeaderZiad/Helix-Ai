'use client'

import React, { useState, useMemo } from 'react'
import type { LeadGenLead } from '@/lib/schema'

interface LeadsTableProps {
  leads: LeadGenLead[]
  selectedLeadId?: string | null
  onSelectLead: (lead: LeadGenLead) => void
  isArabic?: boolean
}

export function LeadsTable({ leads, selectedLeadId, onSelectLead, isArabic = false }: LeadsTableProps) {
  const [filterQuery, setFilterQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchQuery =
        !filterQuery ||
        (l.company_name?.toLowerCase().includes(filterQuery.toLowerCase()) ?? false) ||
        (l.domain?.toLowerCase().includes(filterQuery.toLowerCase()) ?? false) ||
        l.emails.some(e => e.toLowerCase().includes(filterQuery.toLowerCase()))

      const matchPriority = filterPriority === 'all' || l.priority === filterPriority
      return matchQuery && matchPriority
    })
  }, [leads, filterQuery, filterPriority])

  return (
    <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9dee6] dark:border-white/10 p-3 bg-[#eaeef3]/30 dark:bg-[#171c25]/30">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder={isArabic ? 'بحث بالشركة أو النطاق أو البريد...' : 'Filter by company, domain, or email...'}
            className="w-56 sm:w-72 rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1 text-xs text-[#0f141b] dark:text-[#e8ecf2] placeholder-[#8b95a7] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2 py-1 text-xs font-medium text-[#0f141b] dark:text-[#e8ecf2]"
          >
            <option value="all">{isArabic ? 'كل الأولويات' : 'All Priorities'}</option>
            <option value="high">{isArabic ? 'أولوية عالية' : 'High Priority'}</option>
            <option value="med">{isArabic ? 'أولوية متوسطة' : 'Medium Priority'}</option>
            <option value="low">{isArabic ? 'أولوية منخفضة' : 'Low Priority'}</option>
          </select>
        </div>

        <div className="text-xs font-mono text-[#5b6577] dark:text-[#8b95a7]">
          {filtered.length} / {leads.length} {isArabic ? 'جهات اتصال' : 'leads'}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#d9dee6] dark:border-white/10 bg-[#eaeef3]/60 dark:bg-[#171c25]/60 text-[11px] font-medium uppercase tracking-wider text-[#5b6577] dark:text-[#8b95a7]">
              <th className="px-3 py-2.5">{isArabic ? 'الشركة / النطاق' : 'Company / Domain'}</th>
              <th className="px-3 py-2.5">{isArabic ? 'البريد الإلكتروني' : 'Verified Email'}</th>
              <th className="px-3 py-2.5">{isArabic ? 'مصدر البريد' : 'Email Source'}</th>
              <th className="px-3 py-2.5">{isArabic ? 'الهاتف' : 'Phone'}</th>
              <th className="px-3 py-2.5 text-right">{isArabic ? 'الدرجة' : 'Score'}</th>
              <th className="px-3 py-2.5">{isArabic ? 'الأولوية' : 'Priority'}</th>
              <th className="px-3 py-2.5">{isArabic ? 'CRM' : 'CRM Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d9dee6]/60 dark:divide-white/5">
            {filtered.length > 0 ? (
              filtered.map(lead => {
                const isSelected = lead.id === selectedLeadId
                const priorityColor =
                  lead.priority === 'high'
                    ? 'text-[#1f8a3b] dark:text-[#3fb950] bg-[#1f8a3b]/10 dark:bg-[#3fb950]/15'
                    : lead.priority === 'med'
                    ? 'text-[#a86a00] dark:text-[#d29922] bg-[#a86a00]/10 dark:bg-[#d29922]/15'
                    : 'text-[#5b6577] dark:text-[#8b95a7] bg-[#eaeef3] dark:bg-[#171c25]'

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0e8da6]/10 dark:bg-[#38c6e0]/15'
                        : 'hover:bg-[#eaeef3]/40 dark:hover:bg-[#171c25]/40'
                    }`}
                  >
                    {/* Company */}
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
                        {lead.company_name || lead.domain || 'Unnamed Lead'}
                      </div>
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="font-mono text-[11px] text-[#0e8da6] dark:text-[#38c6e0] hover:underline"
                        >
                          {lead.domain || lead.website}
                        </a>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-3 py-2.5 font-mono text-[11px]">
                      {lead.emails && lead.emails.length > 0 ? (
                        <div className="text-[#0f141b] dark:text-[#e8ecf2]">
                          {lead.emails[0]}
                          {lead.emails.length > 1 && (
                            <span className="ml-1 text-[10px] text-[#5b6577] dark:text-[#8b95a7]">
                              +{lead.emails.length - 1}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#8b95a7] italic">none</span>
                      )}
                    </td>

                    {/* Email Source */}
                    <td className="px-3 py-2.5">
                      <span className="inline-block rounded bg-[#eaeef3] dark:bg-[#171c25] px-1.5 py-0.5 font-mono text-[10px] text-[#5b6577] dark:text-[#8b95a7]">
                        {lead.email_source}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
                      {lead.phones && lead.phones.length > 0 ? lead.phones[0] : '—'}
                    </td>

                    {/* Score */}
                    <td className="px-3 py-2.5 text-right font-mono font-semibold tabular-nums text-[#0f141b] dark:text-[#e8ecf2]">
                      {lead.lead_score}
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2.5">
                      <span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${priorityColor}`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* CRM Link Status */}
                    <td className="px-3 py-2.5 font-mono text-[11px]">
                      {lead.crm_contact_id || lead.crm_company_id ? (
                        <span className="text-[#1f8a3b] dark:text-[#3fb950] font-medium">pushed</span>
                      ) : (
                        <span className="text-[#5b6577] dark:text-[#8b95a7]">unlinked</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[#5b6577] dark:text-[#8b95a7] italic">
                  {isArabic ? 'لا توجد جهات مطابقة للبحث' : 'No matching leads found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
