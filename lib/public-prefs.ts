import 'server-only'

import { cookies } from 'next/headers'

export type HelixTheme = 'night' | 'day'
export type HelixLang = 'en' | 'ar'

export async function getPublicPrefs(): Promise<{ theme: HelixTheme; lang: HelixLang }> {
  const jar = await cookies()
  const theme: HelixTheme = jar.get('helix_theme')?.value === 'day' ? 'day' : 'night'
  const lang: HelixLang = jar.get('helix_lang')?.value === 'ar' ? 'ar' : 'en'
  return { theme, lang }
}
