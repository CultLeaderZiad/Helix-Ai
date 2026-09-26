import type { ExtractedContacts, OutreachDraft } from './types'

export interface GenerateOutreachOptions {
  contacts: ExtractedContacts
  targetUrl: string
  icpText: string
  score: number
  outreachMinScore: number
  enabled: boolean
}

/**
 * Generates an outreach draft ONLY if score >= outreachMinScore and real contact exists.
 * Strictly draft only: never auto-sends.
 */
export function generateOutreachDraft(options: GenerateOutreachOptions): OutreachDraft | null {
  const { contacts, targetUrl, score, outreachMinScore, enabled } = options

  if (!enabled) {
    return null
  }

  const hasContact = contacts.emails.length > 0 || contacts.phones.length > 0
  if (!hasContact || score < outreachMinScore) {
    return null
  }

  const company = contacts.company_name || 'your team'
  const subject = `Partnership inquiry regarding ${company} operations`
  const body =
    `Hi ${company} team,\n\n` +
    `I came across your public profile while researching leading operations in your sector. ` +
    `We deploy autonomous operations and booking intelligence specifically configured for businesses like ${company}.\n\n` +
    `Would you be open to a quick 5-minute review of how Helix-Ai automates triage and inbound workflows?\n\n` +
    `Best regards,\nHelix AI Operations Console`

  const dm = `Hi ${company} team, saw your operations portfolio. Would love to share how our automated triage system assists regional teams.`

  return {
    subject,
    body,
    dm,
    personalization_points: [
      `Target company: ${company}`,
      `Identified via: ${targetUrl}`,
      contacts.emails[0] ? `Primary email: ${contacts.emails[0]}` : '',
      contacts.phones[0] ? `Direct phone: ${contacts.phones[0]}` : '',
    ].filter(Boolean),
  }
}
