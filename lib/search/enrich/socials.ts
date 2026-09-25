/**
 * Social Profile Link Extractor from HTML <a href> and JSON-LD sameAs.
 * Strictly adheres to §8.1 accept and reject patterns.
 */

export function extractSocials(html: string): Record<string, string> {
  const socials: Record<string, string> = {}
  if (!html) return socials

  const linkCandidates = new Set<string>()

  // 1. Collect href links
  const hrefMatches = html.matchAll(/href=['"]([^'"]+)['"]/gi)
  for (const m of hrefMatches) {
    const raw = m[1]?.trim()
    if (raw && (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//') || raw.startsWith('wa.me/'))) {
      linkCandidates.add(raw.startsWith('//') ? `https:${raw}` : raw.startsWith('wa.me/') ? `https://${raw}` : raw)
    }
  }

  // 2. Collect JSON-LD sameAs
  const jsonLdMatches = html.matchAll(/<script\b[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi)
  for (const jm of jsonLdMatches) {
    try {
      const data = JSON.parse(jm[1])
      const objects = Array.isArray(data) ? data : [data]
      for (const obj of objects) {
        if (obj?.sameAs) {
          const sameAsList = Array.isArray(obj.sameAs) ? obj.sameAs : [obj.sameAs]
          for (const s of sameAsList) {
            if (typeof s === 'string' && s.startsWith('http')) linkCandidates.add(s)
          }
        }
      }
    } catch {
      // ignore JSON parse errors in inline scripts
    }
  }

  for (const rawUrl of linkCandidates) {
    try {
      const parsed = new URL(rawUrl)
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
      const path = parsed.pathname

      // LinkedIn
      if (host.includes('linkedin.com') && !socials.linkedin) {
        if ((path.startsWith('/company/') || path.startsWith('/in/')) && !path.includes('shareArticle') && !path.includes('sharing')) {
          socials.linkedin = `https://${host}${path}`
        }
      }

      // Instagram
      if (host.includes('instagram.com') && !socials.instagram) {
        const parts = path.split('/').filter(Boolean)
        if (parts.length >= 1 && !['p', 'reel', 'explore', 'accounts', 'stories', 'tv'].includes(parts[0])) {
          socials.instagram = `https://instagram.com/${parts[0]}`
        }
      }

      // X / Twitter
      if ((host.includes('x.com') || host.includes('twitter.com')) && !socials.x) {
        const parts = path.split('/').filter(Boolean)
        if (parts.length >= 1 && !['intent', 'share', 'home', 'search', 'hashtag', 'i'].includes(parts[0])) {
          socials.x = `https://x.com/${parts[0]}`
        }
      }

      // Facebook
      if (host.includes('facebook.com') && !socials.facebook) {
        if (!path.includes('sharer.php') && !path.includes('/dialog/') && !path.includes('/plugins/')) {
          const parts = path.split('/').filter(Boolean)
          if (parts.length >= 1 && !['share', 'pages', 'groups'].includes(parts[0])) {
            socials.facebook = `https://facebook.com/${parts[0]}`
          }
        }
      }

      // TikTok
      if (host.includes('tiktok.com') && !socials.tiktok) {
        if (path.includes('@') && !path.includes('/embed')) {
          const handle = path.split('@')[1]?.split('/')[0]
          if (handle) socials.tiktok = `https://tiktok.com/@${handle}`
        }
      }

      // WhatsApp
      if ((host.includes('wa.me') || host.includes('whatsapp.com')) && !socials.whatsapp) {
        if (host.includes('wa.me')) {
          const digits = path.replace(/\D/g, '')
          if (digits.length >= 7) socials.whatsapp = `https://wa.me/${digits}`
        } else if (parsed.searchParams.get('phone')) {
          const digits = (parsed.searchParams.get('phone') || '').replace(/\D/g, '')
          if (digits.length >= 7) socials.whatsapp = `https://wa.me/${digits}`
        }
      }

      // YouTube
      if (host.includes('youtube.com') && !socials.youtube) {
        if ((path.startsWith('/@') || path.startsWith('/channel/')) && !path.includes('/watch') && !path.includes('/embed')) {
          socials.youtube = `https://youtube.com${path}`
        }
      }
    } catch {
      // ignore URL parse errors
    }
  }

  return socials
}

export const extractSocialLinks = extractSocials
