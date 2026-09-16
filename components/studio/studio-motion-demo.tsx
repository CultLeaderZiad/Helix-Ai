'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  MessageSquare,
  Calendar,
  PhoneCall,
  Activity,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudioMotionDemoProps {
  /**
   * Whether to autoplay on mount (default: true for landing page)
   */
  autoplay?: boolean
  /**
   * Whether to loop infinitely (default: true for landing page, false for studio modal)
   */
  loop?: boolean
  /**
   * Optional callback when user clicks "Skip" or "Launch Real Studio"
   */
  onCloseOrSkip?: () => void
  /**
   * Visual mode: 'standalone' (full glass container) or 'modal'
   */
  variant?: 'standalone' | 'modal'
}

type TimelineStep = 0 | 1 | 2 | 3 | 4

const DEMO_BUSINESS_NAME = 'Apex Health & Dental Abu Dhabi'

const STEP_METADATA = [
  { step: 0, label: 'Entry' },
  { step: 1, label: 'Business Profile' },
  { step: 2, label: 'Architecture' },
  { step: 3, label: 'Calibration' },
  { step: 4, label: 'System Live' },
]

export function StudioMotionDemo({
  autoplay = true,
  loop = true,
  onCloseOrSkip,
  variant = 'standalone',
}: StudioMotionDemoProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [currentStep, setCurrentStep] = useState<TimelineStep>(0)
  const [typedText, setTypedText] = useState('')
  const [cursorPos, setCursorPos] = useState({ x: 340, y: 180 })
  const [isClicking, setIsClicking] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Ref container for coordinate tracking
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset entire timeline
  const resetTimeline = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    setCurrentStep(0)
    setTypedText('')
    setCursorPos(isMobile ? { x: 180, y: 120 } : { x: 360, y: 220 })
    setIsClicking(false)
  }

  // Handle Play/Pause
  const togglePlay = () => {
    setHasInteracted(true)
    setIsPlaying((prev) => !prev)
  }

  // Handle Manual Jump to Step
  const jumpToStep = (step: TimelineStep) => {
    setHasInteracted(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    setCurrentStep(step)
    if (step >= 2) {
      setTypedText(DEMO_BUSINESS_NAME)
    }
  }

  // Master choreographed timeline effect
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    // Step 0: Cursor glides towards input field
    if (currentStep === 0) {
      setCursorPos(isMobile ? { x: 140, y: 70 } : { x: 180, y: 155 })
      timerRef.current = setTimeout(() => {
        setIsClicking(true)
        setTimeout(() => {
          setIsClicking(false)
          setCurrentStep(1)
        }, 220)
      }, 1200)
    }

    // Step 1: Character-by-character typing
    else if (currentStep === 1) {
      let charIndex = 0
      setTypedText('')

      const typeNextChar = () => {
        if (charIndex <= DEMO_BUSINESS_NAME.length) {
          setTypedText(DEMO_BUSINESS_NAME.slice(0, charIndex))
          charIndex++
          // Organic non-linear cadence between 45ms and 80ms
          const delay = 45 + Math.floor(Math.random() * 35)
          typingTimerRef.current = setTimeout(typeNextChar, delay)
        } else {
          // Finished typing, pause 600ms then move to step 2
          timerRef.current = setTimeout(() => {
            setCurrentStep(2)
          }, 600)
        }
      }

      typingTimerRef.current = setTimeout(typeNextChar, 100)
    }

    // Step 2: Cursor glides to System Architecture selector
    else if (currentStep === 2) {
      setCursorPos(isMobile ? { x: 160, y: 170 } : { x: 190, y: 235 })
      timerRef.current = setTimeout(() => {
        setIsClicking(true)
        setTimeout(() => {
          setIsClicking(false)
          setCurrentStep(3)
        }, 250)
      }, 1100)
    }

    // Step 3: Brief processing pulse (1.1 seconds)
    else if (currentStep === 3) {
      setCursorPos(isMobile ? { x: 170, y: 340 } : { x: 380, y: 240 })
      timerRef.current = setTimeout(() => {
        setCurrentStep(4)
      }, 1100)
    }

    // Step 4: System Preview is Active (holds for 8 seconds before looping)
    else if (currentStep === 4) {
      // Park cursor slightly off to the side
      setCursorPos(isMobile ? { x: 220, y: 360 } : { x: 420, y: 160 })
      if (loop) {
        timerRef.current = setTimeout(() => {
          resetTimeline()
          setIsPlaying(true)
        }, 8500)
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [currentStep, isPlaying, loop, isMobile])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-2xl border border-purple-500/25 bg-[#090D16]/95 text-slate-100 shadow-[0_0_60px_-15px_rgba(168,85,247,0.25)] backdrop-blur-xl overflow-hidden',
        variant === 'standalone' ? 'mx-auto max-w-4xl' : 'max-w-full'
      )}
    >
      {/* Top Ambient Glow Gradient (Matches User Reference Image) */}
      <div className="pointer-events-none absolute -top-24 inset-x-0 h-48 bg-gradient-to-b from-purple-600/25 via-indigo-500/10 to-transparent blur-2xl" />

      {/* Frame Topbar: macOS dots + honest mode pill + timeline controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-purple-500/20 bg-[#0c1220]/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Honest Demo Mode Indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
            <Sparkles className="size-3 text-purple-400" />
            <span>Choreographed Studio Demo</span>
          </div>

          <span className="hidden md:inline text-[11px] text-slate-400 font-mono">
            // Scripted Architecture Walkthrough
          </span>
        </div>

        {/* Timeline Interaction Toolbar */}
        <div className="flex items-center gap-2 text-xs">
          {/* Step indicator pills */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 rounded-lg p-1 border border-slate-800">
            {STEP_METADATA.map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => jumpToStep(item.step as TimelineStep)}
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded transition-colors',
                  currentStep === item.step
                    ? 'bg-purple-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex size-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={isPlaying ? 'Pause Demo' : 'Play Demo'}
            aria-label={isPlaying ? 'Pause Demo' : 'Play Demo'}
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={() => {
              resetTimeline()
              setIsPlaying(true)
            }}
            className="flex size-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Replay sequence"
            aria-label="Replay sequence"
          >
            <RotateCcw className="size-3.5" />
          </button>

          {/* Skip to Finished System */}
          <button
            type="button"
            onClick={() => jumpToStep(4)}
            className="flex size-7 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
            title="Skip to final preview"
            aria-label="Skip to final preview"
          >
            <FastForward className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Main Staged Sandbox Stage */}
      <div className="relative min-h-[380px] p-5 sm:p-7 overflow-hidden">
        {/* Synthetic Cursor Element (Smooth Framer Motion Keyframes) */}
        <motion.div
          className="pointer-events-none absolute z-50 flex items-start"
          animate={{
            x: cursorPos.x,
            y: cursorPos.y,
            scale: isClicking ? 0.82 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 180,
            mass: 0.8,
          }}
        >
          {/* Custom SVG Modern Neon Cursor */}
          <svg
            className="size-5 drop-shadow-[0_2px_10px_rgba(168,85,247,0.8)] filter"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill="#c084fc"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {/* Cursor trailing label pill */}
          <span className="ml-1.5 mt-2 rounded bg-purple-950/90 border border-purple-500/40 px-1.5 py-0.5 text-[9px] font-mono text-purple-200 shadow-md">
            Prospect Demo
          </span>
        </motion.div>

        {/* Studio Setup Grid: Simulated Inputs & Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Simulated Configuration Inputs (40% width) */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              1. Prospect Business Details
            </div>

            {/* Input 1: Business Name with Character Typing */}
            <div
              className={cn(
                'rounded-xl border p-3 transition-all duration-300 bg-[#0e1628]',
                currentStep === 1
                  ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/50'
                  : 'border-slate-800'
              )}
            >
              <label className="block text-[10px] uppercase font-medium text-slate-400 mb-1">
                Business / Clinic Name
              </label>
              <div className="flex items-center h-8 font-mono text-xs text-white">
                <span>{typedText || (currentStep === 0 ? 'Clicking input...' : '')}</span>
                {currentStep === 1 && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-purple-400 animate-pulse" />
                )}
              </div>
            </div>

            {/* Selector: System Architecture Option */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                2. System Architecture
              </div>

              {/* Option A: Autonomous Booking Receptionist (Active Target) */}
              <div
                className={cn(
                  'rounded-xl border p-3 transition-all duration-300 text-xs flex items-center justify-between cursor-pointer',
                  currentStep >= 2
                    ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'border-slate-800 bg-[#0e1628] opacity-80'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-lg text-xs',
                      currentStep >= 2 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    <PhoneCall className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-[11px]">Booking Receptionist</p>
                    <p className="text-[10px] text-slate-400">Voice AI + WhatsApp Delivery</p>
                  </div>
                </div>
                {currentStep >= 2 ? (
                  <CheckCircle2 className="size-4 text-cyan-400" />
                ) : (
                  <span className="size-2 rounded-full bg-slate-700" />
                )}
              </div>

              {/* Option B: WhatsApp Lead Triage (Secondary) */}
              <div className="rounded-xl border border-slate-800/80 bg-[#0e1628]/60 p-3 text-xs flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                    <MessageSquare className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300 text-[11px]">Missed-Call Triage</p>
                    <p className="text-[10px] text-slate-500">5-Second Auto Dispatch</p>
                  </div>
                </div>
                <span className="size-2 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Regional Currency / WhatsApp API Notice */}
            <div className="rounded-lg border border-slate-800 bg-[#0a0f1d] p-2.5 text-[10px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
              <span>GCC Enterprise Ready • Official WhatsApp Business Cloud API</span>
            </div>
          </div>

          {/* Right Column: Dynamic Output Surface / Processing Indicator / Live Preview (60% width) */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* State A: Idle before step 3 */}
              {currentStep < 3 && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-dashed border-slate-800 bg-[#0a101f]/50 p-8 text-center flex flex-col items-center justify-center min-h-[290px]"
                >
                  <div className="size-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 mb-3">
                    <Sparkles className="size-5 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">Awaiting Profile Selection</h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs">
                    Watch the synthetic cursor select clinic parameters to preview the resulting
                    autonomous booking pipeline.
                  </p>
                </motion.div>
              )}

              {/* State B: Step 3 Processing Pulse */}
              {currentStep === 3 && (
                <motion.div
                  key="calibrating"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-8 text-center flex flex-col items-center justify-center min-h-[290px]"
                >
                  <div className="relative size-12 mb-3">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-300">
                      <Zap className="size-5 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-cyan-200">Calibrating Architecture...</h4>
                  <p className="mt-1 text-xs text-slate-300 font-mono">
                    Routing Retell Voice Engine // Meta WhatsApp Gateway
                  </p>
                  <div className="mt-4 w-44 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.9, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* State C: Step 4 Generated System Preview (Live Architecture) */}
              {currentStep === 4 && (
                <motion.div
                  key="active-preview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="space-y-3"
                >
                  {/* System Header Bar */}
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-[#0a1815] p-3">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400">
                        SYSTEM GENERATED • 24/7 AUTONOMOUS RECEPTIONIST
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {typedText || DEMO_BUSINESS_NAME}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ONLINE
                    </span>
                  </div>

                  {/* WhatsApp Delivery Simulation Card */}
                  <div className="rounded-xl border border-emerald-500/25 bg-[#0b1c18] p-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium">
                        <MessageSquare className="size-3.5" />
                        <span>Instant WhatsApp Itinerary Delivery</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400/80">✓✓ Delivered 14:32</span>
                    </div>

                    <div className="space-y-1.5 text-slate-200 text-[11px]">
                      <p className="font-semibold text-white">
                        Welcome to {typedText || DEMO_BUSINESS_NAME}!
                      </p>
                      <p className="text-slate-300 leading-snug">
                        Your dental consultation has been confirmed for Thursday at 3:00 PM with Dr.
                        Tariq.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          <Calendar className="size-2.5" /> Add to Calendar
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                          <MapPin className="size-2.5" /> Abu Dhabi Clinic Map
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voice Telemetry Audio Snippet */}
                  <div className="rounded-xl border border-slate-800 bg-[#0e1628] p-3 text-xs">
                    <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60">
                      <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                        <PhoneCall className="size-3 text-cyan-400" />
                        Inbound Voice Telemetry
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Duration: 1m 18s • Retell Voice AI</span>
                    </div>
                    <p className="mt-2 text-[10.5px] text-slate-300 italic leading-relaxed">
                      &ldquo;Agent: Thank you for calling {typedText || 'Apex'}. I have confirmed Thursday at 3:00 PM. Your direct itinerary and location pin have been dispatched to your WhatsApp.&rdquo;
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Honest Footer Caption & Action Callout */}
      <div className="border-t border-purple-500/20 bg-[#070b14] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 text-[11px] max-w-xl leading-relaxed text-center sm:text-left">
          <span className="text-purple-300 font-semibold">Honest Architecture Notice:</span> This
          scripted timeline demonstrates how Helix AI standardizes pre-tested, deterministic agent
          workflows. Real prospects configure customized parameters inside the interactive Studio
          sandbox.
        </div>

        {onCloseOrSkip ? (
          <button
            type="button"
            onClick={onCloseOrSkip}
            className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Configure Your Real System &rarr;
          </button>
        ) : (
          <a
            href="/dashboard/studio"
            className="shrink-0 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Open Interactive Studio &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
