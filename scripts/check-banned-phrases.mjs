import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['app', 'components', 'features', 'lib', 'content', 'data']
const skip = new Set(['node_modules', '.next', '.git'])

// Allowlist: hits under these prefixes are reported and do not fail the check.
// docs/                         — design notes may quote retired claims
// app/admin/webhooks            — webhook console technical labels
// components/admin/webhooks-manager-view.tsx — same console
// supabase/                     — SQL migrations
const allowlist = [
  'docs/',
  'app/admin/webhooks',
  'components/admin/webhooks-manager-view.tsx',
  'supabase/',
]

const needles = [
  '7-day',
  'free trial',
  'unrestricted',
  'no credit card',
  'تجربة مجانية',
  'بدون بطاقة',
  '99.9',
  'zero hallucination',
  'cryptographic',
  'sha-256',
  'evidence ledger',
  '24/7',
  'most popular',
  'الأكثر طلباً',
  'client_exec',
  '#38bdf8',
  '#0ea5e9',
  'technical account manager in dubai',
  'most booked',
  'highest roi',
  'صفر هلوسة',
]

function normalize(path) {
  return path.split('\\').join('/')
}

function isAllowlisted(path) {
  const norm = normalize(path)
  return allowlist.some(prefix => norm === prefix || norm.startsWith(prefix))
}

const hits = []
const allowedHits = []

function walk(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path)
      continue
    }
    if (!/\.(tsx?|jsx?|mjs|mdx|md)$/.test(name)) continue
    const text = readFileSync(path, 'utf8').toLowerCase()
    for (const needle of needles) {
      if (!text.includes(needle.toLowerCase())) continue
      const line = `${normalize(path)}: ${needle}`
      if (isAllowlisted(path)) allowedHits.push(line)
      else hits.push(line)
    }
  }
}

for (const root of roots) walk(root)

if (allowedHits.length) {
  console.log('Allowlisted phrase hits (not failing):\n' + allowedHits.join('\n'))
}

if (hits.length) {
  console.error('Banned phrases found:\n' + hits.join('\n'))
  process.exit(1)
}

console.log('Banned-phrase check passed.')
