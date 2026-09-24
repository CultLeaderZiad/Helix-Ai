import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { recordContactFact } from '@/lib/crm/facts'
import type { LeadGenLead } from '@/lib/schema'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400, headers })
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  const adminDb = createSupabaseAdminClient()

  // 1. Fetch job
  const { data: job, error: jobError } = await adminDb
    .from('leadgen_jobs')
    .select('id, client_id, logs')
    .eq('id', id)
    .maybeSingle()

  if (jobError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers })
  }

  if (session.claims.role !== 'agency_admin' && session.claims.client_id !== job.client_id) {
    return NextResponse.json({ error: 'Unauthorized to push leads for this job' }, { status: 403, headers })
  }

  // 2. Fetch leads for this job
  const { data: leads, error: leadsError } = await adminDb
    .from('leadgen_leads')
    .select('*')
    .eq('job_id', id)

  if (leadsError) {
    return NextResponse.json({ error: leadsError.message }, { status: 500, headers })
  }

  const leadList: LeadGenLead[] = leads ?? []
  let companiesUpserted = 0
  let contactsUpserted = 0
  let factsRecorded = 0
  let skipped = 0

  for (const lead of leadList) {
    try {
      let companyId: string | null = lead.crm_company_id ?? null

      // Upsert Company if company_name or domain exists
      if (lead.company_name || lead.domain || lead.website) {
        const companyName = lead.company_name || lead.domain || 'Unnamed Company'
        
        // Check if company already exists by domain or name within tenant
        let existingCompanyQuery = adminDb
          .from('companies')
          .select('id')
          .eq('client_id', job.client_id)

        if (lead.domain) {
          existingCompanyQuery = existingCompanyQuery.eq('domain', lead.domain)
        } else {
          existingCompanyQuery = existingCompanyQuery.eq('name', companyName)
        }

        const { data: existingCompany } = await existingCompanyQuery.maybeSingle()

        if (existingCompany?.id) {
          companyId = existingCompany.id
        } else {
          const { data: newCompany, error: compErr } = await adminDb
            .from('companies')
            .insert({
              client_id: job.client_id,
              name: companyName,
              domain: lead.domain || null,
              location: lead.address || null,
              phone: lead.phones?.[0] || null,
              custom_fields: { source: 'leadgen_scrapling', job_id: id },
            })
            .select('id')
            .maybeSingle()

          if (!compErr && newCompany?.id) {
            companyId = newCompany.id
            companiesUpserted++
          }
        }
      }

      // Upsert Contact if email exists (provenance: real email required)
      const primaryEmail = lead.emails?.[0]?.toLowerCase().trim()
      let contactId: string | null = lead.crm_contact_id ?? null

      if (primaryEmail) {
        // Check existing contact by email in this tenant
        const { data: existingContact } = await adminDb
          .from('contacts')
          .select('id')
          .eq('client_id', job.client_id)
          .eq('email', primaryEmail)
          .maybeSingle()

        if (existingContact?.id) {
          contactId = existingContact.id
        } else {
          const fullName =
            lead.decision_makers?.[0]?.name ||
            lead.company_name ||
            'Public Lead Contact'

          const { data: newContact, error: contErr } = await adminDb
            .from('contacts')
            .insert({
              client_id: job.client_id,
              full_name: fullName,
              email: primaryEmail,
              phone: lead.phones?.[0] || null,
              company_name: lead.company_name || null,
              company_id: companyId,
              source: 'leadgen_scrapling',
              lead_status: lead.lead_score >= 70 ? 'hot' : lead.lead_score >= 40 ? 'warm' : 'cold',
              custom_fields: {
                job_id: id,
                lead_score: lead.lead_score,
                priority: lead.priority,
                email_source: lead.email_source,
                website: lead.website,
              },
            })
            .select('id')
            .maybeSingle()

          if (!contErr && newContact?.id) {
            contactId = newContact.id
            contactsUpserted++

            // Record honest ContactFact
            try {
              await recordContactFact(adminDb, {
                client_id: job.client_id,
                contact_id: newContact.id,
                field_name: 'email',
                field_value: primaryEmail,
                source_tool: 'leadgen_scrapling.public_page',
                source_url: lead.website ?? undefined,
                evidence: [
                  {
                    type: 'extracted_public_page',
                    domain: lead.domain,
                    email_source: lead.email_source,
                    extract_status: lead.extract_status,
                    score: lead.lead_score,
                  },
                ],
              })
              factsRecorded++
            } catch (factErr) {
              console.warn('Failed recording contact fact:', factErr)
            }
          }
        }
      } else {
        skipped++
      }

      // Update leadgen_leads row with references
      await adminDb
        .from('leadgen_leads')
        .update({
          crm_company_id: companyId,
          crm_contact_id: contactId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
    } catch {
      skipped++
    }
  }

  // Append audit/summary line to job logs
  const logLine = `> crm_upsert · contacts=${contactsUpserted} companies=${companiesUpserted} facts=${factsRecorded} · skipped=${skipped} · timestamp=${new Date().toISOString()}`
  await adminDb
    .from('leadgen_jobs')
    .update({
      logs: [...(job.logs || []), logLine],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json(
    {
      success: true,
      contactsUpserted,
      companiesUpserted,
      factsRecorded,
      skipped,
    },
    { headers }
  )
}
