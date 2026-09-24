import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import type { LeadGenLead } from '@/lib/schema'

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

  const leadRows: LeadGenLead[] = leads ?? []

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

  // Default: CSV export with provenance headers
  const csvHeaders = [
    'company_name',
    'website',
    'domain',
    'emails',
    'email_source',
    'phones',
    'phone_source',
    'address',
    'lead_score',
    'priority',
    'extract_status',
    'fetch_status',
    'engine_used',
    'outreach_subject',
    'outreach_body',
    'outreach_dm',
    'created_at',
  ]

  const csvRows = [csvHeaders.join(',')]

  for (const lead of leadRows) {
    const outreach = lead.outreach as { subject?: string; body?: string; dm?: string } | null
    const row = [
      escapeCsvField(lead.company_name),
      escapeCsvField(lead.website),
      escapeCsvField(lead.domain),
      escapeCsvField(lead.emails),
      escapeCsvField(lead.email_source),
      escapeCsvField(lead.phones),
      escapeCsvField(lead.phone_source),
      escapeCsvField(lead.address),
      escapeCsvField(lead.lead_score),
      escapeCsvField(lead.priority),
      escapeCsvField(lead.extract_status),
      escapeCsvField(lead.fetch_status),
      escapeCsvField(lead.engine_used),
      escapeCsvField(outreach?.subject ?? ''),
      escapeCsvField(outreach?.body ?? ''),
      escapeCsvField(outreach?.dm ?? ''),
      escapeCsvField(lead.created_at),
    ]
    csvRows.push(row.join(','))
  }

  return new NextResponse(csvRows.join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leadgen-leads-${id}.csv"`,
      'Cache-Control': 'no-store, private',
    },
  })
}
