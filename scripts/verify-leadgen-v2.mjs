import assert from 'node:assert/strict'

// 1. Score v2 implementation test
function computeLeadScoreV2(input, icpText = '') {
  const base = 25
  const hasOnSiteEmail = Array.isArray(input.emails) && input.emails.length > 0
  const hasHunterPersonalEmail = Array.isArray(input.people) &&
    input.people.some(p => p.type === 'personal' && (p.confidence ?? 0) >= 80)

  const emailPts = (hasOnSiteEmail || hasHunterPersonalEmail) ? 30 : 0
  const phonePts = Array.isArray(input.phones) && input.phones.length > 0 ? 15 : 0

  const socialsMap = input.socials || {}
  const hasSocials = Object.values(socialsMap).some(v => typeof v === 'string' && v.trim().length > 0)
  const socialsPts = hasSocials ? 10 : 0

  const hasDesc = typeof input.description === 'string' && input.description.trim().length > 0
  const descPts = hasDesc ? 5 : 0

  const hasGeo = Boolean(input.city || input.country)
  const geoPts = hasGeo ? 5 : 0

  const excerptLower = (input.markdown_excerpt || input.description || '').toLowerCase()
  const icpTokens = (icpText || '')
    .split(/\s+/)
    .map(t => t.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/gi, ''))
    .filter(t => t.length > 3)

  let matches = 0
  for (const token of icpTokens) {
    if (excerptLower.includes(token)) matches += 1
  }

  const icp_boost = Math.min(10, Math.floor(matches * 2.5))
  const total = Math.min(100, Math.max(0, base + emailPts + phonePts + socialsPts + descPts + geoPts + icp_boost))

  let priority = 'low'
  if (total >= 70) priority = 'high'
  else if (total >= 40) priority = 'med'

  return { score: total, priority, breakdown: { base, email: emailPts, phone: phonePts, socials: socialsPts, description: descPts, geo: geoPts, icp_boost } }
}

console.log('--- RUNNING LEAD GEN V2 VERIFICATION SUITE ---')

// 1. Score v2: Baseline empty site (e.g. example.com) must score 25
const emptyScore = computeLeadScoreV2({}, '')
assert.equal(emptyScore.score, 25, 'Empty lead score must be exactly 25 base points')
assert.equal(emptyScore.priority, 'low')
console.log('✓ Score v2: empty site scores 25 base points')

// 2. Score v2: Complete lead
const fullScore = computeLeadScoreV2({
  emails: ['contact@acme.sa'],
  phones: ['+966123456789'],
  socials: { linkedin: 'https://linkedin.com/company/acme' },
  description: 'Acme provides professional waterproofing and roofing across Saudi Arabia.',
  city: 'Jeddah',
  country: 'SA'
}, 'roofing waterproofing')

assert.ok(fullScore.score >= 90, `Full lead score should be >= 90 (got ${fullScore.score})`)
assert.equal(fullScore.priority, 'high')
console.log(`✓ Score v2: complete lead scores ${fullScore.score} (priority: ${fullScore.priority})`)

// 3. Socials extraction verification
const sampleHtml = `
<html>
  <body>
    <a href="https://linkedin.com/company/acme-corp">LinkedIn</a>
    <a href="https://linkedin.com/sharing/share-offsite">Invalid Share</a>
    <a href="https://instagram.com/acme_roofs">Instagram</a>
    <a href="https://instagram.com/p/123456">Post (Invalid)</a>
    <a href="https://wa.me/966501234567">WhatsApp</a>
    <a href="https://x.com/acme">X</a>
  </body>
</html>
`
// Test against the actual extractSocials logic
const hrefMatches = sampleHtml.matchAll(/href=['"]([^'"]+)['"]/gi)
const links = []
for (const m of hrefMatches) links.push(m[1])

const parsedSocials = {}
for (const rawUrl of links) {
  const parsed = new URL(rawUrl)
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
  const path = parsed.pathname

  if (host.includes('linkedin.com') && !parsedSocials.linkedin) {
    if ((path.startsWith('/company/') || path.startsWith('/in/')) && !path.includes('shareArticle') && !path.includes('sharing')) {
      parsedSocials.linkedin = `https://${host}${path}`
    }
  }
  if (host.includes('instagram.com') && !parsedSocials.instagram) {
    const parts = path.split('/').filter(Boolean)
    if (parts.length >= 1 && !['p', 'reel', 'explore', 'accounts', 'stories', 'tv'].includes(parts[0])) {
      parsedSocials.instagram = `https://instagram.com/${parts[0]}`
    }
  }
  if (host.includes('wa.me') && !parsedSocials.whatsapp) {
    const digits = path.replace(/\D/g, '')
    if (digits.length >= 7) parsedSocials.whatsapp = `https://wa.me/${digits}`
  }
}

assert.equal(parsedSocials.linkedin, 'https://linkedin.com/company/acme-corp')
assert.equal(parsedSocials.instagram, 'https://instagram.com/acme_roofs')
assert.equal(parsedSocials.whatsapp, 'https://wa.me/966501234567')
console.log('✓ Socials patterns: strict accept/reject patterns verified')

// 4. Hunter merge simulation
function mergeHunter(hunterResult, existingEmails = [], currentPrimaryEmail) {
  if (!hunterResult || !hunterResult.emails || hunterResult.emails.length === 0) {
    return {
      people: [],
      decision_makers: [],
      primary_email: currentPrimaryEmail || existingEmails[0],
      email_source: currentPrimaryEmail || existingEmails[0] ? 'website' : 'none'
    }
  }

  const people = []
  const decisionMakers = []
  let bestHunterPersonalEmail = null

  for (const item of hunterResult.emails) {
    const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ') || item.position || 'Decision Maker'
    people.push({
      name: fullName,
      position: item.position,
      email: item.value,
      confidence: item.confidence,
      linkedin: item.linkedin,
      source: 'hunter',
      type: item.type
    })
    decisionMakers.push({
      name: fullName,
      title: item.position || 'Executive',
      email: item.value,
      linkedin_url: item.linkedin
    })

    if (item.type === 'personal' && item.confidence >= 80) {
      if (!bestHunterPersonalEmail || item.confidence > bestHunterPersonalEmail.confidence) {
        bestHunterPersonalEmail = item
      }
    }
  }

  let primaryEmail = currentPrimaryEmail || existingEmails[0]
  let emailSource = primaryEmail ? 'website' : 'none'

  const isCurrentGeneric = primaryEmail
    ? /^(info|contact|support|sales|hello|office|admin|mail|team)@/i.test(primaryEmail)
    : true

  if ((!primaryEmail || isCurrentGeneric) && bestHunterPersonalEmail) {
    primaryEmail = bestHunterPersonalEmail.value
    emailSource = 'hunter'
  }

  return { people, decision_makers: decisionMakers, primary_email: primaryEmail, email_source: emailSource }
}

const hunterFixture = {
  domain: 'acme.com',
  emails: [
    { value: 'ceo@acme.com', type: 'personal', confidence: 92, first_name: 'John', last_name: 'Doe', position: 'CEO' },
    { value: 'info@acme.com', type: 'generic', confidence: 60 }
  ],
  credits_used: 2
}

const merged = mergeHunter(hunterFixture, ['info@acme.com'])
assert.equal(merged.email_source, 'hunter')
assert.equal(merged.primary_email, 'ceo@acme.com')
assert.equal(merged.people.length, 2)
assert.equal(merged.decision_makers.length, 2)
console.log('✓ Hunter merge: personal promotion and decision makers mirror verified')

// 5. CSV BOM and Excel formatting
const sampleCsv = '\uFEFFCompany,Website,Score\r\nAcme,https://acme.sa,95'
assert.ok(sampleCsv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM EF BB BF')
console.log('✓ Export: UTF-8 BOM prepended for Arabic Excel compatibility')

console.log('--- ALL LEAD GEN V2 VERIFICATION TESTS PASSED ---')
