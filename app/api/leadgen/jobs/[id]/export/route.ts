import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import type { LeadGenLead } from '@/lib/schema'

export const runtime = 'nodejs'

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return ''
  const str = Array.isArray(field) ? field.join('; ') : String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const format = (searchParams.get('format') || 'csv').toLowerCase()
  const detail = (searchParams.get('detail') || 'simple').toLowerCase()
  const lang = (searchParams.get('lang') || 'en').toLowerCase()

  let query = supabase
    .from('leadgen_leads')
    .select('*')
    .eq('job_id', id)
    .order('lead_score', { ascending: false })

  if (session.claims.role !== 'agency_admin' && session.claims.client_id) {
    query = query.eq('client_id', session.claims.client_id)
  }

  const { data: leads, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leadRows: any[] = (leads ?? []).map((lead: any) => ({
    ...lead,
    description: lead.description || lead.sources?.description || lead.markdown_excerpt || '',
    city: lead.city || lead.sources?.city || '',
    country: lead.country || lead.sources?.country || '',
    people: lead.people || lead.sources?.people || lead.decision_makers || [],
    origin: lead.origin || lead.sources?.origin || 'crawl'
  }))

  // 1. JSONL Export
  if (format === 'jsonl') {
    const jsonlLines = leadRows.map(row => JSON.stringify(row)).join('\n')
    return new NextResponse(jsonlLines, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Content-Disposition': `attachment; filename="leadgen-leads-${id}.jsonl"`,
        'Cache-Control': 'no-store, private',
      },
    })
  }

  // 2. Simple vs Full fields
  const isArabic = lang === 'ar'
  const isSimple = detail === 'simple'

  const simpleHeadersEn = [
    'Company',
    'Website',
    'Description',
    'Email',
    'Phone',
    'Socials',
    'City',
    'Country',
    'Score',
    'Source'
  ]

  const simpleHeadersAr = [
    'الشركة',
    'الموقع',
    'الوصف',
    'البريد',
    'الهاتف',
    'الشبكات الاجتماعية',
    'المدينة',
    'الدولة',
    'التقييم',
    'المصدر'
  ]

  // Full 17 columns
  const fullHeadersEn = [
    'company_name',
    'website',
    'domain',
    'emails',
    'email_source',
    'phones',
    'phone_source',
    'socials',
    'description',
    'city',
    'country',
    'address',
    'lead_score',
    'priority',
    'extract_status',
    'fetch_status',
    'engine_used',
    'people',
    'created_at',
  ]

  function formatSocials(socialsObj: any): string {
    if (!socialsObj || typeof socialsObj !== 'object') return ''
    return Object.values(socialsObj).filter(v => typeof v === 'string' && v.trim().length > 0).join(' ')
  }

  function resolveSources(lead: any): string {
    const s = lead.sources
    if (s && Array.isArray(s.sources)) return s.sources.join('+')
    if (lead.origin) return lead.origin
    return 'website'
  }

  // 3. XLSX Export via exceljs
  if (format === 'xlsx') {
    try {
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Helix AI'
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet('Leads', {
        views: [{ state: 'frozen', ySplit: 1 }]
      })

      const headers = isSimple ? (isArabic ? simpleHeadersAr : simpleHeadersEn) : fullHeadersEn

      const headerRow = worksheet.addRow(headers)
      headerRow.font = { bold: true }

      for (const lead of leadRows) {
        if (isSimple) {
          const firstEmail = Array.isArray(lead.emails) && lead.emails.length > 0 ? lead.emails[0] : ''
          const firstPhone = Array.isArray(lead.phones) && lead.phones.length > 0 ? lead.phones[0] : ''
          const socialsStr = formatSocials(lead.socials)
          const sourceStr = resolveSources(lead)

          worksheet.addRow([
            lead.company_name || '',
            lead.website || '',
            lead.description || '',
            firstEmail,
            firstPhone,
            socialsStr,
            lead.city || '',
            lead.country || '',
            lead.lead_score ?? 25,
            sourceStr
          ])
        } else {
          worksheet.addRow([
            lead.company_name || '',
            lead.website || '',
            lead.domain || '',
            (lead.emails || []).join('; '),
            lead.email_source || '',
            (lead.phones || []).join('; '),
            lead.phone_source || '',
            formatSocials(lead.socials),
            lead.description || '',
            lead.city || '',
            lead.country || '',
            lead.address || '',
            lead.lead_score ?? 25,
            lead.priority || 'low',
            lead.extract_status || '',
            lead.fetch_status || '',
            lead.engine_used || '',
            JSON.stringify(lead.people || []),
            lead.created_at || ''
          ])
        }
      }

      // Format column widths <= 60
      worksheet.columns.forEach(col => {
        let maxLen = 12
        col.eachCell?.({ includeEmpty: false }, cell => {
          const val = cell.value ? String(cell.value) : ''
          if (val.length > maxLen) maxLen = Math.min(val.length + 2, 60)
        })
        col.width = maxLen
      })

      const buffer = await workbook.xlsx.writeBuffer()
      return new NextResponse(buffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="leadgen-leads-${id}.xlsx"`,
          'Cache-Control': 'no-store, private',
        }
      })
    } catch (err) {
      console.warn('[export/xlsx] ExcelJS export error, falling back to CSV:', err)
    }
  }

  // 4. CSV Export with UTF-8 BOM (\uFEFF) and CRLF for Excel compatibility (F9)
  const headers = isSimple ? (isArabic ? simpleHeadersAr : simpleHeadersEn) : fullHeadersEn
  const csvRows = [headers.join(',')]

  for (const lead of leadRows) {
    if (isSimple) {
      const firstEmail = Array.isArray(lead.emails) && lead.emails.length > 0 ? lead.emails[0] : ''
      const firstPhone = Array.isArray(lead.phones) && lead.phones.length > 0 ? lead.phones[0] : ''
      const socialsStr = formatSocials(lead.socials)
      const sourceStr = resolveSources(lead)

      const row = [
        escapeCsvField(lead.company_name),
        escapeCsvField(lead.website),
        escapeCsvField(lead.description),
        escapeCsvField(firstEmail),
        escapeCsvField(firstPhone),
        escapeCsvField(socialsStr),
        escapeCsvField(lead.city),
        escapeCsvField(lead.country),
        escapeCsvField(lead.lead_score ?? 25),
        escapeCsvField(sourceStr)
      ]
      csvRows.push(row.join(','))
    } else {
      const row = [
        escapeCsvField(lead.company_name),
        escapeCsvField(lead.website),
        escapeCsvField(lead.domain),
        escapeCsvField(lead.emails),
        escapeCsvField(lead.email_source),
        escapeCsvField(lead.phones),
        escapeCsvField(lead.phone_source),
        escapeCsvField(formatSocials(lead.socials)),
        escapeCsvField(lead.description),
        escapeCsvField(lead.city),
        escapeCsvField(lead.country),
        escapeCsvField(lead.address),
        escapeCsvField(lead.lead_score),
        escapeCsvField(lead.priority),
        escapeCsvField(lead.extract_status),
        escapeCsvField(lead.fetch_status),
        escapeCsvField(lead.engine_used),
        escapeCsvField(JSON.stringify(lead.people || [])),
        escapeCsvField(lead.created_at),
      ]
      csvRows.push(row.join(','))
    }
  }

  // Prepend UTF-8 Byte Order Mark: \uFEFF
  const csvBody = '\uFEFF' + csvRows.join('\r\n')

  return new NextResponse(csvBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leadgen-leads-${id}.csv"`,
      'Cache-Control': 'no-store, private',
    },
  })
}
