import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'

const base = process.env.SCREENSHOT_BASE || 'http://127.0.0.1:3456'
const chrome = process.env.CHROME_PATH || '/usr/local/bin/google-chrome'
const outDir = 'docs/design/v5/screens'
const compareDir = 'docs/design/v5/compare'

const publicRoutes = [
  ['home', '/'],
  ['pricing', '/pricing'],
  ['studio', '/studio'],
  ['about', '/about'],
  ['contact', '/contact'],
  ['faq', '/faq'],
  ['updates', '/updates'],
  ['privacy', '/privacy'],
  ['terms', '/terms'],
  ['system', '/systems/missed-call-responder'],
  ['login', '/login'],
  ['signup', '/signup'],
  ['forgot', '/forgot-password'],
  ['not-found', '/this-page-does-not-exist'],
]

const appRoutes = [
  ['dashboard', '/dashboard'],
  ['queue', '/dashboard/queue'],
  ['conversations', '/dashboard/conversations'],
  ['contacts', '/dashboard/contacts'],
  ['bookings', '/dashboard/bookings'],
  ['leadgen', '/dashboard/lead-generation'],
  ['search', '/dashboard/search'],
  ['reports', '/dashboard/reports'],
  ['billing', '/dashboard/billing'],
  ['integrations', '/dashboard/integrations'],
  ['support', '/dashboard/support'],
  ['systems-app', '/dashboard/systems'],
  ['settings', '/dashboard/settings'],
  ['admin', '/admin'],
  ['admin-crm', '/admin/crm'],
  ['admin-queue', '/admin/queue'],
  ['admin-leadgen', '/admin/leadgen'],
  ['admin-analytics', '/admin/analytics'],
  ['admin-support', '/admin/support'],
  ['admin-pricing', '/admin/pricing'],
  ['admin-updates', '/admin/updates'],
  ['admin-faq', '/admin/faq'],
  ['admin-playbooks', '/admin/playbooks'],
  ['admin-studio', '/admin/studio'],
  ['admin-users', '/admin/users'],
  ['admin-webhooks', '/admin/webhooks'],
]

const widths = [
  [1440, 900],
  [390, 844],
]

const email = process.env.HELIX_CLIENT_EMAIL
const password = process.env.HELIX_CLIENT_PASSWORD
const adminEmail = process.env.HELIX_ADMIN_EMAIL
const adminPassword = process.env.HELIX_ADMIN_PASSWORD

function cookies(lang, theme) {
  return [
    { name: 'helix_lang', value: lang, url: base },
    { name: 'helix-lang', value: lang, url: base },
    { name: 'helix_theme', value: theme, url: base },
  ]
}

async function shoot(page, name, path, lang, theme, width, height) {
  await page.setViewportSize({ width, height })
  const response = await page.goto(base + path, { waitUntil: 'load', timeout: 45000 }).catch(() => null)
  const status = response ? response.status() : 0
  const file = join(outDir, `${name}-${lang}-${theme}-${width}.png`)
  await mkdir(dirname(file), { recursive: true })
  await page.screenshot({ path: file, fullPage: true })
  return { file, status, final: page.url() }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: chrome,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const report = []
  const hrefs = new Set()
  const context = await browser.newContext()
  const page = await context.newPage()

  for (const lang of ['en', 'ar']) {
    for (const theme of ['night', 'day']) {
      await context.clearCookies()
      await context.addCookies(cookies(lang, theme))
      for (const [name, path] of publicRoutes) {
        for (const [width, height] of widths) {
          const shot = await shoot(page, name, path, lang, theme === 'night' ? 'dark' : 'light', width, height)
          report.push({ route: path, ...shot })
          const links = await page.$$eval('a[href]', nodes => nodes.map(node => node.getAttribute('href'))).catch(() => [])
          for (const href of links) {
            if (href && href.startsWith('/') && !href.startsWith('//')) hrefs.add(href.split('#')[0].split('?')[0])
          }
          process.stdout.write(`shot ${shot.file} ${shot.status}\n`)
        }
      }
    }
  }

  if (email && password) {
  await context.clearCookies()
  await context.addCookies(cookies('en', 'day'))
  for (const [name, path] of appRoutes) {
    const shot = await shoot(page, name, path, 'en', 'light', 1440, 900)
    report.push({ route: path, ...shot, note: email ? 'signed-in attempt follows' : 'no HELIX_CLIENT_EMAIL, captured the signed-out result' })
    process.stdout.write(`shot ${shot.file} ${shot.status} -> ${shot.final}\n`)
  }
  }

  const broken = []
  for (const href of [...hrefs].sort()) {
    if (!href || href.startsWith('/api') || href.startsWith('/auth/callback')) continue
    const response = await page.goto(base + href, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null)
    const status = response ? response.status() : 0
    if (status >= 400) broken.push(`${status} ${href}`)
  }

  await mkdir(compareDir, { recursive: true })
  await writeFile(join(outDir, 'report.json'), JSON.stringify({ report, broken, hrefs: [...hrefs] }, null, 2))
  await browser.close()
  if (broken.length) {
    console.error('Broken internal links:\n' + broken.join('\n'))
    process.exit(1)
  }
  console.log(`Captured ${report.length} screenshots.`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
