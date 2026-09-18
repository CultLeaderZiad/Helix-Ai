'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Sparkles,
  Terminal,
  FolderGit2,
  GitBranch,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  RotateCcw,
  Sliders,
  Smartphone,
  Monitor,
  PhoneCall,
  MessageSquare,
  Calendar,
  Layers,
  Shield,
  Activity,
  Zap,
  Globe,
  Plus,
  Send,
  Trash2,
  FileCode,
  Check,
  ChevronRight,
  Volume2,
  Mic,
  DollarSign,
  TrendingUp,
  Cpu,
  Settings,
  HelpCircle,
  ExternalLink,
  CornerDownLeft,
  X,
  Lock,
  Boxes,
  Compass,
  FileCheck,
  MousePointerClick,
  Sparkle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SYSTEM_TEMPLATES, type SystemTemplate } from '@/lib/studio/templates'
import { requestSystemBuild, type RequestBuildResult } from '@/lib/studio/request-build'
import dynamic from 'next/dynamic'

const panelLoading = () => <p role="status" className="min-h-64 p-8 text-helix-muted">Loading studio panel…</p>
const StudioPipelineVisualizer = dynamic(() => import('./studio-pipeline-visualizer').then(mod => mod.StudioPipelineVisualizer), { loading: panelLoading })
const StudioRoiCalculator = dynamic(() => import('./studio-roi-calculator').then(mod => mod.StudioRoiCalculator), { loading: panelLoading })

interface TaskItem {
  id: string
  title: string
  timeAgo: string
  status: 'active' | 'completed' | 'queued'
  system: 'inbound' | 'outbound'
  tokens?: string
  filesChanged?: number
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Deploy Inbound Voice AI Agent with Gulf Dialect',
    timeAgo: '2m',
    status: 'active',
    system: 'inbound',
    tokens: '89K tokens',
    filesChanged: 3,
  },
  {
    id: 'task-2',
    title: 'Wire SHA-256 Ground-Truth Evidence Ledger & RLS',
    timeAgo: '9m',
    status: 'completed',
    system: 'inbound',
    tokens: '45K tokens',
    filesChanged: 2,
  },
  {
    id: 'task-3',
    title: 'Hook 2-Way Cal.com & HubSpot Appointment Locking',
    timeAgo: '14m',
    status: 'completed',
    system: 'inbound',
    tokens: '62K tokens',
    filesChanged: 4,
  },
  {
    id: 'task-4',
    title: 'Configure Outbound Stale-Lead Reactivation Cadence',
    timeAgo: '27m',
    status: 'completed',
    system: 'outbound',
    tokens: '78K tokens',
    filesChanged: 5,
  },
  {
    id: 'task-5',
    title: 'Build WhatsApp Itinerary Auto-Dispatch & Location Pin',
    timeAgo: '51m',
    status: 'completed',
    system: 'outbound',
    tokens: '31K tokens',
    filesChanged: 2,
  },
]

interface PreferenceModule {
  id: string
  name: string
  description: string
  system: 'inbound' | 'outbound' | 'both'
  category: string
  enabled: boolean
  metricBonus: string
}

const INITIAL_PREFERENCE_MODULES: PreferenceModule[] = [
  {
    id: 'pref-voice-sub400',
    name: 'Sub-400ms Voice Telephony Gateway',
    description: 'Ultra-low latency dual-channel WebSocket audio streaming via Retell Voice AI',
    system: 'inbound',
    category: 'Telephony',
    enabled: true,
    metricBonus: 'Latency < 380ms',
  },
  {
    id: 'pref-gulf-dialect',
    name: 'Multi-Dialect Tokenizer (Gulf / Egyptian / English)',
    description: 'Contextual phonetic speech recognition tailored for GCC & MENA accents',
    system: 'both',
    category: 'Acoustics',
    enabled: true,
    metricBonus: '99.4% Accuracy',
  },
  {
    id: 'pref-calendar-lock',
    name: '2-Way Calendar Lock (Cal.com & Google)',
    description: 'Instant conflict resolution and slot holding during live telephone calls',
    system: 'inbound',
    category: 'Scheduling',
    enabled: true,
    metricBonus: '+100% Zero Double-Book',
  },
  {
    id: 'pref-outbound-cadence',
    name: 'Algorithmic Outbound WhatsApp Reactivation',
    description: 'Re-engages leads uncontacted for 30-90 days with personalized incentives',
    system: 'outbound',
    category: 'Outbound',
    enabled: true,
    metricBonus: '34% Recovery Rate',
  },
  {
    id: 'pref-evidence-audit',
    name: 'Cryptographic SHA-256 Evidence Ledger',
    description: 'Tri-state factual auditing: Verified facts, Probable facts, and Speculations',
    system: 'both',
    category: 'Compliance',
    enabled: true,
    metricBonus: 'Zero Hallucinations',
  },
  {
    id: 'pref-collections-recovery',
    name: 'A/R & Accounts Receivable Automated Recovery',
    description: 'Polite WhatsApp reminders with Tap / Paymob / Moyasar payment links',
    system: 'outbound',
    category: 'Collections',
    enabled: false,
    metricBonus: '18% Cash Velocity',
  },
]

export function StudioAgentIde({
  initialClientName = 'Apex Medical & Aesthetic',
}: {
  initialClientName?: string
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<SystemTemplate>(SYSTEM_TEMPLATES[0])
  const [brandName, setBrandName] = useState(initialClientName)
  const [systemLayer, setSystemLayer] = useState<'inbound' | 'outbound'>('inbound')
  const [activeIdeTab, setActiveIdeTab] = useState<'workbench' | 'site_demo' | 'drag_drop' | 'topology' | 'simulator' | 'roi'>('site_demo')
  const [activeTask, setActiveTask] = useState<TaskItem>(DEFAULT_TASKS[0])
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS)
  
  // Real Site Simulator States
  const [demoSitePage, setDemoSitePage] = useState<'home' | 'booking' | 'portal' | 'whatsapp'>('home')
  const [isSimulatingCall, setIsSimulatingCall] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callStep, setCallStep] = useState(0)
  const [showConversionHud, setShowConversionHud] = useState(true)
  const [outboundTriggered, setOutboundTriggered] = useState(false)

  // Drag & Drop Preferences Machine State
  const [modules, setModules] = useState<PreferenceModule[]>(INITIAL_PREFERENCE_MODULES)
  const [isCompiling3D, setIsCompiling3D] = useState(false)
  const [compilationProgress, setCompilationProgress] = useState(100)

  // Prompt follow-up input
  const [promptText, setPromptText] = useState('')
  const [reasoningLog, setReasoningLog] = useState([
    {
      type: 'command',
      text: 'helix-mesh compile --target inbound-telephony-v4.2 --dialect gulf-sa --voice retell-aurora',
    },
    {
      type: 'thought',
      text: `Architecture analysis completed for ${brandName}. I eliminated REST latency by wiring direct WebSocket dual-channel audio into the ${systemLayer === 'inbound' ? 'Inbound Voice Receptionist' : 'Outbound Lead Reactivation Engine'}. All appointment slots are synced directly to PostgreSQL with hardware-enforced RLS isolation.`,
    },
  ])

  // Build Request Modal
  const [isPending, startTransition] = useTransition()
  const [modalResult, setModalResult] = useState<RequestBuildResult | null>(null)

  // Call simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSimulatingCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
      setCallStep(0)
    }
    return () => clearInterval(interval)
  }, [isSimulatingCall])

  // Call script progression
  useEffect(() => {
    if (isSimulatingCall) {
      const stepTimer = setTimeout(() => {
        if (callStep < 3) setCallStep((s) => s + 1)
      }, 2500)
      return () => clearTimeout(stepTimer)
    }
  }, [isSimulatingCall, callStep])

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptText.trim()) return

    const newThought = {
      type: 'thought',
      text: `User Directive: "${promptText}". Updating system directives and re-calibrating ${systemLayer.toUpperCase()} pipeline with latest guardrail configurations... Verified zero hallucinations.`,
    }

    setReasoningLog((prev) => [...prev, newThought])
    setPromptText('')

    // Trigger cool 3D re-compilation transition
    trigger3DRecompile()
  }

  const trigger3DRecompile = () => {
    setIsCompiling3D(true)
    setCompilationProgress(0)
    const interval = setInterval(() => {
      setCompilationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCompiling3D(false)
          return 100
        }
        return prev + 25
      })
    }, 120)
  }

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    )
    trigger3DRecompile()
  }

  const handleRequestBuild = () => {
    startTransition(async () => {
      const res = await requestSystemBuild(selectedTemplate.id, {
        brandName,
        accentColor: '#00d2ff',
        themeVariant: 'cyber-dark',
      })
      setModalResult(res)
    })
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] select-none text-helix-ink">
      {/* Top Main Window Chrome (Matching Image 1) */}
      <div className="overflow-hidden rounded-2xl border border-helix-border/90 bg-[#0c1017] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)]">
        {/* Window Top Titlebar */}
        <div className="flex h-11 items-center justify-between border-b border-helix-border/80 bg-[#090d14] px-4">
          {/* macOS Traffic Lights & Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)] transition-transform hover:scale-110" />
              <span className="size-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)] transition-transform hover:scale-110" />
              <span className="size-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)] transition-transform hover:scale-110" />
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Project Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-helix-ink">Helix Studio</span>
              <span className="text-helix-muted">/</span>
              <span className="rounded-md bg-slate-800/70 px-2 py-0.5 font-mono text-[11px] text-helix-accent">
                {brandName.toLowerCase().replace(/\s+/g, '-')}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-helix-border/60 bg-slate-800/40 px-2 py-0.5 text-[11px] text-helix-ink/80">
                <GitBranch className="size-3 text-purple-400" />
                <span>production/v4.2</span>
              </span>
            </div>
          </div>

          {/* Inbound / Outbound System Layer Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-helix-border bg-helix-surface p-1">
            <button
              type="button"
              onClick={() => {
                setSystemLayer('inbound')
                trigger3DRecompile()
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all',
                systemLayer === 'inbound'
                  ? 'bg-helix-accent-soft text-helix-accent border border-helix-border'
                  : 'text-helix-muted hover:text-helix-ink'
              )}
            >
              <PhoneCall className="size-3 text-helix-accent" />
              <span>Inbound Systems</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSystemLayer('outbound')
                trigger3DRecompile()
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all',
                systemLayer === 'outbound'
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] border border-emerald-500/30'
                  : 'text-helix-muted hover:text-helix-ink'
              )}
            >
              <Zap className="size-3 text-emerald-400" />
              <span>Outbound Engine</span>
            </button>
          </div>

          {/* Right Header Status / Model Pill */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-helix-border bg-slate-900/80 px-2.5 py-1 text-[11px]">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono font-medium text-helix-ink/80">38ms LPU</span>
            </div>
            <button
              type="button"
              onClick={handleRequestBuild}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-helix-ink px-3 py-1 text-xs font-bold text-helix-surface hover:bg-helix-ink/90 transition-all active:scale-95"
            >
              <Sparkles className="size-3.5" />
              <span>{isPending ? 'Deploying...' : 'Deploy System'}</span>
            </button>
          </div>
        </div>

        {/* 3-Column Studio Agent Grid Layout (Matching Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] min-h-[760px] border-b border-helix-border/80">
          
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: Tasks, Projects & Agent Architecture Tree (Image 1 Left) */}
          {/* ========================================================================= */}
          <aside className="flex flex-col border-r border-helix-border/80 bg-[#090d15] p-3">
            {/* Top Sidebar Action Buttons */}
            <div className="space-y-1 pb-3 border-b border-helix-border/80">
              <button
                type="button"
                onClick={() => {
                  const newTask: TaskItem = {
                    id: `task-${Date.now()}`,
                    title: `Tune ${systemLayer.toUpperCase()} prompt directives & guardrails`,
                    timeAgo: 'Just now',
                    status: 'active',
                    system: systemLayer,
                    tokens: '12K tokens',
                    filesChanged: 1,
                  }
                  setTasks([newTask, ...tasks])
                  setActiveTask(newTask)
                }}
                className="flex w-full items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2 text-xs font-semibold text-helix-ink hover:bg-slate-800 hover:text-helix-ink transition-all"
              >
                <div className="flex items-center gap-2">
                  <Plus className="size-3.5 text-helix-accent" />
                  <span>New Task</span>
                </div>
                <kbd className="rounded border border-helix-border bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-mono text-helix-muted">
                  ⌘N
                </kbd>
              </button>

              <div className="grid grid-cols-2 gap-1 pt-1">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-helix-border bg-slate-900/40 px-2.5 py-1.5 text-[11px] font-medium text-helix-muted hover:text-helix-ink transition-colors"
                >
                  <FolderGit2 className="size-3 text-helix-muted" />
                  <span>Workspaces</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-helix-border bg-slate-900/40 px-2.5 py-1.5 text-[11px] font-medium text-helix-muted hover:text-helix-ink transition-colors"
                >
                  <Cpu className="size-3 text-purple-400" />
                  <span>Skills</span>
                </button>
              </div>
            </div>

            {/* Tasks Tree List Grouped By System */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-thin">
              {/* Group 1: Inbound Systems */}
              <div>
                <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-wider text-helix-muted font-bold">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall className="size-3 text-helix-accent" />
                    Inbound Mesh
                  </span>
                  <span>3</span>
                </div>

                <div className="mt-1.5 space-y-0.5">
                  {tasks
                    .filter((t) => t.system === 'inbound')
                    .map((task) => {
                      const isActive = activeTask.id === task.id
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setActiveTask(task)}
                          className={cn(
                            'group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all',
                            isActive
                              ? 'bg-helix-ink/15 text-helix-accent font-semibold shadow-xs'
                              : 'text-helix-muted hover:bg-slate-800/40 hover:text-helix-ink'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span
                              className={cn(
                                'size-1.5 rounded-full shrink-0',
                                task.status === 'active'
                                  ? 'bg-helix-accent'
                                  : 'bg-slate-600'
                              )}
                            />
                            <span className="truncate">{task.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-helix-muted shrink-0">
                            {task.timeAgo}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>

              {/* Group 2: Outbound Systems */}
              <div>
                <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-wider text-helix-muted font-bold">
                  <span className="flex items-center gap-1.5">
                    <Zap className="size-3 text-emerald-400" />
                    Outbound Engine
                  </span>
                  <span>2</span>
                </div>

                <div className="mt-1.5 space-y-0.5">
                  {tasks
                    .filter((t) => t.system === 'outbound')
                    .map((task) => {
                      const isActive = activeTask.id === task.id
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setActiveTask(task)}
                          className={cn(
                            'group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all',
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-300 font-semibold shadow-xs'
                              : 'text-helix-muted hover:bg-slate-800/40 hover:text-helix-ink'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span
                              className={cn(
                                'size-1.5 rounded-full shrink-0',
                                task.status === 'active'
                                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                                  : 'bg-slate-600'
                              )}
                            />
                            <span className="truncate">{task.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-helix-muted shrink-0">
                            {task.timeAgo}
                          </span>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>

            {/* Bottom Profile Bar (Matching Ryan Bot in Image 1) */}
            <div className="pt-3 border-t border-helix-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex size-8 items-center justify-center rounded-full bg-helix-ink text-[11px] font-black text-helix-surface">
                  HA
                  <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-400 ring-2 ring-[#090d15]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-helix-ink">Helix Agent Bot</span>
                  <span className="text-[10px] font-mono text-helix-accent">Autonomous v4.2</span>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-helix-muted hover:bg-slate-800 hover:text-helix-ink transition-colors"
                title="Studio Preferences"
              >
                <Settings className="size-4" />
              </button>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* CENTER MAIN STAGE: Agent Workbench / Real Site Demo / Drag & Drop Machine */}
          {/* ========================================================================= */}
          <main className="flex flex-col bg-[#0b0f17] overflow-hidden">
            {/* View Switcher Tabs Bar */}
            <div className="flex items-center justify-between border-b border-helix-border/80 bg-helix-surface px-4 py-2">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveIdeTab('site_demo')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                    activeIdeTab === 'site_demo'
                      ? 'bg-helix-accent-soft text-helix-accent border border-helix-border shadow-xs'
                      : 'text-helix-muted hover:text-helix-ink'
                  )}
                >
                  <Globe className="size-3.5 text-helix-accent" />
                  <span>Real Site Demo Canvas</span>
                  <span className="rounded bg-helix-ink/30 px-1 py-0.2 text-[9px] font-bold text-helix-accent">
                    LIVE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIdeTab('drag_drop')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                    activeIdeTab === 'drag_drop'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                      : 'text-helix-muted hover:text-helix-ink'
                  )}
                >
                  <Boxes className="size-3.5 text-purple-400" />
                  <span>Drag &amp; Drop Machine</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIdeTab('workbench')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                    activeIdeTab === 'workbench'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-xs'
                      : 'text-helix-muted hover:text-helix-ink'
                  )}
                >
                  <Terminal className="size-3.5 text-blue-400" />
                  <span>Execution &amp; Diffs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIdeTab('topology')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                    activeIdeTab === 'topology'
                      ? 'bg-slate-700/50 text-helix-ink border border-slate-600'
                      : 'text-helix-muted hover:text-helix-ink'
                  )}
                >
                  <Layers className="size-3.5 text-helix-muted" />
                  <span>Topology Flow</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIdeTab('roi')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0',
                    activeIdeTab === 'roi'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-helix-muted hover:text-helix-ink'
                  )}
                >
                  <TrendingUp className="size-3.5 text-emerald-400" />
                  <span>ROI Model</span>
                </button>
              </div>

              {/* Conversion HUD toggle if viewing site demo */}
              {activeIdeTab === 'site_demo' && (
                <button
                  type="button"
                  onClick={() => setShowConversionHud(!showConversionHud)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors',
                    showConversionHud
                      ? 'border-helix-border bg-helix-accent-soft text-helix-accent'
                      : 'border-helix-border text-helix-muted hover:text-helix-ink'
                  )}
                >
                  <MousePointerClick className="size-3" />
                  <span>Conversion HUD: {showConversionHud ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            {/* Center Content Switcher */}
            <div className="relative flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
              
              {/* 3D Scanning / Recompilation Hologram Overlay */}
              <AnimatePresence>
                {isCompiling3D && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
                  >
                    <div className="relative flex size-20 items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-t-helix-accent border-r-transparent border-b-helix-ink border-l-transparent"
                      />
                      <Cpu className="size-8 text-helix-accent animate-pulse" />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-display text-sm font-bold text-helix-ink tracking-wide">
                        Re-Compiling {systemLayer.toUpperCase()} Mesh
                      </p>
                      <p className="text-xs font-mono text-helix-accent mt-0.5">
                        Calibrating dual-channel acoustic tensors... {compilationProgress}%
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TAB 1: REAL SITE INTERACTIVE DEMO PREVIEW (Requested by User) */}
              {activeIdeTab === 'site_demo' && (
                <div className="space-y-4">
                  {/* Top Demo Site Navigation Bar (Simulated Browser Inside IDE) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-helix-border bg-[#090e18] p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-2.5 rounded-full bg-emerald-400" />
                      <span className="font-mono text-xs text-helix-muted">
                        https://{brandName.toLowerCase().replace(/\s+/g, '')}.com/preview
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDemoSitePage('home')}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                          demoSitePage === 'home'
                            ? 'bg-slate-800 text-helix-ink'
                            : 'text-helix-muted hover:text-helix-ink'
                        )}
                      >
                        Home
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoSitePage('booking')}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                          demoSitePage === 'booking'
                            ? 'bg-slate-800 text-helix-ink'
                            : 'text-helix-muted hover:text-helix-ink'
                        )}
                      >
                        AI Booking
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoSitePage('portal')}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                          demoSitePage === 'portal'
                            ? 'bg-slate-800 text-helix-ink'
                            : 'text-helix-muted hover:text-helix-ink'
                        )}
                      >
                        Client Portal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDemoSitePage('whatsapp')}
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                          demoSitePage === 'whatsapp'
                            ? 'bg-slate-800 text-helix-ink'
                            : 'text-helix-muted hover:text-helix-ink'
                        )}
                      >
                        WhatsApp Itinerary
                      </button>
                    </div>
                  </div>

                  {/* HOW IT CONVERTS HUD OVERLAY */}
                  {showConversionHud && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-helix-border bg-helix-canvas p-3 shadow-lg"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-helix-accent-soft text-helix-accent font-bold">
                            1
                          </span>
                          <div>
                            <div className="text-[10px] uppercase font-mono text-helix-muted">Traffic Ingest</div>
                            <div className="font-semibold text-helix-ink">Visitor Lands on Site</div>
                          </div>
                        </div>

                        <ArrowRight className="size-4 text-slate-600 hidden sm:block" />

                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-bold">
                            2
                          </span>
                          <div>
                            <div className="text-[10px] uppercase font-mono text-helix-muted">
                              {systemLayer === 'inbound' ? 'Sub-400ms Voice' : 'Outbound Reactivation'}
                            </div>
                            <div className="font-semibold text-helix-ink">
                              {systemLayer === 'inbound' ? 'AI Voice Inbound Answer' : 'Automated WhatsApp Outreach'}
                            </div>
                          </div>
                        </div>

                        <ArrowRight className="size-4 text-slate-600 hidden sm:block" />

                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">
                            3
                          </span>
                          <div>
                            <div className="text-[10px] uppercase font-mono text-helix-muted">Calendar Sync</div>
                            <div className="font-semibold text-helix-ink">2-Way Cal.com Confirmed</div>
                          </div>
                        </div>

                        <ArrowRight className="size-4 text-slate-600 hidden sm:block" />

                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 font-bold">
                            4
                          </span>
                          <div>
                            <div className="text-[10px] uppercase font-mono text-helix-muted">CRM Deal Booked</div>
                            <div className="font-semibold text-emerald-400">+$2,850 Revenue Logged</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* REAL SITE MOCKUP CONTAINER */}
                  <div className="relative overflow-hidden rounded-2xl border border-helix-border bg-[#070b12] p-6 shadow-2xl">
                    {/* Simulated Site Header */}
                    <div className="flex items-center justify-between border-b border-helix-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-helix-ink text-sm font-black text-helix-surface">
                          {brandName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="font-display text-sm font-bold text-helix-ink tracking-wide">
                            {brandName}
                          </h2>
                          <p className="text-[10px] text-helix-muted">
                            {systemLayer === 'inbound' ? 'Specialized Medical & Aesthetic Surgery' : 'Enterprise Automation Mesh'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          AI Receptionist Online
                        </span>

                        <button
                          type="button"
                          onClick={() => setIsSimulatingCall(true)}
                          className="flex items-center gap-1.5 rounded-xl bg-helix-ink px-3.5 py-1.5 text-xs font-bold text-white hover:bg-helix-ink/90 transition-all active:scale-95"
                        >
                          <PhoneCall className="size-3.5" />
                          <span>Call Inbound AI</span>
                        </button>
                      </div>
                    </div>

                    {/* Site Body: Depends on selected demo page */}
                    {demoSitePage === 'home' && (
                      <div className="mt-6 space-y-6">
                        {/* Hero Section */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-[#0a1120] to-slate-900 p-6 border border-helix-border/80">
                          <div className="max-w-md space-y-2">
                            <span className="rounded-full bg-helix-accent-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-helix-accent">
                              Immediate Inbound Response
                            </span>
                            <h3 className="font-display text-2xl font-extrabold text-helix-ink leading-tight">
                              World-Class Care, Confirmed in Seconds.
                            </h3>
                            <p className="text-xs text-helix-muted leading-relaxed">
                              Experience zero hold times. Our autonomous voice system coordinates consults, confirms specialist calendars, and sends instant itinerary pins directly to your WhatsApp.
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setIsSimulatingCall(true)}
                                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-white hover:bg-slate-200 transition-colors shadow-md"
                              >
                                <PhoneCall className="size-3.5 text-helix-accent" />
                                <span>Speak with Receptionist</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDemoSitePage('booking')}
                                className="rounded-xl border border-helix-border bg-slate-800/50 px-4 py-2 text-xs font-semibold text-helix-ink hover:bg-slate-800 transition-colors"
                              >
                                Book Online
                              </button>
                            </div>
                          </div>

                          {/* Metric floating badge */}
                          <div className="absolute top-6 right-6 hidden md:block rounded-xl border border-helix-border/60 bg-helix-canvas/90 p-4 shadow-xl text-right backdrop-blur-md">
                            <div className="text-[10px] uppercase font-mono text-helix-muted font-semibold">
                              Average Inbound Response
                            </div>
                            <div className="text-2xl font-extrabold text-helix-accent">
                              340ms
                            </div>
                            <div className="text-[10px] text-emerald-400 mt-1">
                              ✓ 100% Zero Dropped Inquiries
                            </div>
                          </div>
                        </div>

                        {/* Services Grid on Demo Site */}
                        <div>
                          <h4 className="text-xs font-mono uppercase tracking-wider text-helix-muted font-semibold mb-3">
                            Popular Procedures &amp; Instant Booking Catalog
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { name: 'Cosmetic Implantology Consult', price: '$2,400', time: '45 mins', tag: 'High-Ticket' },
                              { name: 'Advanced Skin Laser Therapy', price: '$850', time: '30 mins', tag: 'Fast Turnaround' },
                              { name: 'Executive Smile Evaluation', price: '$1,200', time: '60 mins', tag: 'VIP Specialist' },
                            ].map((service, i) => (
                              <div
                                key={i}
                                className="group relative rounded-xl border border-helix-border bg-helix-surface p-4 transition-all hover:border-helix-border"
                              >
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-helix-ink/80">
                                  {service.tag}
                                </span>
                                <h5 className="mt-2 text-xs font-bold text-helix-ink group-hover:text-helix-accent transition-colors">
                                  {service.name}
                                </h5>
                                <div className="mt-3 flex items-center justify-between border-t border-helix-border/80 pt-2 text-xs">
                                  <span className="font-extrabold text-emerald-400">{service.price}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsSimulatingCall(true)
                                      setCallStep(1)
                                    }}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-helix-accent hover:underline"
                                  >
                                    <span>AI Hold Slot</span>
                                    <ChevronRight className="size-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booking Page Simulation */}
                    {demoSitePage === 'booking' && (
                      <div className="mt-4 rounded-xl border border-helix-border bg-[#090f1b] p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-helix-border pb-3">
                          <h4 className="font-display text-sm font-bold text-helix-ink">
                            Calendar Slot Locking System
                          </h4>
                          <span className="text-[11px] font-mono text-helix-accent">Two-Way Cal.com Sync</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {['09:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'].map((slot, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setDemoSitePage('whatsapp')
                                setOutboundTriggered(true)
                              }}
                              className="rounded-xl border border-helix-border bg-helix-accent-soft p-3 text-center hover:bg-helix-accent-soft transition-all"
                            >
                              <div className="font-bold text-helix-ink">{slot}</div>
                              <div className="text-[10px] text-helix-accent mt-1">Available Instant Lock</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Patient Portal Simulation */}
                    {demoSitePage === 'portal' && (
                      <div className="mt-4 rounded-xl border border-helix-border bg-[#090f1b] p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-helix-border pb-3">
                          <h4 className="font-display text-sm font-bold text-helix-ink">
                            Tenant-Isolated Client Records
                          </h4>
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                            <Shield className="size-3" /> PostgreSQL RLS Hardware Guard
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3">
                            <div>
                              <div className="font-semibold text-helix-ink">Fahad Al-Mansoor</div>
                              <div className="text-[10px] text-helix-muted">Dental Implant Pre-Op Evaluation</div>
                            </div>
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              Confirmed via Inbound AI
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Itinerary Simulation */}
                    {demoSitePage === 'whatsapp' && (
                      <div className="mt-4 mx-auto max-w-md rounded-2xl border border-emerald-500/40 bg-[#0b1b15] p-5 shadow-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs">
                              W
                            </div>
                            <span className="font-bold text-helix-ink text-xs">{brandName} VIP Reception</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400">✓✓ Sent via Meta v21.0</span>
                        </div>
                        <div className="rounded-xl bg-[#082218] p-3.5 text-xs text-helix-ink space-y-2">
                          <p className="font-semibold text-emerald-300">
                            Appointment Confirmation &amp; VIP Itinerary
                          </p>
                          <p className="text-[11px] text-helix-ink/80 leading-relaxed">
                            Hello! Your appointment with our lead specialist at {brandName} has been locked for Thursday at 2:00 PM.
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                              <Calendar className="size-3" /> Add to Apple / Google Calendar
                            </span>
                            <span className="inline-flex items-center gap-1 rounded bg-helix-accent-soft px-2 py-0.5 text-[10px] font-semibold text-helix-accent">
                              <Globe className="size-3" /> Open Clinic GPS Location
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Floating Simulated Phone Call Widget */}
                    <AnimatePresence>
                      {isSimulatingCall && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="absolute bottom-4 right-4 z-30 w-80 rounded-2xl border border-helix-border bg-[#091220]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                        >
                          <div className="flex items-center justify-between border-b border-helix-border pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="relative flex size-2.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                              </span>
                              <span className="text-xs font-bold text-helix-ink">Live Inbound Call</span>
                            </div>
                            <span className="font-mono text-xs text-helix-accent">
                              {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsSimulatingCall(false)}
                              className="rounded p-1 text-helix-muted hover:bg-slate-800 hover:text-helix-ink"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>

                          {/* Dynamic Audio Waveform */}
                          <div className="my-3 flex items-center justify-center gap-1 h-8">
                            {[16, 28, 12, 32, 20, 26, 14, 30, 24, 18, 28, 12].map((height, i) => (
                              <motion.span
                                key={i}
                                animate={{ height: [height * 0.4, height, height * 0.4] }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                                className="w-1 rounded-full bg-helix-accent"
                              />
                            ))}
                          </div>

                          {/* Dialogue Bubble */}
                          <div className="rounded-xl bg-[#0c182b] p-2.5 text-xs">
                            <div className="text-[10px] font-mono uppercase text-helix-accent font-bold mb-1">
                              Agent (Retell Gulf Dialect)
                            </div>
                            <p className="text-helix-ink text-[11px] leading-relaxed">
                              {callStep === 0 && `مرحباً بك في ${brandName}! أنا مساعد الاستقبال الذكي، كيف يمكنني مساعدتك في حجز موعد اليوم؟`}
                              {callStep === 1 && 'ممتاز! لدينا موعد متاح يوم الخميس القادم الساعة 2:00 ظهراً مع الاستشاري. هل يناسبك هذا التوقيت؟'}
                              {callStep >= 2 && 'تم تأكيد الحجز وحجز الخانة في التقويم فوراً. تم إرسال تفاصيل الموعد ورابط الموقع إلى واتسابك الآن!'}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-helix-muted">Latency: 38ms LPU</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSimulatingCall(false)
                                setDemoSitePage('whatsapp')
                              }}
                              className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/30 transition-colors"
                            >
                              End &amp; View WhatsApp
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* TAB 2: DRAG & DROP CUSTOMIZATION MACHINE (Requested by User) */}
              {activeIdeTab === 'drag_drop' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-helix-border/80 pb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-helix-ink flex items-center gap-2">
                        <Boxes className="size-5 text-purple-400" />
                        Preference &amp; Architecture Customization Machine
                      </h3>
                      <p className="text-xs text-helix-muted mt-0.5">
                        Toggle or re-order customer preferences. The 3D compiler instantly re-tunes models, dialect dictionaries, and CRM bindings.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={trigger3DRecompile}
                      className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/20 px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/30 transition-all shadow-sm"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Re-Compile System (3D)</span>
                    </button>
                  </div>

                  {/* Drag-and-Drop Preference Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        className={cn(
                          'relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300',
                          mod.enabled
                            ? 'border-helix-border bg-helix-canvas'
                            : 'border-helix-border bg-helix-surface opacity-60'
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-helix-ink/80 uppercase">
                              {mod.category}
                            </span>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              {mod.metricBonus}
                            </span>
                          </div>

                          <h4 className="font-display text-sm font-bold text-helix-ink">{mod.name}</h4>
                          <p className="text-xs text-helix-muted leading-relaxed">{mod.description}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-helix-border/80 pt-3">
                          <span className="text-[11px] font-mono text-helix-muted">
                            Layer: {mod.system.toUpperCase()}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={cn(
                              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                              mod.enabled
                                ? 'bg-helix-ink text-white'
                                : 'border border-helix-border bg-slate-800 text-helix-ink/80 hover:text-helix-ink'
                            )}
                          >
                            <Check className={cn('size-3.5', mod.enabled ? 'opacity-100' : 'opacity-0')} />
                            <span>{mod.enabled ? 'Active in Pipeline' : 'Enable Module'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: AGENT EXECUTION & DIFF WORKBENCH (Matching Image 1 Center) */}
              {activeIdeTab === 'workbench' && (
                <div className="space-y-5">
                  {/* Command Line Execution Box */}
                  <div className="rounded-xl border border-helix-border bg-[#090d15] p-3 text-xs font-mono text-helix-ink/80">
                    <div className="flex items-center gap-2 text-helix-muted">
                      <Terminal className="size-3.5 text-helix-accent" />
                      <span>Ran node --check telemetry-mesh.ts</span>
                    </div>
                  </div>

                  {/* Agent Reasoning Stream Narrative (Image 1 replica) */}
                  <div className="rounded-2xl border border-helix-border bg-[#090e18] p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-helix-border pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-helix-accent" />
                        <span className="text-xs font-bold text-helix-ink uppercase tracking-wider">
                          Autonomous System Synthesis
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-helix-muted">Execution time: 1.4s</span>
                    </div>

                    <div className="space-y-3 text-xs text-helix-ink/80 leading-relaxed font-sans">
                      <p>
                        I optimized the execution topology for <strong>{brandName}</strong>. The previous setup routed audio through cold-start REST containers resulting in 820ms lag.
                      </p>
                      <p>
                        I replaced that with an asynchronous dual-channel WebSocket stream directly connected to Retell Voice AI and our local dialect tokenizer. Gulf Arabic and English token streams now resolve in <strong>38ms</strong> on our Groq LPU cluster.
                      </p>
                    </div>

                    {/* File Diffs Card (Matching Image 1 center) */}
                    <div className="rounded-xl border border-helix-border bg-helix-surface p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-helix-ink">
                          3 files changed <span className="text-emerald-400">+734</span>{' '}
                          <span className="text-rose-400">-7</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => trigger3DRecompile()}
                          className="flex items-center gap-1 text-[11px] font-semibold text-helix-muted hover:text-helix-ink"
                        >
                          <RotateCcw className="size-3" />
                          <span>Undo changes</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                          <span className="text-helix-accent flex items-center gap-2">
                            <FileCode className="size-3.5 text-helix-accent" />
                            telephony-router.ts
                          </span>
                          <span className="text-emerald-400">+471 -0</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                          <span className="text-purple-300 flex items-center gap-2">
                            <FileCode className="size-3.5 text-purple-400" />
                            whatsapp-flow.json
                          </span>
                          <span className="text-emerald-400">+62 -6</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2">
                          <span className="text-emerald-300 flex items-center gap-2">
                            <FileCode className="size-3.5 text-emerald-400" />
                            evidence-ledger.sql
                          </span>
                          <span className="text-emerald-400">+201 -1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TOPOLOGY FLOW */}
              {activeIdeTab === 'topology' && (
                <StudioPipelineVisualizer
                  template={selectedTemplate}
                  brandName={brandName}
                  accentColor="#00d2ff"
                  isAr={false}
                />
              )}

              {/* TAB 5: ROI MODEL */}
              {activeIdeTab === 'roi' && (
                <StudioRoiCalculator
                  template={selectedTemplate}
                  brandName={brandName}
                  accentColor="#00d2ff"
                  onRequestBuild={handleRequestBuild}
                  isPending={isPending}
                  isAr={false}
                />
              )}
            </div>

            {/* Bottom Follow-Up Prompt Input Bar (Image 1 Bottom Replica) */}
            <div className="border-t border-helix-border/80 bg-[#090d15] p-3">
              <form onSubmit={handleSendPrompt} className="relative flex items-center gap-2 rounded-xl border border-helix-border bg-helix-surface px-3 py-2 focus-within:border-helix-border">
                <button
                  type="button"
                  className="text-helix-muted hover:text-helix-ink/80 transition-colors"
                  title="Attach Context File"
                >
                  <Plus className="size-4" />
                </button>

                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ask for follow-up architectural modifications or add prompt guardrails..."
                  className="flex-1 bg-transparent text-xs text-helix-ink placeholder:text-helix-muted focus:outline-hidden"
                />

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-helix-muted">
                    <Cpu className="size-3 text-helix-accent" />
                    <span>Helix-70B</span>
                  </div>

                  <button
                    type="submit"
                    className="flex size-7 items-center justify-center rounded-lg bg-helix-ink text-white hover:bg-helix-ink/90 transition-colors"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </main>

          {/* ========================================================================= */}
          {/* RIGHT SIDEBAR: Git Tools, Goal Progress & Verification Checklist (Image 1 Right) */}
          {/* ========================================================================= */}
          <aside className="flex flex-col border-l border-helix-border/80 bg-[#090d15] p-4 space-y-5">
            {/* Git Tools Panel (Image 1 Right Top) */}
            <div className="rounded-2xl border border-helix-border bg-helix-surface p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-helix-muted uppercase font-semibold">Git tools</span>
                <span className="font-mono text-xs font-bold text-emerald-400">+734 <span className="text-rose-400">-7</span></span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-helix-border bg-[#090d15] px-3 py-2 text-xs">
                <GitBranch className="size-3.5 text-helix-accent" />
                <span className="font-mono text-helix-ink/80 truncate">feat/inbound-voice-mesh</span>
              </div>

              <button
                type="button"
                onClick={handleRequestBuild}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-helix-ink hover:bg-slate-700 transition-colors"
              >
                <span>Commit &amp; Push to Production</span>
              </button>
            </div>

            {/* Active Goal Summary (Image 1 Right Middle) */}
            <div className="rounded-2xl border border-helix-border bg-helix-surface p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-helix-muted uppercase font-semibold">Active Goal</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">Complete</span>
              </div>

              <p className="text-xs font-semibold text-helix-ink leading-snug">
                {systemLayer === 'inbound'
                  ? 'Autonomous Inbound Voice & WhatsApp Booking Mesh'
                  : 'Algorithmic Outbound WhatsApp & Dialer Reactivation'}
              </p>

              <div className="flex items-center gap-3 text-[10px] font-mono text-helix-muted pt-1 border-t border-helix-border/80">
                <span>5/5 steps</span>
                <span>•</span>
                <span>2m runtime</span>
                <span>•</span>
                <span className="text-helix-accent">89K tokens</span>
              </div>
            </div>

            {/* Live Progress Checklist (Image 1 Right Bottom Checklist) */}
            <div className="flex-1 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-helix-muted font-bold">
                Automated Verification Checklist
              </span>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Initialize dual-channel WebSocket pipeline', done: true },
                  { label: 'Implement dialect classification (Gulf/English)', done: true },
                  { label: 'Wire audit log / evidence export', done: true },
                  { label: 'Connect Cal.com two-way calendar locking', done: true },
                  { label: 'Dispatch automated WhatsApp itinerary pin', done: true },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 rounded-xl border border-helix-border/80 bg-helix-surface p-2.5"
                  >
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-helix-ink/80 text-[11px] leading-relaxed">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Hardware Stats */}
            <div className="rounded-xl border border-helix-border/80 bg-[#080c14] p-3 text-[11px] font-mono space-y-1.5">
              <div className="flex justify-between text-helix-muted">
                <span>Dialect Tokenizer:</span>
                <span className="text-emerald-400">99.4% Match</span>
              </div>
              <div className="flex justify-between text-helix-muted">
                <span>Voice Latency:</span>
                <span className="text-helix-accent">340ms E2E</span>
              </div>
              <div className="flex justify-between text-helix-muted">
                <span>Tenancy RLS:</span>
                <span className="text-purple-400">Enforced</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-helix-border bg-helix-canvas p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-helix-accent-soft text-helix-accent">
                <CheckCircle2 className="size-6" />
              </div>
              <button
                type="button"
                onClick={() => setModalResult(null)}
                className="text-helix-muted hover:text-helix-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <h3 className="mt-4 font-display text-xl font-bold text-helix-ink">
              {modalResult.success ? 'Studio Architecture Deployed!' : 'Deployment Failed'}
            </h3>
            <p className="mt-2 text-sm text-helix-ink/80 leading-relaxed">{modalResult.message}</p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalResult(null)}
                className="rounded-xl bg-helix-ink px-5 py-2 text-xs font-semibold text-white hover:bg-helix-ink/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
