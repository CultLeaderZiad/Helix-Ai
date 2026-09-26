import 'server-only'

import { cookies } from 'next/headers'

export type HelixTheme = 'night' | 'day'
export type HelixLang = 'en' | 'ar'

export async function getPublicPrefs(): Promise<{ theme: HelixTheme; lang: HelixLang; themeChosen: boolean }> {
  const jar = await cookies()
  const rawTheme = jar.get('helix_theme')?.value
  const themeChosen = rawTheme === 'day' || rawTheme === 'night'
  const theme: HelixTheme = rawTheme === 'day' ? 'day' : 'night'
  const langCookie = jar.get('helix_lang')?.value ?? jar.get('helix-lang')?.value
  const lang: HelixLang = langCookie === 'ar' ? 'ar' : 'en'
  return { theme, lang, themeChosen }
}
