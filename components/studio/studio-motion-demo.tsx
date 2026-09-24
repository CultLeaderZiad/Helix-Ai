'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import {
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

  const inView = useInView(containerRef, { amount: 0.1 })
  const reducedMotion = useReducedMotion()
  const [pageVisible, setPageVisible] = useState(false)
  const canPlay = isPlaying && inView && pageVisible && (!reducedMotion || hasInteracted)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 767px)')
    const updateSize = () => setIsMobile(mobile.matches)
    const updateVisibility = () => setPageVisible(!document.hidden)
    updateSize()
    updateVisibility()
    mobile.addEventListener('change', updateSize)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      mobile.removeEventListener('change', updateSize)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
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
    if (!canPlay) {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      return
    }

    // Step 0: Cursor glides towards input field
    if (currentStep === 0) {
      setCursorPos(isMobile ? { x: 140, y: 70 } : { x: 180, y: 155 })
      timerRef.current = setTimeout(() => {
        setIsClicking(true)
        timerRef.current = setTimeout(() => {
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
        timerRef.current = setTimeout(() => {
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
  }, [currentStep, canPlay, loop, isMobile])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-xl border border-border bg-panel text-foreground overflow-hidden',
        variant === 'standalone' ? 'mx-auto max-w-4xl' : 'max-w-full'
      )}
    >
      {/* Frame Topbar: macOS dots + honest mode pill + timeline controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-border bg-raised px-4 py-3">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Honest Demo Mode Indicator */}
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-panel px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-accent">
            <Activity className="size-3 text-accent" />
            <span>Choreographed Studio Demo</span>
          </div>

          <span className="hidden md:inline text-[11px] text-muted-foreground font-mono">
            // Scripted Architecture Walkthrough
          </span>
        </div>

        {/* Timeline Interaction Toolbar */}
        <div className="flex items-center gap-2 text-xs">
          {/* Step indicator pills */}
          <div className="hidden sm:flex items-center gap-1 bg-panel rounded-lg p-1 border border-border">
            {STEP_METADATA.map((item) => (
              <button
                key={item.step}
                type="button"
                onClick={() => jumpToStep(item.step as TimelineStep)}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-mono rounded transition-colors',
                  currentStep === item.step
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
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
            className="flex size-7 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:bg-raised hover:text-foreground transition-colors"
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
            className="flex size-7 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:bg-raised hover:text-foreground transition-colors"
            title="Replay sequence"
            aria-label="Replay sequence"
          >
            <RotateCcw className="size-3.5" />
          </button>

          {/* Skip to Finished System */}
          <button
            type="button"
            onClick={() => jumpToStep(4)}
            className="flex size-7 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:bg-raised hover:text-foreground transition-colors"
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
          {/* Custom SVG Modern Accent Cursor */}
          <svg
            className="size-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill="var(--accent)"
              stroke="var(--foreground)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {/* Cursor trailing label pill */}
          <span className="ml-1.5 mt-2 rounded border border-border bg-raised px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground shadow-sm">
            Prospect Demo
          </span>
        </motion.div>

        {/* Studio Setup Grid: Simulated Inputs & Selector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Simulated Configuration Inputs (40% width) */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              1. Prospect Business Details
            </div>

            {/* Input 1: Business Name with Character Typing */}
            <div
              className={cn(
                'rounded-xl border p-3 transition-all duration-300 bg-raised',
                currentStep === 1
                  ? 'border-accent ring-1 ring-accent/30'
                  : 'border-border'
              )}
            >
              <label className="block text-[10px] uppercase font-medium text-muted-foreground mb-1">
                Business / Clinic Name
              </label>
              <div className="flex items-center h-8 font-mono text-xs text-foreground">
                <span>{typedText || (currentStep === 0 ? 'Clicking input...' : '')}</span>
                {currentStep === 1 && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-accent animate-pulse" />
                )}
              </div>
            </div>

            {/* Selector: System Architecture Option */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                2. System Architecture
              </div>

              {/* Option A: Autonomous Booking Receptionist (Active Target) */}
              <div
                className={cn(
                  'rounded-xl border p-3 transition-all duration-300 text-xs flex items-center justify-between cursor-pointer',
                  currentStep >= 2
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-raised opacity-80'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-lg text-xs',
                      currentStep >= 2 ? 'bg-accent/15 text-accent' : 'bg-panel text-muted-foreground'
                    )}
                  >
                    <PhoneCall className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-[11px]">Booking Receptionist</p>
                    <p className="text-[10px] text-muted-foreground">Voice AI + WhatsApp Delivery</p>
                  </div>
                </div>
                {currentStep >= 2 ? (
                  <CheckCircle2 className="size-4 text-accent" />
                ) : (
                  <span className="size-2 rounded-full bg-border" />
                )}
              </div>

              {/* Option B: WhatsApp Lead Triage (Secondary) */}
              <div className="rounded-xl border border-border bg-raised/60 p-3 text-xs flex items-center justify-between opacity-60">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-panel text-muted-foreground">
                    <MessageSquare className="size-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground/80 text-[11px]">Missed-Call Triage</p>
                    <p className="text-[10px] text-muted-foreground">5-Second Auto Dispatch</p>
                  </div>
                </div>
                <span className="size-2 rounded-full bg-border" />
              </div>
            </div>

            {/* Regional Currency / WhatsApp API Notice */}
            <div className="rounded-lg border border-border bg-raised p-2.5 text-[10px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-accent shrink-0" />
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
                  className="rounded-xl border border-dashed border-border bg-raised/50 p-8 text-center flex flex-col items-center justify-center min-h-[290px]"
                >
                  <div className="size-10 rounded-full bg-panel border border-border flex items-center justify-center text-accent mb-3">
                    <Activity className="size-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Awaiting Profile Selection</h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs">
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
                  className="rounded-xl border border-border bg-raised p-8 text-center flex flex-col items-center justify-center min-h-[290px]"
                >
                  <div className="relative size-12 mb-3">
                    <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-accent">
                      <Zap className="size-5 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-accent">Calibrating Architecture...</h4>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    Routing Retell Voice Engine // Meta WhatsApp Gateway
                  </p>
                  <div className="mt-4 w-44 h-1.5 bg-panel rounded-full overflow-hidden border border-border">
                    <motion.div
                      className="h-full bg-accent"
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
                  <div className="flex items-center justify-between rounded-xl border border-border bg-raised p-3">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-accent font-semibold">
                        SYSTEM GENERATED • 24/7 AUTONOMOUS RECEPTIONIST
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        {typedText || DEMO_BUSINESS_NAME}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-accent" />
                      ONLINE
                    </span>
                  </div>

                  {/* WhatsApp Delivery Simulation Card */}
                  <div className="rounded-xl border border-border bg-panel p-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                      <div className="flex items-center gap-2 text-accent font-medium">
                        <MessageSquare className="size-3.5" />
                        <span>Instant WhatsApp Itinerary Delivery</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">✓✓ Delivered 14:32</span>
                    </div>

                    <div className="space-y-1.5 text-foreground text-[11px]">
                      <p className="font-semibold text-foreground">
                        Welcome to {typedText || DEMO_BUSINESS_NAME}!
                      </p>
                      <p className="text-muted-foreground leading-snug">
                        Your dental consultation has been confirmed for Thursday at 3:00 PM with Dr.
                        Tariq.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        <span className="inline-flex items-center gap-1 rounded border border-border bg-raised px-2 py-0.5 text-[10px] font-medium text-foreground">
                          <Calendar className="size-2.5" /> Add to Calendar
                        </span>
                        <span className="inline-flex items-center gap-1 rounded border border-border bg-raised px-2 py-0.5 text-[10px] font-medium text-accent">
                          <MapPin className="size-2.5" /> Abu Dhabi Clinic Map
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voice Telemetry Audio Snippet */}
                  <div className="rounded-xl border border-border bg-raised p-3 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground pb-1.5 border-b border-border">
                      <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                        <PhoneCall className="size-3 text-accent" />
                        Inbound Voice Telemetry
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">Duration: 1m 18s • Retell Voice AI</span>
                    </div>
                    <p className="mt-2 text-[10.5px] text-muted-foreground italic leading-relaxed">
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
      <div className="border-t border-border bg-panel px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-muted-foreground text-[11px] max-w-xl leading-relaxed text-center sm:text-left">
          <span className="text-foreground font-semibold">Honest Architecture Notice:</span> This
          scripted timeline demonstrates how Helix AI standardizes pre-tested, deterministic agent
          workflows. Real prospects configure customized parameters inside the interactive Studio
          sandbox.
        </div>

        {onCloseOrSkip ? (
          <button
            type="button"
            onClick={onCloseOrSkip}
            className="shrink-0 rounded-lg bg-accent text-accent-foreground px-3.5 py-1.5 text-xs font-medium hover:bg-accent/90 transition-all"
          >
            Configure Your Real System &rarr;
          </button>
        ) : (
          <a
            href="/dashboard/studio"
            className="shrink-0 rounded-lg bg-accent text-accent-foreground px-3.5 py-1.5 text-xs font-medium hover:bg-accent/90 transition-all"
          >
            Open Interactive Studio &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
