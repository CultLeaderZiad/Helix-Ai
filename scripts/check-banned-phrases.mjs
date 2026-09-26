import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['app', 'components', 'lib']
const skip = new Set(['node_modules', '.next', 'docs'])
const needles = [
  '99.9%',
  '99.9٪',
  '99.98%',
  '99.99%',
  'zero hallucination',
  'Ground-Truth Evidence Ledger',
  'Technical Account Manager in Dubai',
  'Most booked',
  'Highest ROI',
  'unrestricted trial',
  'no credit card',
  'الأكثر طلباً',
  'صفر هلوسة',
  'CLIENT_EXEC',
]

const hits = []

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) walk(path)
    else if (/\.(tsx?|jsx?|mjs|mdx)$/.test(name)) {
      const text = readFileSync(path, 'utf8')
      for (const needle of needles) {
        if (text.includes(needle)) hits.push(`${path}: ${needle}`)
      }
    }
  }
}

for (const root of roots) walk(root)
if (hits.length) {
  console.error('Banned phrases found:\n' + hits.join('\n'))
  process.exit(1)
}
console.log('Banned-phrase check passed.')
