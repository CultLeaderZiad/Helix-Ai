'use client'

import { useState } from 'react'
import {
  PhoneCall,
  MessageSquare,
  Cpu,
  ShieldCheck,
  Calendar,
  Database,
  ArrowRight,
  CheckCircle2,
  Zap,
  Activity,
  Server,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemTemplate } from '@/lib/studio/templates'

interface StudioPipelineVisualizerProps {
  template: SystemTemplate
  brandName: string
  accentColor: string
  isAr?: boolean
}

export function StudioPipelineVisualizer({
  template,
  brandName,
  accentColor,
  isAr = false,
}: StudioPipelineVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<number>(0)

  const PIPELINE_NODES = [
    {
      id: 0,
      title: isAr ? 'نقطة استقبال الإشارة' : 'Inbound Ingest Gateway',
      icon: PhoneCall,
      protocol: 'HTTPS TLS 1.3 / Port 443',
      latency: '< 45ms',
      status: 'ONLINE',
      summary: isAr
        ? 'استقبال مكالمات الصوت والرسائل الواردة عبر السحابة'
        : 'Sub-50ms ingestion via Retell Voice AI & Meta WhatsApp Cloud API',
      specs: [
        { label: isAr ? 'بروتوكول البث' : 'Streaming Protocol', value: 'WebSocket Dual-Channel' },
        { label: isAr ? 'العزل' : 'Isolation', value: 'Postgres RLS' },
        { label: isAr ? 'هندسة التوافر' : 'Availability Architecture', value: isAr ? 'بوابة مخصصة عالية التوافر' : 'High Availability Gateway' },
      ],
    },
    {
      id: 1,
      title: isAr ? 'محرك استيعاب النوايا' : 'Intent Classifier & LLM Reasoner',
      icon: Cpu,
      protocol: 'Groq LPU / Llama 3.3 70B',
      latency: '110ms',
      status: 'VERIFIED',
      summary: isAr
        ? 'تحليل دقيق للاحتياج واللهجة (خليجية / فصحى / إنجليزية)'
        : 'High-speed dialect extraction with contextual Gulf Arabic & English tokenization',
      specs: [
        { label: isAr ? 'نموذج المعالجة' : 'Reasoning Model', value: 'Llama-3.3-70b-versatile' },
        { label: isAr ? 'حساسية الهلوسة' : 'Hallucination Policy', value: 'Zero Tolerance (Strict Context)' },
        { label: isAr ? 'معدل الرموز' : 'Inference Speed', value: '280 tokens/second' },
      ],
    },
    {
      id: 2,
      title: isAr ? 'سجل تدقيق الحقائق والأمان' : 'Ground-Truth Evidence Ledger',
      icon: ShieldCheck,
      protocol: 'SHA-256 Cryptographic Audit',
      latency: '< 15ms',
      status: 'LOCKED',
      summary: isAr
        ? 'تصنيف الحقائق: مؤكدة، محتملة، أو محالة للمراجعة البشرية'
        : 'Tri-state evidence triage: Verified, Probable, and Possible fact categorization',
      specs: [
        { label: isAr ? 'نوع العزل' : 'Data Isolation', value: 'PostgreSQL Row-Level Security' },
        { label: isAr ? 'بصمة التدقيق' : 'Audit Signature', value: 'SHA-256 Hashed Fact Trail' },
        { label: isAr ? 'شرط التعديل' : 'Write Permission', value: 'Verified Facts Only (Strict RLS)' },
      ],
    },
    {
      id: 3,
      title: isAr ? 'محرك تنفيذ الإجراءات والربط' : 'Autonomous Dispatch & Calendar Action',
      icon: Calendar,
      protocol: 'Cal.com / CRM API Webhook',
      latency: '85ms',
      status: 'READY',
      summary: isAr
        ? 'تثبيت الحجز في التقويم وإرسال تفاصيل الموعد والموقع فوراً'
        : 'Automated CRM deal registration, calendar slot locking, and WhatsApp itinerary delivery',
      specs: [
        { label: isAr ? 'إجراء الجدولة' : 'Calendar Action', value: 'Instant Multi-Provider Sync' },
        { label: isAr ? 'إشعار العميل' : 'Customer Dispatch', value: 'Official WhatsApp Business Cloud API' },
        { label: isAr ? 'تحويل للمشرف' : 'Human Hand-off', value: 'Escalation Alert < 2 seconds' },
      ],
    },
  ]

  const activeNode = PIPELINE_NODES[selectedNode]

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Topology Flow */}
      <div className="rounded-xl border border-border bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
              SYSTEM TOPOLOGY // {template.en.category.toUpperCase()}
            </span>
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
              {brandName} — {template[isAr ? 'ar' : 'en'].name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-raised px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              PIPELINE CONFIGURED
            </span>
            <span className="hidden sm:inline-block rounded-full border border-border bg-raised px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
              Telemetry Ingestion
            </span>
          </div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {PIPELINE_NODES.map((node, i) => {
            const isSelected = selectedNode === node.id
            const Icon = node.icon

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={cn(
                  'group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer text-left',
                  isSelected
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                    : 'border-border bg-panel hover:border-accent/40 hover:bg-raised'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg transition-colors',
                      isSelected ? 'bg-accent/15 text-accent' : 'bg-raised text-muted-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="rounded-full bg-raised border border-border px-2 py-0.5 text-[9px] font-mono text-muted-foreground">
                    {node.latency}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-muted-foreground mb-1">
                  NODE 0{node.id + 1}
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1 mb-1">
                  {node.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                  {node.summary}
                </p>

                {/* Status Dot */}
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">{node.protocol}</span>
                  <span
                    className={cn(
                      'font-semibold',
                      node.status === 'ONLINE' && 'text-accent',
                      node.status === 'VERIFIED' && 'text-accent',
                      node.status === 'LOCKED' && 'text-foreground',
                      node.status === 'READY' && 'text-muted-foreground'
                    )}
                  >
                    {node.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Deep Node Inspection Matrix */}
      <div className="rounded-xl border border-border bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {activeNode.title} — {isAr ? 'المواصفات الفنية المباشرة' : 'Live Technical Specifications'}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Protocol: {activeNode.protocol}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {activeNode.specs.map((spec, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-raised p-3.5 space-y-1"
            >
              <div className="text-[10px] uppercase font-mono text-muted-foreground">{spec.label}</div>
              <div className="font-semibold text-foreground text-xs sm:text-sm">{spec.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
