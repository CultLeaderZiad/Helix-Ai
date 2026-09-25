import { HunterDomainSearchResult, HunterEmail } from '../providers/hunter'
import type { LeadGenDecisionMaker } from '../../leadgen/types'

export interface HunterPerson {
  name: string
  position?: string
  email: string
  confidence: number
  linkedin?: string
  source: 'hunter'
  type: 'personal' | 'generic'
}

export interface HunterMergeResult {
  people: HunterPerson[]
  decision_makers: LeadGenDecisionMaker[]
  primary_email?: string
  email_source: 'website' | 'hunter' | 'none'
}

/**
 * Merge Hunter Domain Search results into extracted lead data:
 * - Creates unified `people` array for LeadGenLead.
 * - Mirrors people into `decision_makers` for CRM upsert compatibility.
 * - Chooses primary email: on-site personal email > Hunter personal email (confidence >= 80) > on-site generic.
 */
export function mergeHunterEmails(
  hunterResult: HunterDomainSearchResult | undefined,
  existingEmails: string[] = [],
  currentPrimaryEmail?: string
): HunterMergeResult {
  if (!hunterResult || !hunterResult.emails || hunterResult.emails.length === 0) {
    return {
      people: [],
      decision_makers: [],
      primary_email: currentPrimaryEmail || existingEmails[0],
      email_source: currentPrimaryEmail || existingEmails[0] ? 'website' : 'none'
    }
  }

  const people: HunterPerson[] = []
  const decisionMakers: LeadGenDecisionMaker[] = []

  let bestHunterPersonalEmail: HunterEmail | undefined

  for (const item of hunterResult.emails) {
    const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ') || item.position || 'Decision Maker'
    const person: HunterPerson = {
      name: fullName,
      position: item.position,
      email: item.value,
      confidence: item.confidence,
      linkedin: item.linkedin,
      source: 'hunter',
      type: item.type
    }
    people.push(person)

    decisionMakers.push({
      name: fullName,
      title: item.position || 'Executive',
      email: item.value,
      phone: undefined,
      linkedin_url: item.linkedin
    })

    if (item.type === 'personal' && item.confidence >= 80) {
      if (!bestHunterPersonalEmail || item.confidence > bestHunterPersonalEmail.confidence) {
        bestHunterPersonalEmail = item
      }
    }
  }

  // Priority order:
  // 1) If we already found a valid email from the website, keep it unless it is generic (info@, contact@) and we have a high-confidence Hunter personal email.
  let primaryEmail = currentPrimaryEmail || existingEmails[0]
  let emailSource: 'website' | 'hunter' | 'none' = primaryEmail ? 'website' : 'none'

  const isCurrentGeneric = primaryEmail
    ? /^(info|contact|support|sales|hello|office|admin|mail|team)@/i.test(primaryEmail)
    : true

  if ((!primaryEmail || isCurrentGeneric) && bestHunterPersonalEmail) {
    primaryEmail = bestHunterPersonalEmail.value
    emailSource = 'hunter'
  }

  return {
    people,
    decision_makers: decisionMakers,
    primary_email: primaryEmail,
    email_source: emailSource
  }
}
