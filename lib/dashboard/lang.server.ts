import 'server-only'
import { cookies } from 'next/headers'
import type { DashLang, DashTheme } from '@/lib/dashboard/lang'

/** Prefer helix_lang. Fall back to the legacy helix-lang cookie. */
export async function readDashLang(): Promise<DashLang> {
  const jar = await cookies()
  const primary = jar.get('helix_lang')?.value
  if (primary === 'ar' || primary === 'en') return primary
  return jar.get('helix-lang')?.value === 'ar' ? 'ar' : 'en'
}

/** Dashboard defaults to light (day) unless helix_theme is night. */
export async function readDashTheme(): Promise<DashTheme> {
  const jar = await cookies()
  return jar.get('helix_theme')?.value === 'night' ? 'night' : 'day'
}
