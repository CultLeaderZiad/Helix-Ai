import Link from 'next/link'
import type { ReactNode } from 'react'
import { helixWhatsAppHref } from '@/lib/marketing/whatsapp'

export function WhatsAppCta({
  ar,
  className,
  labelEn,
  labelAr,
  fallbackEn = 'Contact us',
  fallbackAr = 'تواصل معنا',
  children,
}: {
  ar: boolean
  className?: string
  labelEn: string
  labelAr: string
  fallbackEn?: string
  fallbackAr?: string
  children?: ReactNode
}) {
  const href = helixWhatsAppHref()
  const icon = children ?? null
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {icon}
        {ar ? labelAr : labelEn}
      </a>
    )
  }
  return (
    <Link className={className} href="/contact">
      {icon}
      {ar ? fallbackAr : fallbackEn}
    </Link>
  )
}
