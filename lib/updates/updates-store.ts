import fs from 'fs'
import path from 'path'

export interface PlatformUpdate {
  id: string
  version: string
  date: string
  title: string
  category: string
  is_published: boolean
  highlights: string[]
}

const UPDATES_FILE_PATH = path.join(process.cwd(), 'data', 'updates.json')

const DEFAULT_UPDATES: PlatformUpdate[] = [
  {
    id: 'rel-2-4-0',
    version: 'v2.4.0',
    date: 'September 2026',
    title: 'Dual-workspace authentication & cross-tenant RLS isolation',
    category: 'Core Architecture',
    is_published: true,
    highlights: [
      'Segmented authentication supporting Agency Operator and Client Portal routing.',
      'Hardware-level PostgreSQL RLS enforcement with tenant-scoped cryptographic tokens.',
      'Public navigation redesign with high-contrast framing and mobile-first touch targets.',
    ],
  },
  {
    id: 'rel-2-3-1',
    version: 'v2.3.1',
    date: 'August 2026',
    title: 'Realtime telemetry ingest and webhook integrity validation',
    category: 'Integrations',
    is_published: true,
    highlights: [
      'Sub-50ms ingestion pipeline for Retell AI, Vapi, and Bland AI voice sessions.',
      'Automated HMAC-SHA256 signature verification on incoming webhooks.',
      'Real-time confidence scoring matrix for extracted caller intentions.',
    ],
  },
  {
    id: 'rel-2-2-0',
    version: 'v2.2.0',
    date: 'July 2026',
    title: 'Operational truth engine & human-in-the-loop review queues',
    category: 'Security Hardening',
    is_published: true,
    highlights: [
      'Tri-state evidence tagging: verified, probable, and possible assertions.',
      'One-click dispute resolution for agency administrators with audit trails.',
      'Automated CSV & JSON log exports for enterprise compliance audits.',
    ],
  },
]

export function getUpdates(includeUnpublished = false): PlatformUpdate[] {
  try {
    if (!fs.existsSync(UPDATES_FILE_PATH)) {
      saveUpdates(DEFAULT_UPDATES)
      return includeUnpublished ? DEFAULT_UPDATES : DEFAULT_UPDATES.filter((u) => u.is_published)
    }
    const raw = fs.readFileSync(UPDATES_FILE_PATH, 'utf-8')
    const parsed: PlatformUpdate[] = JSON.parse(raw)
    return includeUnpublished ? parsed : parsed.filter((u) => u.is_published)
  } catch (error) {
    console.error('Failed to read updates.json:', error)
    return includeUnpublished ? DEFAULT_UPDATES : DEFAULT_UPDATES.filter((u) => u.is_published)
  }
}

export function saveUpdates(updates: PlatformUpdate[]): boolean {
  try {
    const dir = path.dirname(UPDATES_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(UPDATES_FILE_PATH, JSON.stringify(updates, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to write updates.json:', error)
    return false
  }
}

export function createUpdate(update: Omit<PlatformUpdate, 'id'>): PlatformUpdate | null {
  const updates = getUpdates(true)
  const newUpdate: PlatformUpdate = {
    ...update,
    id: `rel-${Date.now()}`,
  }
  updates.unshift(newUpdate)
  const ok = saveUpdates(updates)
  return ok ? newUpdate : null
}

export function updateRelease(id: string, updatedFields: Partial<PlatformUpdate>): boolean {
  const updates = getUpdates(true)
  const index = updates.findIndex((u) => u.id === id)
  if (index === -1) return false

  updates[index] = { ...updates[index], ...updatedFields }
  return saveUpdates(updates)
}

export function deleteUpdate(id: string): boolean {
  const updates = getUpdates(true)
  const filtered = updates.filter((u) => u.id !== id)
  return saveUpdates(filtered)
}

export function togglePublishUpdate(id: string): boolean {
  const updates = getUpdates(true)
  const index = updates.findIndex((u) => u.id === id)
  if (index === -1) return false

  updates[index].is_published = !updates[index].is_published
  return saveUpdates(updates)
}
