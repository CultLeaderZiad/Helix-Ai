import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session || session.claims.role !== 'agency_admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403, headers })
  }

  const adminDb = createSupabaseAdminClient()
  const { data: keys, error } = await (adminDb as any)
    .from('helix_api_keys')
    .select('id, client_id, label, key_prefix, scopes, rate_per_minute, last_used_at, revoked_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers })
  return NextResponse.json({ keys: keys || [] }, { headers })
}

export async function POST(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session || session.claims.role !== 'agency_admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403, headers })
  }

  const body = await request.json()
  const { label, client_id = null, rate_per_minute = 10, scopes = ['read', 'write'] } = body

  if (!label || typeof label !== 'string') {
    return NextResponse.json({ error: 'label is required' }, { status: 400, headers })
  }

  // Generate plain secret
  const secretRandom = crypto.randomBytes(24).toString('hex')
  const plainKey = `hx_live_${secretRandom}`
  const keyPrefix = plainKey.slice(0, 15)

  const pepper = process.env.HELIX_API_KEY_PEPPER || 'helix-default-salt-pepper'
  const keyHash = crypto
    .createHash('sha256')
    .update(`${pepper}${plainKey}`)
    .digest('hex')

  const adminDb = createSupabaseAdminClient()
  const { data: keyRow, error: insertErr } = await (adminDb as any)
    .from('helix_api_keys')
    .insert({
      client_id: client_id || null,
      label,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes,
      rate_per_minute,
      created_by: session.user.id
    })
    .select('id, client_id, label, key_prefix, scopes, rate_per_minute, created_at')
    .single()

  if (insertErr || !keyRow) {
    return NextResponse.json({ error: insertErr?.message || 'Failed to create key' }, { status: 500, headers })
  }

  // Plaintext returned ONCE on creation
  return NextResponse.json({
    ok: true,
    key: keyRow,
    plaintext_key: plainKey
  }, { status: 201, headers })
}

export async function DELETE(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session || session.claims.role !== 'agency_admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403, headers })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Key id required' }, { status: 400, headers })

  const adminDb = createSupabaseAdminClient()
  await (adminDb as any)
    .from('helix_api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ ok: true }, { headers })
}
