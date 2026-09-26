import 'server-only'

import fs from 'fs'
import path from 'path'
import { createSupabaseServerClient } from '@/lib/supabase'

const FILES: Record<string, string> = {
  faqs: 'faqs.json',
  pricing: 'pricing.json',
  updates: 'updates.json',
}

function localPath(key: string): string | null {
  const file = FILES[key]
  if (!file) return null
  return path.join(process.cwd(), 'data', file)
}

function writeLocal(key: string, payload: unknown): boolean {
  const filePath = localPath(key)
  if (!filePath) return false
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error(`site document file write failed for ${key}:`, error)
    return false
  }
}

export async function loadSiteDocument<T>(key: string): Promise<T | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('site_documents')
      .select('payload')
      .eq('doc_key', key)
      .maybeSingle()
    if (error || data?.payload == null) return null
    return data.payload as T
  } catch {
    return null
  }
}

/**
 * Prefer Supabase so production (read-only filesystem) keeps the edit.
 * A local JSON write counts only outside Vercel.
 */
export async function persistSiteDocument(
  key: string,
  payload: unknown,
): Promise<{ ok: boolean; error?: string }> {
  let remoteError: string | null = null
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('site_documents').upsert(
      { doc_key: key, payload, updated_at: new Date().toISOString() },
      { onConflict: 'doc_key' },
    )
    if (!error) {
      writeLocal(key, payload)
      return { ok: true }
    }
    remoteError = error.message
  } catch (error) {
    remoteError = error instanceof Error ? error.message : 'Supabase is not configured.'
  }

  const onVercel = Boolean(process.env.VERCEL)
  if (!onVercel && writeLocal(key, payload)) return { ok: true }
  return {
    ok: false,
    error: remoteError || 'Could not save this document. Apply the site_documents migration and sign in as an agency admin.',
  }
}
