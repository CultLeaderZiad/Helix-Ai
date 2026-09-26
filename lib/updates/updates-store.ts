import fs from 'fs'
import path from 'path'

export interface PlatformUpdate {
  id: string
  version: string
  date: string
  title: string
  title_ar?: string
  category: string
  category_ar?: string
  is_published: boolean
  highlights: string[]
  highlights_ar?: string[]
}

const UPDATES_FILE_PATH = path.join(process.cwd(), 'data', 'updates.json')

const DEFAULT_UPDATES: PlatformUpdate[] = [
  {
    id: 'rel-2-4-0',
    version: 'v2.4.0',
    date: 'September 2026',
    title: 'A clearer sign-in for your team',
    title_ar: 'دخول أوضح لفريقك',
    category: 'Workspace',
    category_ar: 'مساحة العمل',
    is_published: true,
    highlights: [
      'You sign in and land in the right workspace.',
      'The public site is easier to read on a phone.',
    ],
    highlights_ar: [
      'تسجّل الدخول وتصل إلى مساحة العمل المناسبة.',
      'الموقع العام أسهل قراءة على الهاتف.',
    ],
  },
  {
    id: 'rel-2-3-1',
    version: 'v2.3.1',
    date: 'August 2026',
    title: 'Missed-call replies you can see',
    title_ar: 'ردود المكالمات الفائتة ظاهرة لك',
    category: 'Inbox',
    category_ar: 'الوارد',
    is_published: true,
    highlights: [
      'WhatsApp replies after a missed call show in your dashboard.',
      'Bookings from your real calendar appear in the activity feed.',
    ],
    highlights_ar: [
      'ردود واتساب بعد المكالمة الفائتة تظهر في لوحتك.',
      'الحجوزات من تقويمك الحقيقي تظهر في سجل النشاط.',
    ],
  },
  {
    id: 'rel-2-2-0',
    version: 'v2.2.0',
    date: 'July 2026',
    title: 'A review queue for anything uncertain',
    title_ar: 'قائمة مراجعة لما هو غير مؤكد',
    category: 'Review',
    category_ar: 'المراجعة',
    is_published: true,
    highlights: [
      'If the system is unsure, it waits for someone on your team.',
      'You can export a plain summary of conversations and bookings.',
    ],
    highlights_ar: [
      'إذا لم يكن النظام متأكداً، ينتظر أحداً من فريقك.',
      'يمكنك تصدير ملخص واضح للمحادثات والحجوزات.',
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
