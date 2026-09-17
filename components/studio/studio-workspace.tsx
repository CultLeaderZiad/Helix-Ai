'use client'

import { useState, useTransition } from 'react'
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Send,
  Calendar,
  PhoneCall,
  Activity,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  X,
  Languages,
  MessageSquare,
  Play,
  Cpu,
  Layers,
  Terminal,
  Sliders,
  TrendingUp,
  MapPin,
  ExternalLink,
  Lock,
} from 'lucide-react'
import { SYSTEM_TEMPLATES, type SystemTemplate } from '@/lib/studio/templates'
import { requestSystemBuild, type RequestBuildResult } from '@/lib/studio/request-build'
import dynamic from 'next/dynamic'

const panelLoading = () => <p role="status" className="min-h-64 p-8 text-slate-400">Loading studio panel…</p>
const StudioMotionDemo = dynamic(() => import('./studio-motion-demo').then(mod => mod.StudioMotionDemo), { loading: panelLoading })
const StudioPipelineVisualizer = dynamic(() => import('./studio-pipeline-visualizer').then(mod => mod.StudioPipelineVisualizer), { loading: panelLoading })
const StudioInteractiveSimulator = dynamic(() => import('./studio-interactive-simulator').then(mod => mod.StudioInteractiveSimulator), { loading: panelLoading })
const StudioDirectivesGuardrails = dynamic(() => import('./studio-directives-guardrails').then(mod => mod.StudioDirectivesGuardrails), { loading: panelLoading })
const StudioRoiCalculator = dynamic(() => import('./studio-roi-calculator').then(mod => mod.StudioRoiCalculator), { loading: panelLoading })
const StudioAgentIde = dynamic(() => import('./studio-agent-ide').then(mod => mod.StudioAgentIde), { loading: panelLoading })
import { cn } from '@/lib/utils'

const COLOR_PRESETS = [
  { name: 'Electric Cyan', hex: '#00d2ff', ring: 'ring-[#00d2ff]' },
  { name: 'Emerald Neo', hex: '#10b981', ring: 'ring-[#10b981]' },
  { name: 'Cyber Violet', hex: '#a855f7', ring: 'ring-[#a855f7]' },
  { name: 'Solar Amber', hex: '#f59e0b', ring: 'ring-[#f59e0b]' },
  { name: 'Hyper Rose', hex: '#f43f5e', ring: 'ring-[#f43f5e]' },
]

type StudioMachineTab = 'topology' | 'simulator' | 'directives' | 'branded_preview' | 'roi'

export function StudioWorkspace({ initialClientName }: { initialClientName?: string }) {
  const [selectedTemplate, setSelectedTemplate] = useState<SystemTemplate>(SYSTEM_TEMPLATES[0])
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'

  const [brandName, setBrandName] = useState(
    initialClientName || (isAr ? 'مختبرات القمة الطبية' : 'Apex Health Labs')
  )
  const [accentColor, setAccentColor] = useState(COLOR_PRESETS[0].hex)
  const [machineTab, setMachineTab] = useState<StudioMachineTab>('topology')
  const [studioMode, setStudioMode] = useState<'ide' | 'classic'>('ide')
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const [isPending, startTransition] = useTransition()
  const [modalResult, setModalResult] = useState<RequestBuildResult | null>(null)
  const [showDemoModal, setShowDemoModal] = useState(false)

  const content = selectedTemplate[language]

  const handleRequestBuild = () => {
    startTransition(async () => {
      const res = await requestSystemBuild(selectedTemplate.id, {
        brandName,
        accentColor,
        themeVariant: 'cyber-dark',
      })
      setModalResult(res)
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Cpu className="size-3.5" />
            {isAr ? 'مختبر هندسة الأتمتة الذكية' : 'Autonomous Systems Engineering Studio'}
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {isAr ? 'استوديو محاكاة وبرمجة الأنظمة الذكية' : 'Interactive Architecture Machine'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            {isAr
              ? 'صمم واختبر خطوط الأتمتة الصوتية وتدفقات الواتساب التفاعلية مع تدقيق الحقائق وعزل RLS.'
              : 'Inspect live execution topologies, test simulated caller dialogues, calibrate prompt directives, and model economic ROI.'}
          </p>
        </div>

        {/* Top Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Studio Mode Switcher: Agent IDE vs Classic Machine */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-[#0c1424] p-1">
            <button
              type="button"
              onClick={() => setStudioMode('ide')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors',
                studioMode === 'ide'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Terminal className="size-3.5 text-cyan-400" />
              <span>Agent Studio IDE</span>
            </button>
            <button
              type="button"
              onClick={() => setStudioMode('classic')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors',
                studioMode === 'classic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Layers className="size-3.5 text-purple-400" />
              <span>Classic Machine</span>
            </button>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-[#0c1424] p-1">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors',
                language === 'en'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors',
                language === 'ar'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              عربي
            </button>
          </div>

          {/* Watch 15s Walkthrough */}
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all shadow-xs"
          >
            <Play className="size-3.5 fill-purple-300 text-purple-300" />
            <span>{isAr ? 'عرض توضيحي للمنصة (15 ث)' : 'Watch 15s Walkthrough'}</span>
          </button>
        </div>
      </div>

      {studioMode === 'ide' ? (
        <StudioAgentIde initialClientName={brandName} />
      ) : (
        <>
          {/* Telemetry Status Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-[#0c1424] p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Inference SLA</div>
                <div className="text-xs sm:text-sm font-bold text-white">38ms LPU / Sub-400ms Voice</div>
              </div>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c1424] p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">WhatsApp Gateway</div>
                <div className="text-xs sm:text-sm font-bold text-emerald-400">Meta Cloud v21.0 Active</div>
              </div>
              <span className="size-2 rounded-full bg-emerald-400" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c1424] p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Tenancy Isolation</div>
                <div className="text-xs sm:text-sm font-bold text-cyan-400">PostgreSQL RLS Hardware</div>
              </div>
              <ShieldCheck className="size-4 text-cyan-400" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0c1424] p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-500">Dialect Support</div>
                <div className="text-xs sm:text-sm font-bold text-purple-300">Gulf, Egypt &amp; English</div>
              </div>
              <Activity className="size-4 text-purple-400" />
            </div>
          </div>

          {/* Template Selector Carousel Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {SYSTEM_TEMPLATES.map((template) => {
              const isSelected = selectedTemplate.id === template.id
              const templateContent = template[language]

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    'group flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.25)]'
                      : 'border border-slate-800 bg-[#0e1628] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  )}
                >
                  <span>{templateContent.name}</span>
                  {template.badge && (
                    <span className="rounded-full bg-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-200">
                      {template.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Main Studio Machine Shell */}
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 sm:p-6 shadow-2xl space-y-6">
            {/* Customization Bar: Brand Name & Accent Color */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-800/80 pb-5">
              <div className="md:col-span-6 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {isAr ? 'اسم المنشأة أو العيادة المعاينة' : 'Active Organization / Clinic Name'}
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0c1424] px-3.5 py-2 text-xs font-semibold text-white focus:border-cyan-500 focus:outline-hidden"
                  placeholder={isAr ? 'أدخل اسم المنشأة...' : 'e.g. Apex Health Labs'}
                />
              </div>

              <div className="md:col-span-6 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    {isAr ? 'اللون المميز للمنصة' : 'Brand Accent Color'}
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setAccentColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={cn(
                          'size-6 rounded-full transition-transform',
                          accentColor === c.hex ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#090d16]' : 'opacity-70 hover:opacity-100'
                        )}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Viewport switch if previewing */}
                {machineTab === 'branded_preview' && (
                  <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-[#0c1424] p-1">
                    <button
                      type="button"
                      onClick={() => setDeviceViewport('desktop')}
                      className={cn(
                        'p-1.5 rounded-lg text-xs transition-colors',
                        deviceViewport === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                      )}
                      title="Desktop View"
                    >
                      <Monitor className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceViewport('tablet')}
                      className={cn(
                        'p-1.5 rounded-lg text-xs transition-colors',
                        deviceViewport === 'tablet' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                      )}
                      title="Tablet View"
                    >
                      <Tablet className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceViewport('mobile')}
                      className={cn(
                        'p-1.5 rounded-lg text-xs transition-colors',
                        deviceViewport === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                      )}
                      title="Mobile View"
                    >
                      <Smartphone className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Machine Engine Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => setMachineTab('topology')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0',
                  machineTab === 'topology'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Layers className="size-3.5" />
                <span>{isAr ? 'مخطط التنفيذ (Topology)' : '1. Pipeline Topology'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMachineTab('simulator')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0',
                  machineTab === 'simulator'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Terminal className="size-3.5" />
                <span>{isAr ? 'المحاكي التفاعلي (Live Simulator)' : '2. Live Simulator'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMachineTab('directives')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0',
                  machineTab === 'directives'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Sliders className="size-3.5" />
                <span>{isAr ? 'موجهات الذكاء والأمان (Directives)' : '3. Prompt & Directives'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMachineTab('branded_preview')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0',
                  machineTab === 'branded_preview'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Sparkles className="size-3.5" />
                <span>{isAr ? 'واجهة النظام بالهوية (Branded UI)' : '4. Branded Output'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMachineTab('roi')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors shrink-0',
                  machineTab === 'roi'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <TrendingUp className="size-3.5" />
                <span>{isAr ? 'العائد الاستثماري (ROI Modeling)' : '5. Commercial ROI'}</span>
              </button>
            </div>

            {/* Tab 1: Execution Pipeline Topology */}
            {machineTab === 'topology' && (
              <StudioPipelineVisualizer
                template={selectedTemplate}
                brandName={brandName}
                accentColor={accentColor}
                isAr={isAr}
              />
            )}

            {/* Tab 2: Interactive Sandbox Simulator */}
            {machineTab === 'simulator' && (
              <StudioInteractiveSimulator
                template={selectedTemplate}
                brandName={brandName}
                accentColor={accentColor}
                isAr={isAr}
              />
            )}

            {/* Tab 3: Prompt Directives & Safety Guardrails */}
            {machineTab === 'directives' && (
              <StudioDirectivesGuardrails
                template={selectedTemplate}
                brandName={brandName}
                isAr={isAr}
              />
            )}

            {/* Tab 4: Branded UI Output */}
            {machineTab === 'branded_preview' && (
              <div className="space-y-6">
                <div
                  className={cn(
                    'mx-auto rounded-2xl border border-slate-800 bg-[#0c1424] p-5 shadow-inner transition-all',
                    deviceViewport === 'mobile' ? 'max-w-sm' : deviceViewport === 'tablet' ? 'max-w-2xl' : 'w-full'
                  )}
                >
                  {/* WhatsApp Confirmation Simulation */}
                  <div className="rounded-xl border border-emerald-500/30 bg-[#091a14] p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <MessageSquare className="size-4" />
                        <span>{isAr ? 'رسالة تأكيد الواتساب الفورية' : 'Instant WhatsApp Itinerary Delivery'}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">✓✓ Delivered 14:32</span>
                    </div>

                    <div className="space-y-2 text-slate-200">
                      <p className="font-semibold text-white">
                        {isAr ? `مرحباً بك من ${brandName}!` : `Welcome from ${brandName}!`}
                      </p>
                      <p className="text-slate-300">
                        {isAr
                          ? 'تم تأكيد موعدكم بنجاح يوم الخميس القادم الساعة 3:00 مساءً مع الاستشاري المختص.'
                          : 'Your consultation has been confirmed for Thursday at 3:00 PM with our senior specialist.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">
                          <Calendar className="size-3" /> {isAr ? 'إضافة للتقويم' : 'Add to Calendar'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-medium">
                          <MapPin className="size-3" /> {isAr ? 'موقع العيادة' : 'Location Pin'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inbound Voice Audio Snippet */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-[#0e1628] p-3.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <PhoneCall className="size-3.5 text-cyan-400" />
                        Inbound Voice Session
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Duration: 1m 18s • Retell Voice AI</span>
                    </div>
                    <p className="mt-2 text-slate-300 italic text-[11px] leading-relaxed">
                      &ldquo;Agent: Thank you for calling {brandName}. I have confirmed Thursday at 3:00 PM. Your direct itinerary and location pin have been dispatched to your WhatsApp.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Commercial ROI Engine */}
            {machineTab === 'roi' && (
              <StudioRoiCalculator
                template={selectedTemplate}
                brandName={brandName}
                accentColor={accentColor}
                onRequestBuild={handleRequestBuild}
                isPending={isPending}
                isAr={isAr}
              />
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {modalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0e1628] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                <CheckCircle2 className="size-6" />
              </div>
              <button
                type="button"
                onClick={() => setModalResult(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <h3 className="mt-4 font-display text-xl font-bold text-white">
              {modalResult.success
                ? (isAr ? 'تم استلام طلب بناء وتفعيل النظام بنجاح!' : 'Build Request Submitted to CRM!')
                : (isAr ? 'تعذر تسجيل الطلب' : 'Request Failed')}
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{modalResult.message}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalResult(null)}
                className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {isAr ? 'إغلاق ومتابعة' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* On-Demand Studio Motion Walkthrough Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <span>{isAr ? 'إغلاق المعاينة' : 'Close Walkthrough'}</span>
              <X className="size-4" />
            </button>
            <StudioMotionDemo
              variant="modal"
              autoplay={true}
              loop={false}
              onCloseOrSkip={() => setShowDemoModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
