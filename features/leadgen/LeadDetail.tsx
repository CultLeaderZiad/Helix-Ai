'use client'

import React, { useState } from 'react'
import type { LeadGenLead } from '@/lib/schema'

interface LeadDetailProps {
  lead: LeadGenLead
  onClose: () => void
  isArabic?: boolean
}

type TabType = 'company' | 'contacts' | 'score' | 'outreach' | 'markdown' | 'crm'

export function LeadDetail({ lead, onClose, isArabic = false }: LeadDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('company')

  const outreach = lead.outreach as {
    subject?: string
    body?: string
    dm?: string
    personalization_points?: string[]
    skipped_reason?: string
  } | null

  return (
    <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#d9dee6] dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
              {lead.company_name || lead.domain || 'Lead Detail'}
            </h3>
            <span
              className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${
                lead.priority === 'high'
                  ? 'bg-[#1f8a3b]/10 dark:bg-[#3fb950]/15 text-[#1f8a3b] dark:text-[#3fb950]'
                  : lead.priority === 'med'
                  ? 'bg-[#a86a00]/10 dark:bg-[#d29922]/15 text-[#a86a00] dark:text-[#d29922]'
                  : 'bg-[#eaeef3] dark:bg-[#171c25] text-[#5b6577] dark:text-[#8b95a7]'
              }`}
            >
              {lead.priority} priority · score {lead.lead_score}
            </span>
          </div>

          {lead.website && (
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block font-mono text-xs text-[#0e8da6] dark:text-[#38c6e0] hover:underline"
            >
              {lead.website}
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-[#5b6577] dark:text-[#8b95a7] hover:bg-[#eaeef3] dark:hover:bg-[#171c25] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d9dee6] dark:border-white/10 gap-2">
        {[
          { key: 'company' as TabType, label: 'Company', labelAr: 'الشركة' },
          { key: 'contacts' as TabType, label: 'Contacts', labelAr: 'جهات الاتصال' },
          { key: 'score' as TabType, label: 'Score Formula', labelAr: 'معايير التقييم' },
          { key: 'outreach' as TabType, label: 'Outreach Draft', labelAr: 'مسودة المراسلة' },
          { key: 'markdown' as TabType, label: 'Page Markdown', labelAr: 'مستخرج الصفحة' },
          { key: 'crm' as TabType, label: 'CRM Sync', labelAr: 'الربط مع CRM' },
        ].map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === t.key
                ? 'border-[#0e8da6] dark:border-[#38c6e0] text-[#0e8da6] dark:text-[#38c6e0]'
                : 'border-transparent text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
            }`}
          >
            {isArabic ? t.labelAr : t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'company' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[#5b6577] dark:text-[#8b95a7] font-medium">{isArabic ? 'اسم المنشأة:' : 'Company Name:'}</span>
              <div className="mt-0.5 font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{lead.company_name || '—'}</div>
            </div>
            <div>
              <span className="text-[#5b6577] dark:text-[#8b95a7] font-medium">{isArabic ? 'النطاق الأساسي:' : 'Domain:'}</span>
              <div className="mt-0.5 font-mono text-[#0f141b] dark:text-[#e8ecf2]">{lead.domain || '—'}</div>
            </div>
            <div>
              <span className="text-[#5b6577] dark:text-[#8b95a7] font-medium">{isArabic ? 'العنوان أو الموقع:' : 'Physical Address:'}</span>
              <div className="mt-0.5 text-[#0f141b] dark:text-[#e8ecf2]">{lead.address || '—'}</div>
            </div>
            <div>
              <span className="text-[#5b6577] dark:text-[#8b95a7] font-medium">{isArabic ? 'المحرك المستخدم:' : 'Engine Used:'}</span>
              <div className="mt-0.5 font-mono text-[#0f141b] dark:text-[#e8ecf2]">{lead.engine_used}</div>
            </div>
          </div>

          <div className="border-t border-[#d9dee6] dark:border-white/10 pt-2 flex flex-wrap gap-2">
            <span className="rounded bg-[#eaeef3] dark:bg-[#171c25] px-2 py-0.5 font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              fetch: {lead.fetch_status}
            </span>
            <span className="rounded bg-[#eaeef3] dark:bg-[#171c25] px-2 py-0.5 font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              extract: {lead.extract_status}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4 text-xs">
          <div>
            <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'عناوين البريد المكتشفة:' : 'Discovered Emails:'}</span>
            {lead.emails && lead.emails.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {lead.emails.map(email => (
                  <li key={email} className="flex items-center justify-between rounded border border-[#d9dee6]/60 dark:border-white/5 p-2 font-mono">
                    <span className="text-[#0f141b] dark:text-[#e8ecf2]">{email}</span>
                    <span className="rounded bg-[#0e8da6]/10 dark:bg-[#38c6e0]/15 px-2 py-0.5 text-[10px] text-[#0e8da6] dark:text-[#38c6e0]">
                      source: {lead.email_source}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-1 text-[#8b95a7] italic">{isArabic ? 'لم يتم العثور على بريد إلكتروني عام' : 'No public email found on target pages.'}</div>
            )}
          </div>

          <div>
            <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'أرقام الهواتف المكتشفة:' : 'Discovered Phone Numbers:'}</span>
            {lead.phones && lead.phones.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {lead.phones.map(phone => (
                  <li key={phone} className="flex items-center justify-between rounded border border-[#d9dee6]/60 dark:border-white/5 p-2 font-mono">
                    <span className="text-[#0f141b] dark:text-[#e8ecf2]">{phone}</span>
                    <span className="rounded bg-[#eaeef3] dark:bg-[#171c25] px-2 py-0.5 text-[10px] text-[#5b6577] dark:text-[#8b95a7]">
                      source: {lead.phone_source}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-1 text-[#8b95a7] italic">{isArabic ? 'لم يتم العثور على رقم هاتف عام' : 'No public telephone found.'}</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'score' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between rounded-lg bg-[#eaeef3]/40 dark:bg-[#171c25]/40 p-3">
            <div>
              <div className="text-[11px] text-[#5b6577] dark:text-[#8b95a7] uppercase">{isArabic ? 'إجمالي درجة المطابقة' : 'Total ICP Match Score'}</div>
              <div className="text-xl font-bold font-mono text-[#0f141b] dark:text-[#e8ecf2]">{lead.lead_score} / 100</div>
            </div>
            <span className="rounded px-2.5 py-1 font-mono text-xs font-semibold uppercase bg-black/[0.05] dark:bg-white/[0.08]">
              {lead.priority} priority
            </span>
          </div>

          <div>
            <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'تفاصيل صيغة الاحتساب:' : 'Formula Breakdown:'}</span>
            <div className="mt-1.5 space-y-1 font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              <div>• Base domain & verified company name: +25</div>
              <div>• Real verified email present: {lead.emails?.length > 0 ? '+35 (applied)' : '+0 (missing)'}</div>
              <div>• Direct phone line present: {lead.phones?.length > 0 ? '+20 (applied)' : '+0 (missing)'}</div>
              <div>• Geographic / Vertical relevance keywords: +{Math.max(0, lead.lead_score - (lead.emails?.length ? 35 : 0) - (lead.phones?.length ? 20 : 0) - 25)}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'outreach' && (
        <div className="space-y-3 text-xs">
          <div className="rounded bg-[#a86a00]/10 dark:bg-[#d29922]/15 p-2.5 text-[11px] text-[#a86a00] dark:text-[#d29922]">
            {isArabic
              ? 'ملاحظة أمان: هذا المحتوى عبارة عن مسودة للاستخدام اليدوي فقط. لن تقوم Helix-Ai بإرسال أي رسالة تلقائياً.'
              : 'Safety guarantee: Drafts only. Outreach messages are never automatically dispatched. Review and send via your preferred human channel.'}
          </div>

          {outreach?.subject || outreach?.body ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'عنوان البريد المقترح:' : 'Suggested Subject:'}</span>
                <div className="mt-0.5 rounded border border-[#cfd6df] dark:border-white/15 bg-[#eaeef3]/20 dark:bg-[#171c25]/20 p-2 font-medium text-[#0f141b] dark:text-[#e8ecf2]">
                  {outreach.subject}
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'نص المسودة:' : 'Draft Body:'}</span>
                <div className="mt-0.5 whitespace-pre-wrap rounded border border-[#cfd6df] dark:border-white/15 bg-[#eaeef3]/20 dark:bg-[#171c25]/20 p-2.5 text-xs text-[#0f141b] dark:text-[#e8ecf2] leading-relaxed">
                  {outreach.body}
                </div>
              </div>

              {outreach.dm && (
                <div>
                  <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'رسالة واتساب / لينكدإن قصيرة:' : 'Short DM:'}</span>
                  <div className="mt-0.5 rounded border border-[#cfd6df] dark:border-white/15 bg-[#eaeef3]/20 dark:bg-[#171c25]/20 p-2 text-xs font-mono text-[#0f141b] dark:text-[#e8ecf2]">
                    {outreach.dm}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-[#5b6577] dark:text-[#8b95a7] italic">
              {outreach?.skipped_reason
                ? `Outreach skipped: ${outreach.skipped_reason}`
                : lead.lead_score < 50
                ? isArabic ? 'تم تخطي المسودة لأن درجة العميل أقل من الحد الأدنى المطلوب' : 'Outreach skipped: Lead score is below threshold.'
                : isArabic ? 'لم تتوفر بيانات اتصال كافية لصياغة مسودة مخصصة' : 'No outreach generated: missing verified contact channel.'}
            </div>
          )}
        </div>
      )}

      {activeTab === 'markdown' && (
        <div className="space-y-2 text-xs">
          <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{isArabic ? 'مستخرج نص الصفحة (SiteToMarkdown):' : 'Structured Markdown Excerpt:'}</span>
          {lead.markdown_excerpt ? (
            <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded bg-[#0b0e13] p-3 font-mono text-[11px] text-[#e8ecf2] border border-white/10">
              {lead.markdown_excerpt}
            </pre>
          ) : (
            <div className="p-4 text-center text-[#5b6577] dark:text-[#8b95a7] italic">
              {isArabic ? 'لا يوجد مستخرج نصوص لهذه الصفحة' : 'No markdown excerpt captured for this domain.'}
            </div>
          )}
        </div>
      )}

      {activeTab === 'crm' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[#5b6577] dark:text-[#8b95a7] font-medium">CRM Contact ID:</span>
              <div className="mt-0.5 font-mono text-[11px] text-[#0f141b] dark:text-[#e8ecf2]">
                {lead.crm_contact_id || <span className="italic text-[#8b95a7]">Not pushed</span>}
              </div>
            </div>
            <div>
              <span className="text-[#5b6577] dark:text-[#8b95a7] font-medium">CRM Company ID:</span>
              <div className="mt-0.5 font-mono text-[11px] text-[#0f141b] dark:text-[#e8ecf2]">
                {lead.crm_company_id || <span className="italic text-[#8b95a7]">Not pushed</span>}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#5b6577] dark:text-[#8b95a7] leading-relaxed">
            {isArabic
              ? 'عند الضغط على "نقل إلى CRM"، سيتم إنشاء أو تحديث جهة الاتصال والشركة بمصدر leadgen_scrapling مع تسجيل ContactFact موثق.'
              : 'Pushing to CRM creates contacts with source=leadgen_scrapling and inserts immutable ContactFact evidence rows without fabricating data.'}
          </p>
        </div>
      )}
    </div>
  )
}
