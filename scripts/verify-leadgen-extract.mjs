#!/usr/bin/env node
/**
 * Test script verifying contact extraction, phone regex, scoring fixtures, and outreach generation.
 * Run with: node scripts/verify-leadgen-extract.mjs
 */

import assert from 'node:assert/strict'

const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g
const PHONE_REGEX = /(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{2,4})?/g
const STATIC_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.js', '.css', '.woff', '.woff2']

function cleanDomain(urlStr) {
  try {
    const u = new URL(urlStr)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return urlStr
  }
}

function extractContactsFromHtml(html, targetUrl) {
  const fallbackCompany = cleanDomain(targetUrl)

  if (!html) {
    return {
      company_name: fallbackCompany,
      emails: [],
      phones: [],
      address: null,
      markdown_excerpt: '',
      extract_status: 'empty',
    }
  }

  const emailsSet = new Set()
  const phonesSet = new Set()

  // 1. Mailto links
  const mailtoMatches = html.matchAll(/href=['"]mailto:([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)['"]/gi)
  for (const match of mailtoMatches) {
    const raw = match[1]?.trim().toLowerCase()
    if (raw && !STATIC_EXTENSIONS.some(ext => raw.endsWith(ext))) {
      emailsSet.add(raw)
    }
  }

  // 2. Tel links
  const telMatches = html.matchAll(/href=['"]tel:([^'"]+)['"]/gi)
  for (const match of telMatches) {
    const raw = match[1]?.trim()
    if (raw) {
      const digitsOnly = raw.replace(/\D/g, '')
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        phonesSet.add(raw)
      }
    }
  }

  // 3. Text email regex
  const textEmailMatches = html.match(EMAIL_REGEX)
  if (textEmailMatches) {
    for (const em of textEmailMatches) {
      const clean = em.trim().toLowerCase()
      if (!STATIC_EXTENSIONS.some(ext => clean.endsWith(ext))) {
        emailsSet.add(clean)
      }
    }
  }

  // 4. Strip tags
  const cleanBody = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()

  // 5. Text phone regex
  const textPhoneMatches = cleanBody.match(PHONE_REGEX)
  if (textPhoneMatches) {
    for (const ph of textPhoneMatches) {
      const cleanPh = ph.trim()
      const digits = cleanPh.replace(/\D/g, '')
      if (digits.length >= 7 && digits.length <= 15) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanPh)) {
          phonesSet.add(cleanPh)
        }
      }
    }
  }

  // 6. Title extraction
  let company_name = null
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    const rawTitle = titleMatch[1].trim()
    const firstPart = rawTitle.split(/[|\-–—•]/)[0]?.trim()
    if (firstPart && firstPart.length > 1) {
      company_name = firstPart
    }
  }

  if (!company_name) {
    company_name = fallbackCompany
  }

  const excerptText = cleanBody.slice(0, 1200)
  const markdown_excerpt = `### ${company_name}\n\n**Source URL:** ${targetUrl}\n\n${excerptText.slice(0, 600)}${excerptText.length > 600 ? '...' : ''}`

  const emails = Array.from(emailsSet).slice(0, 5)
  const phones = Array.from(phonesSet).slice(0, 5)

  let extract_status = 'empty'
  if (emails.length > 0 || phones.length > 0) {
    extract_status = 'ok'
  } else if (company_name && company_name !== fallbackCompany) {
    extract_status = 'partial'
  }

  return {
    company_name,
    emails,
    phones,
    address: null,
    markdown_excerpt,
    extract_status,
  }
}

function computeLeadScore(contacts, icpText) {
  const base = 25
  const emailPts = contacts.emails.length > 0 ? 35 : 0
  const phonePts = contacts.phones.length > 0 ? 20 : 0

  const excerptLower = (contacts.markdown_excerpt || '').toLowerCase()
  const icpTokens = (icpText || '')
    .split(/\s+/)
    .map(t => t.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/gi, ''))
    .filter(t => t.length > 3)

  let matches = 0
  for (const token of icpTokens) {
    if (excerptLower.includes(token)) {
      matches += 1
    }
  }

  const icp_boost = Math.min(20, matches * 5)
  const total = Math.min(100, Math.max(0, base + emailPts + phonePts + icp_boost))

  let priority = 'low'
  if (total >= 70) {
    priority = 'high'
  } else if (total >= 40) {
    priority = 'med'
  }

  return { score: total, priority, icp_boost }
}

function generateOutreachDraft({ contacts, score, outreachMinScore = 50, enabled = true }) {
  if (!enabled) return null
  const hasContact = contacts.emails.length > 0 || contacts.phones.length > 0
  if (!hasContact || score < outreachMinScore) return null

  const company = contacts.company_name || 'your team'
  return {
    subject: `Partnership inquiry regarding ${company} operations`,
    body: `Hi ${company} team...`,
  }
}

console.log('--- RUNNING LEADGEN PIPELINE FIXTURE TESTS ---')

// Test 1: mailto + body email extraction, filter .png fake emails
const html1 = `
  <html>
    <head><title>Acme Contracting Ltd | Commercial Builders</title></head>
    <body>
      <p>Reach us at <a href="mailto:info@acmecontracting.com">info@acmecontracting.com</a></p>
      <p>Direct line: <a href="tel:+966112345678">+966 11 234 5678</a></p>
      <img src="logo@2x.png" alt="logo">
      <span>Alternative email: sales@acmecontracting.com</span>
    </body>
  </html>
`
const res1 = extractContactsFromHtml(html1, 'https://acmecontracting.com/contact')
assert.equal(res1.company_name, 'Acme Contracting Ltd')
assert.ok(res1.emails.includes('info@acmecontracting.com'))
assert.ok(res1.emails.includes('sales@acmecontracting.com'))
assert.ok(!res1.emails.some(e => e.includes('.png')), 'Must filter .png fake emails')
assert.ok(res1.phones.includes('+966 11 234 5678'))
assert.equal(res1.extract_status, 'ok')
console.log('✓ Test 1 Passed: mailto, tel, text email, and .png filter verified')

// Test 2: Visible text phone regex (without tel: link)
const html2 = `
  <html>
    <head><title>Desert Sands Logistics - Riyadh</title></head>
    <body>
      <p>Call our central dispatcher directly: +971-4-321-9876 during UAE business hours.</p>
    </body>
  </html>
`
const res2 = extractContactsFromHtml(html2, 'https://desertsands.ae/about')
assert.ok(res2.phones.some(p => p.includes('321')), 'Phone regex extracted text phone number')
console.log('✓ Test 2 Passed: Text phone regex without tel: href verified')

// Test 3: Scoring fixtures
// No contact -> 25 / low
const noContact = { emails: [], phones: [], markdown_excerpt: 'Generic text with no matching ICP tokens' }
const score0 = computeLeadScore(noContact, 'commercial fitouts construction')
assert.equal(score0.score, 25)
assert.equal(score0.priority, 'low')
console.log('✓ Test 3a Passed: No contact = 25/low')

// Email only -> 25 + 35 = 60 / med
const emailOnly = { emails: ['test@example.com'], phones: [], markdown_excerpt: 'Welcome to our firm.' }
const score1 = computeLeadScore(emailOnly, 'commercial fitouts')
assert.equal(score1.score, 60)
assert.equal(score1.priority, 'med')
console.log('✓ Test 3b Passed: Email only = 60/med')

// Email + Phone -> 25 + 35 + 20 = 80 / high
const emailAndPhone = { emails: ['test@example.com'], phones: ['+966500000000'], markdown_excerpt: 'Welcome' }
const score2 = computeLeadScore(emailAndPhone, '')
assert.equal(score2.score, 80)
assert.equal(score2.priority, 'high')
console.log('✓ Test 3c Passed: Email + Phone = 80/high')

// ICP keyword boost caps at +20
const withIcp = {
  emails: ['contact@fitout.com'],
  phones: [],
  markdown_excerpt: 'Specialists in commercial construction enterprise fitouts engineering architecture project management',
}
const score3 = computeLeadScore(withIcp, 'commercial construction enterprise fitouts engineering architecture')
assert.equal(score3.icp_boost, 20, 'ICP boost should cap at +20')
assert.equal(score3.score, 25 + 35 + 20) // 80
assert.equal(score3.priority, 'high')
console.log('✓ Test 3d Passed: ICP boost correctly capped at +20')

// Test 4: Outreach draft rules
const draftNullNoContact = generateOutreachDraft({ contacts: noContact, score: 25, outreachMinScore: 50, enabled: true })
assert.equal(draftNullNoContact, null, 'Must be null when no contact exists')

const draftNullLowScore = generateOutreachDraft({ contacts: emailOnly, score: 45, outreachMinScore: 50, enabled: true })
assert.equal(draftNullLowScore, null, 'Must be null when score < outreachMinScore')

const draftValid = generateOutreachDraft({ contacts: emailOnly, score: 65, outreachMinScore: 50, enabled: true })
assert.ok(draftValid !== null, 'Draft generated when score >= 50 and contact exists')
assert.ok(draftValid.subject.includes('Partnership inquiry'))
console.log('✓ Test 4 Passed: Outreach draft generated only when qualified and contacts exist')

console.log('\nALL FIXTURE TESTS PASSED CLEANLY.')
