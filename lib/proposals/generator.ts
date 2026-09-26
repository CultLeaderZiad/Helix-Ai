import type { RegionTier } from '@/lib/schema'

export interface ProposalItem {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  type: 'setup' | 'retainer' | 'addon'
  amountCents: number
}

export interface ProposalDocument {
  id: string
  dealId: string
  clientId: string
  clientBusinessName: string
  brandName: string
  regionTier: RegionTier
  currency: string
  stage: 'proposal_sent'
  items: ProposalItem[]
  totalSetupCents: number
  monthlyRetainerCents: number
  totalFirstMonthCents: number
  paymentLink: string
  createdAt: string
  expiresAt: string
  slaTerms: string[]
  slaTermsAr: string[]
}

export function buildBespokeProposal({
  proposalId,
  dealId,
  clientId,
  clientBusinessName,
  brandName,
  systemName = 'Autonomous Voice & WhatsApp Engine',
  systemNameAr = 'محرك الصوت والواتساب الذكي',
  regionTier = 'gcc_enterprise',
  currency = 'AED',
  setupFeeCents = 450000,
  monthlyRetainerCents = 180000,
}: {
  proposalId: string
  dealId: string
  clientId: string
  clientBusinessName: string
  brandName: string
  systemName?: string
  systemNameAr?: string
  regionTier?: RegionTier
  currency?: string
  setupFeeCents?: number
  monthlyRetainerCents?: number
}): ProposalDocument {
  const items: ProposalItem[] = [
    {
      name: `Core Architecture Provisioning: ${systemName}`,
      nameAr: `تأسيس وبرمجة البنية المعمارية الأساسية: ${systemNameAr}`,
      description:
        'WhatsApp Business connection, calendar sync, and calibration of replies to your services and hours.',
      descriptionAr:
        'تهيئة خطوط الاتصال الهاتفية SIP، توثيق حساب الواتساب التجاري مع Meta، تفعيل عزل قاعدة البيانات، وضبط النماذج الذكية.',
      type: 'setup',
      amountCents: setupFeeCents,
    },
    {
      name: 'Monthly operations retainer',
      nameAr: 'الاشتراك الشهري للإشراف التشغيلي وتدقيق الأدلة الحية',
      description:
        'Human review of anything uncertain, and a weekly activity log.',
      descriptionAr:
        'مراجعة بشرية لأي معلومة غير مؤكدة، وتقرير نشاط أسبوعي.',
      type: 'retainer',
      amountCents: monthlyRetainerCents,
    },
  ]

  const totalSetupCents = setupFeeCents
  const totalFirstMonthCents = setupFeeCents + monthlyRetainerCents
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()

  // Generate localized payment link
  const paymentLink = `/checkout?proposal=${proposalId}&deal=${dealId}&amount=${totalFirstMonthCents}&currency=${currency}`

  const slaTerms = [
    'Monitoring on voice and WhatsApp connections, with issues escalated to your team.',
    'Cryptographic RLS Guarantee: zero cross-tenant database access across profiles and contacts.',
    'Human Attention Queue: any observation with confidence < 85% is routed to supervisory review prior to state modification.',
    'Compliant Data Residence: all customer transcripts processed via paid enterprise APIs with zero model training.',
  ]

  const slaTermsAr = [
    'متابعة اتصالات الصوت وواتساب، مع تصعيد الأعطال إلى فريقك.',
    'عزل تام لبيانات المؤسسة على مستوى قاعدة البيانات PostgreSQL RLS دون أي تداخل مع أي عميل آخر.',
    'إشراف بشري إلزامي: أي معلومة تقل نسبة الثقة فيها عن 85% تُحوّل للإدارة قبل تحديث أي سجل.',
    'حماية الخصوصية: جميع البيانات تُعالج عبر خوادم مؤسسية مدفوعة لا تستخدم بياناتكم في تدريب النماذج.',
  ]

  return {
    id: proposalId,
    dealId,
    clientId,
    clientBusinessName,
    brandName,
    regionTier,
    currency,
    stage: 'proposal_sent',
    items,
    totalSetupCents,
    monthlyRetainerCents,
    totalFirstMonthCents,
    paymentLink,
    createdAt: now.toISOString(),
    expiresAt,
    slaTerms,
    slaTermsAr,
  }
}
