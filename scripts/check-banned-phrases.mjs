import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['app', 'components', 'features', 'lib', 'content', 'data']
const skip = new Set(['node_modules', '.next', '.git'])

// Allowlist: hits under these prefixes are reported and do not fail the check.
// docs/ is not scanned. Admin webhook screens may name the transport.
// supabase/ holds SQL migrations and is not scanned here.
const allowlist = [
  'docs/',
  'app/admin/webhooks',
  'components/admin/webhooks-manager-view.tsx',
  'supabase/',
]

const globalNeedles = [
  '7-day',
  'free trial',
  'start free trial',
  'unrestricted',
  'no credit card',
  'تجربة ٧',
  'تجربة 7',
  '7 أيام',
  'تجربة مجانية',
  'بدون بطاقة',
  '99.9',
  '99.98',
  '99.99',
  'uptime sla',
  'zero hallucination',
  'صفر هلوسة',
  'ground-truth',
  'evidence ledger',
  'cryptographic',
  'sha-256',
  'technical account manager',
  '24/7',
  'most booked',
  'highest roi',
  'most popular',
  'الأكثر طلباً',
  'الأكثر حجزاً',
  'أعلى عائد',
  'client_exec',
  'lorem',
  '#38bdf8',
  '#0ea5e9',
  "it's not ",
  'not just ',
  'more than just ',
  'supercharge',
  'seamless',
  'unleash',
  'revolutionize',
  'game-changer',
  'cutting-edge',
]

// Single tokens that must not match inside longer identifiers.
const globalTokens = ['vip']

const clientPrefixes = [
  'app/(marketing)',
  'app/(auth)',
  'app/login',
  'app/signup',
  'app/forgot-password',
  'app/reset-password',
  'app/dashboard',
  'components/marketing',
  'components/auth',
  'components/dashboard',
  'features/',
  'lib/pricing',
  'lib/studio',
  'lib/updates',
  'data/',
]

const clientNeedles = [
  'telemetry',
  'webhook',
  'n8n',
  'supabase',
  'postgres',
  'orchestration',
  'agentic',
  'scrapling',
]

const clientTokens = ['tenant', 'rls', 'sip', 'gpu', 'pipeline', 'llm', 'hmac', 'autonomous', 'console']

const fontTokens = ['geist', 'inter', 'space_grotesk']

function normalize(path) {
  return path.split('\\').join('/')
}

function isAllowlisted(path) {
  const norm = normalize(path)
  return allowlist.some(prefix => norm === prefix || norm.startsWith(prefix))
}

function isClientSurface(path) {
  const norm = normalize(path)
  return clientPrefixes.some(prefix => norm === prefix || norm.startsWith(prefix))
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/^\s*import\s.+$/gm, '')
}

function hasToken(text, token) {
  // Hyphen, slash and dot stay attached so import paths and file names are not copy.
  const re = new RegExp(`(?<![A-Za-z0-9_./@-])${token}(?![A-Za-z0-9_./-])`, 'i')
  return re.test(text)
}

function hasPhrase(text, needle) {
  return text.toLowerCase().includes(needle.toLowerCase())
}

function copyText(source) {
  const chunks = []
  const str = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
  let match
  while ((match = str.exec(source))) chunks.push(match[2])
  const jsx = />([^<>{}]+)</g
  while ((match = jsx.exec(source))) chunks.push(match[1])
  return chunks.join('\n')
}


const hits = []
const allowedHits = []

function record(path, needle) {
  const line = `${normalize(path)}: ${needle}`
  if (isAllowlisted(path)) allowedHits.push(line)
  else hits.push(line)
}

function walk(dir) {
  if (!existsSync(dir)) return
  if (statSync(dir).isFile()) {
    scan(dir)
    return
  }
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path)
      continue
    }
    scan(path)
  }
}

function scan(path) {
  if (!/\.(tsx?|jsx?|mjs|mdx|json)$/.test(path)) return
  const raw = readFileSync(path, 'utf8')
    const text = stripComments(raw)
    for (const needle of globalNeedles) {
      if (hasPhrase(text, needle)) record(path, needle)
    }
    for (const token of globalTokens) {
      if (hasToken(text, token)) record(path, token)
    }
    if (text.includes('\u2014')) record(path, 'em dash')
    if (isClientSurface(path)) {
      const visible = copyText(text)
      for (const needle of clientNeedles) {
        if (hasToken(visible, needle)) record(path, needle)
      }
      for (const token of clientTokens) {
        if (hasToken(visible, token)) record(path, token)
      }
    }
    const norm = normalize(path)
    if (norm.startsWith('app/') || norm.startsWith('components/')) {
      for (const token of fontTokens) {
        if (hasToken(text, token)) record(path, token)
      }
    }
}

for (const root of roots) walk(root)

const publicDir = 'public'
if (existsSync(publicDir)) {
  for (const name of readdirSync(publicDir)) {
    if (name.endsWith('.json')) walk(join(publicDir, name))
  }
}

if (allowedHits.length) {
  console.log('Allowlisted phrase hits (not failing):\n' + allowedHits.join('\n'))
}

if (hits.length) {
  console.error('Banned phrases found:\n' + hits.join('\n'))
  process.exit(1)
}

console.log('Banned-phrase check passed.')
