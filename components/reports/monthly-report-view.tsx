'use client'

import type { MonthlyReportData } from '@/lib/reports/generator'
import { tx, type DashLang } from '@/lib/dashboard/lang'
import { useDashLang } from '@/components/dashboard/use-lang'
import { DataTable, EmptyState, KpiCard, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'

export function MonthlyReportView({ report, lang }: { report: MonthlyReportData; lang?: DashLang }) {
  const active = useDashLang(lang ?? 'en')
  const formatMoney = (cents: number) => `${report.currency} ${(cents / 100).toLocaleString(active === 'ar' ? 'ar' : 'en')}`
  const quiet = report.totalCallsHandled + report.totalWhatsAppMessages + report.verifiedFactsCount + report.recentInvoices.length + (report.retainerKnown ? 1 : 0) === 0
    && report.operationalBreakdown.every(item => item.count === 0)

  return (
    <div className="stack">
      <PageHead
        title={tx(active, 'Reports', 'التقارير')}
        lede={active === 'ar' ? report.executiveSummaryAr : report.executiveSummary}
        actions={
          <button type="button" className="btn-o" onClick={() => window.print()}>
            {tx(active, 'Print', 'طباعة')}
          </button>
        }
      />
      <p className="faint">{report.clientBusinessName} · {report.cyclePeriod}</p>
      {quiet ? (
        <EmptyState
          title={tx(active, 'Your first weekly report appears after 7 days of activity.', 'يظهر أول تقرير أسبوعي بعد 7 أيام من النشاط.')}
        />
      ) : null}
      <div className="kpis">
        <KpiCard label={tx(active, 'Calls recorded', 'مكالمات مسجّلة')} value={String(report.totalCallsHandled)} hint={tx(active, 'From the activity log', 'من سجل النشاط')} />
        <KpiCard label={tx(active, 'WhatsApp messages', 'رسائل واتساب')} value={String(report.totalWhatsAppMessages)} hint={tx(active, 'From the activity log', 'من سجل النشاط')} />
        <KpiCard
          label={tx(active, 'Checked details', 'تفاصيل تم التحقق منها')}
          value={report.factAccuracyRate == null ? '—' : `${report.factAccuracyRate}%`}
          hint={report.factAccuracyRate == null ? tx(active, 'No details recorded', 'لا توجد تفاصيل مسجّلة') : tx(active, 'Checked share of details on file', 'نسبة التفاصيل التي تم التحقق منها')}
        />
        <KpiCard
          label={tx(active, 'Closed deals', 'صفقات مغلقة')}
          value={report.roiMultiplier}
          hint={tx(active, `Closed value ${formatMoney(report.estimatedRecoveredValueCents)}`, `قيمة مغلقة ${formatMoney(report.estimatedRecoveredValueCents)}`)}
        />
      </div>
      <Panel title={tx(active, 'What ran', 'ما الذي عمل')}>
        <div className="grid-2">
          {report.operationalBreakdown.map(item => (
            <div className="card" key={item.system}>
              <b>{plainSystem(item.system, item.systemAr, active)}</b>
              <p className="faint">{active === 'ar' ? item.metricAr : item.metric}</p>
              <p className="num" style={{ fontSize: 28, marginTop: 8 }}>{item.count}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title={tx(active, 'Invoices', 'الفواتير')}
        extra={<span className="faint">{report.retainerKnown ? formatMoney(report.monthlyRetainerCents) : tx(active, 'Plan not on file', 'الخطة غير مسجّلة')}</span>}
      >
        <DataTable
          rows={report.recentInvoices}
          rowKey={row => row.id}
          empty={<EmptyState title={tx(active, 'No invoices yet.', 'لا توجد فواتير بعد.')} />}
          columns={[
            { key: 'id', header: tx(active, 'Invoice', 'الفاتورة'), render: row => <bdi dir="ltr">{row.id.slice(0, 8)}</bdi> },
            { key: 'date', header: tx(active, 'Date', 'التاريخ'), render: row => row.date },
            { key: 'amount', header: tx(active, 'Amount', 'المبلغ'), render: row => <bdi dir="ltr">{formatMoney(row.amountCents)}</bdi> },
            { key: 'status', header: tx(active, 'Status', 'الحالة'), render: row => <StatusChip>{plainStatus(row.status, active)}</StatusChip> },
          ]}
        />
      </Panel>
    </div>
  )
}

function plainSystem(en: string, ar: string, lang: DashLang) {
  return lang === 'ar' ? ar : en
}

function plainStatus(status: string, lang: DashLang) {
  const key = status.toLowerCase()
  if (key === 'paid') return tx(lang, 'Paid', 'مدفوعة')
  if (key === 'overdue') return tx(lang, 'Overdue', 'متأخرة')
  if (key === 'pending') return tx(lang, 'Due', 'مستحقة')
  return status
}
