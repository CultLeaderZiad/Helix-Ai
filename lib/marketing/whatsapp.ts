import type { HelixLang } from '@/lib/public-prefs'

/** Helix business WhatsApp. Null until NEXT_PUBLIC_HELIX_WHATSAPP is set. */
export function helixWhatsAppHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_HELIX_WHATSAPP ?? ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}`
}

/**
 * Sign-in support link. Without NEXT_PUBLIC_HELIX_WHATSAPP the label is
 * contact and the href is /contact.
 */
export function loginSupportLink(
  lang: HelixLang,
  raw: string | null | undefined = process.env.NEXT_PUBLIC_HELIX_WHATSAPP,
): { href: string; label: string; external: boolean } {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) {
    return {
      href: '/contact',
      label: lang === 'ar' ? 'تواصل' : 'Contact',
      external: false,
    }
  }
  return {
    href: `https://wa.me/${digits}`,
    label: lang === 'ar' ? 'راسل دعم Helix على واتساب' : 'Message Helix support on WhatsApp',
    external: true,
  }
}
