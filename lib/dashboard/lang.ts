export type DashLang = 'en' | 'ar'
export type DashTheme = 'day' | 'night'

export function tx(lang: DashLang, en: string, ar: string): string {
  return lang === 'ar' ? ar : en
}

export function dubaiHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: 'Asia/Dubai',
  }).formatToParts(date)
  return Number(parts.find(part => part.type === 'hour')?.value ?? '8')
}

export function greetingTitle(lang: DashLang, firstName: string | null): string {
  const hour = dubaiHour()
  const hello =
    hour < 12
      ? tx(lang, 'Good morning', 'صباح الخير')
      : hour < 17
        ? tx(lang, 'Good afternoon', 'طاب يومك')
        : tx(lang, 'Good evening', 'مساء الخير')
  if (!firstName) return hello
  return lang === 'ar' ? `${hello} يا ${firstName}` : `${hello}, ${firstName}`
}

export function welcomeTitle(lang: DashLang, firstName: string | null): string {
  if (!firstName) return tx(lang, 'Welcome to Helix', 'مرحباً بك في Helix')
  return lang === 'ar' ? `مرحباً بك في Helix يا ${firstName}` : `Welcome to Helix, ${firstName}`
}
