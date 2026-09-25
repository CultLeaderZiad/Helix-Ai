'use client'

import React from 'react'
import { DirectionProvider } from '@/components/ui/direction'
import { LanguageProvider, useLanguage, type Language } from '@/components/shell/language-context'
import { MotionProvider } from './motion-provider'

import { Toaster } from '@/components/ui/sonner'

function DirectionAndMotionLayer({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage()
  return (
    <DirectionProvider direction={dir}>
      <MotionProvider>
        {children}
        <Toaster />
      </MotionProvider>
    </DirectionProvider>
  )
}

export function AppProviders({
  children,
  initialLanguage = 'en',
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <DirectionAndMotionLayer>
        {children}
      </DirectionAndMotionLayer>
    </LanguageProvider>
  )
}
