import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { HELIX_ADMIN_EMAIL, isAgencyAdminEmail } from '../lib/auth/admin-email.ts'
import { authCallbackUrl, getPublicSiteUrl, safeNextPath } from '../lib/auth/site-url.ts'
import { interpretSignUp } from '../lib/auth/signup-outcome.ts'
import { mapDirectoryContacts, sumDealValueCents } from '../lib/crm/directory.ts'
import { summarizeMonthlyReport } from '../lib/reports/metrics.ts'

describe('agency admin email', () => {
  it('treats the owner inbox as an agency admin', () => {
    assert.equal(isAgencyAdminEmail(HELIX_ADMIN_EMAIL), true)
    assert.equal(isAgencyAdminEmail('CultLeaderZoz.Dev@gmail.com'), true)
    assert.equal(isAgencyAdminEmail('someone@example.com'), false)
    assert.equal(isAgencyAdminEmail('someone@example.com', ['someone@example.com']), true)
  })
})

describe('auth redirect origin', () => {
  it('uses the configured site URL', () => {
    const url = getPublicSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://helix-ai-two.vercel.app/' })
    assert.equal(url, 'https://helix-ai-two.vercel.app')
    assert.equal(
      authCallbackUrl('/dashboard', { NEXT_PUBLIC_SITE_URL: 'https://helix-ai-two.vercel.app' }),
      'https://helix-ai-two.vercel.app/auth/callback?next=%2Fdashboard',
    )
  })

  it('does not use a localhost site URL on Vercel production', () => {
    const url = getPublicSiteUrl({
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      VERCEL_ENV: 'production',
      VERCEL: '1',
      VERCEL_PROJECT_PRODUCTION_URL: 'helix-ai-two.vercel.app',
    })
    assert.equal(url, 'https://helix-ai-two.vercel.app')
  })

  it('rejects off-site next paths', () => {
    assert.equal(safeNextPath('//evil.example'), '/dashboard')
    assert.equal(safeNextPath('https://evil.example'), '/dashboard')
    assert.equal(safeNextPath('/reset-password'), '/reset-password')
  })
})

describe('signup outcome', () => {
  it('does not claim an email was sent when Supabase returns an error', () => {
    const outcome = interpretSignUp({
      error: { message: 'Email rate limit exceeded', status: 429 },
      user: null,
      session: null,
    })
    assert.equal(outcome.kind, 'error')
  })

  it('does not claim a new confirmation when the email is already registered', () => {
    const outcome = interpretSignUp({
      error: null,
      user: { identities: [] },
      session: null,
    })
    assert.equal(outcome.kind, 'already_registered')
  })

  it('asks the user to confirm when there is no session', () => {
    const outcome = interpretSignUp({
      error: null,
      user: { identities: [{ id: 'identity' }] },
      session: null,
    })
    assert.equal(outcome.kind, 'confirm_email')
  })
})

describe('CRM directory', () => {
  it('reads deal value from the linked deal and leaves gaps empty', () => {
    const rows = mapDirectoryContacts({
      contacts: [
        {
          id: 'contact-1',
          full_name: 'Nour',
          email: 'nour@example.com',
          phone: null,
          company_name: null,
          lead_status: 'warm',
          created_at: '2026-09-01T00:00:00.000Z',
          updated_at: '2026-09-02T00:00:00.000Z',
        },
      ],
      dealLinks: [
        {
          contact_id: 'contact-1',
          stage: 'QUALIFIED_TO_BUY',
          value_cents: 150000,
          updated_at: '2026-09-03T00:00:00.000Z',
        },
      ],
      facts: [],
      activities: [],
    })
    assert.equal(rows[0].deal_stage, 'QUALIFIED_TO_BUY')
    assert.equal(rows[0].deal_value_cents, 150000)
    assert.equal(rows[0].fact_status, null)
    assert.equal(sumDealValueCents([{ value_cents: 150000 }, { value_cents: null }]), 150000)
  })

  it('returns an empty directory when there are no contacts', () => {
    assert.deepEqual(
      mapDirectoryContacts({ contacts: [], dealLinks: [], facts: [], activities: [] }),
      [],
    )
  })
})

describe('monthly report metrics', () => {
  it('does not invent calls, facts, or revenue', () => {
    const summary = summarizeMonthlyReport({
      businessName: 'Empty Workspace',
      regionTier: 'gcc_enterprise',
      callsHandled: 0,
      whatsAppMessages: 0,
      bookings: 0,
      missedCallEvents: 0,
      reactivationTouches: 0,
      verifiedFacts: 0,
      totalFacts: 0,
      wonValueCents: 0,
      invoicedCents: 0,
      retainerCents: null,
      generatedAt: new Date('2026-09-25T00:00:00.000Z'),
      clientId: 'abc12345-rest',
    })
    assert.equal(summary.totalCallsHandled, 0)
    assert.equal(summary.totalWhatsAppMessages, 0)
    assert.equal(summary.verifiedFactsCount, 0)
    assert.equal(summary.factAccuracyRate, null)
    assert.equal(summary.estimatedRecoveredValueCents, 0)
    assert.equal(summary.retainerKnown, false)
    assert.equal(summary.systemUptimePercentage, 'Not measured')
    assert.match(summary.executiveSummary, /No measured/)
  })
})
