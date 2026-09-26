import { NextRequest, NextResponse } from 'next/server'
import { authenticateMcpKey } from '@/lib/search/mcp/auth'
import { MCP_TOOLS } from '@/lib/search/mcp/tools'
import { runAction } from '@/lib/search/bus'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * MCP-compliant Streamable HTTP endpoint supporting:
 * - 2026-07-28 (Streamable HTTP)
 * - 2025-06-18 (Standard initialize / tools/list / tools/call)
 */
export async function POST(request: NextRequest) {
  // 1. Authenticate API Key
  const authHeader = request.headers.get('Authorization')
  const keyInfo = await authenticateMcpKey(authHeader)

  if (!keyInfo) {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized API key' }, id: null },
      { status: 401 }
    )
  }

  // 2. Parse JSON-RPC Payload
  let rpc: any
  try {
    rpc = await request.json()
  } catch {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
      { status: 400 }
    )
  }

  const { jsonrpc = '2.0', id = 1, method, params = {} } = rpc

  // Protocol version check
  const protocolHeader = request.headers.get('MCP-Protocol-Version') || params?._meta?.['io.modelcontextprotocol/protocolVersion']

  // 3. Methods
  if (method === 'initialize' || method === 'server/discover' || method === 'ping') {
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        protocolVersion: protocolHeader || '2026-07-28',
        capabilities: { tools: {} },
        serverInfo: { name: 'helix-search-mcp', version: '2.0.0' }
      }
    })
  }

  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc,
      id,
      result: { tools: MCP_TOOLS }
    })
  }

  if (method === 'tools/call') {
    const toolName = params.name
    const toolArgs = params.arguments || {}

    // Resolve tenant client_id
    const clientId = keyInfo.client_id || params.client_id
    if (!clientId) {
      return NextResponse.json({
        jsonrpc,
        id,
        error: { code: -32602, message: 'Agency keys must specify client_id in arguments' }
      })
    }

    try {
      if (toolName === 'search_web') {
        const actionRes = await runAction({
          kind: 'search_web',
          origin: 'mcp',
          actor: { type: 'api_key', clientId, keyId: keyInfo.id },
          input: {
            query: toolArgs.query,
            mode: toolArgs.mode || 'everything',
            country: toolArgs.country,
            language: toolArgs.language,
            limit: toolArgs.limit || 20
          }
        })

        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(actionRes.data?.results || [], null, 2) }],
            structuredContent: actionRes.data,
            isError: !actionRes.ok
          }
        })
      }

      if (toolName === 'enrich_url') {
        const actionRes = await runAction({
          kind: 'enrich_url',
          origin: 'mcp',
          actor: { type: 'api_key', clientId, keyId: keyInfo.id },
          input: {
            url: toolArgs.url,
            params: { hunter: { enabled: Boolean(toolArgs.hunter) } }
          }
        })

        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(actionRes.data || {}, null, 2) }],
            structuredContent: actionRes.data,
            isError: !actionRes.ok
          }
        })
      }

      if (toolName === 'find_leads') {
        const actionRes = await runAction({
          kind: 'find_leads',
          origin: 'mcp',
          actor: { type: 'api_key', clientId, keyId: keyInfo.id },
          input: {
            query: toolArgs.query,
            limit: toolArgs.limit || 20
          }
        })

        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(actionRes.data?.hits || [], null, 2) }],
            structuredContent: actionRes.data,
            isError: !actionRes.ok
          }
        })
      }

      if (toolName === 'get_watch_results') {
        const supabase = createSupabaseAdminClient()
        const { data: watchResults } = await (supabase as any)
          .from('search_results')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(20)

        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(watchResults || [], null, 2) }],
            structuredContent: watchResults,
            isError: false
          }
        })
      }

      return NextResponse.json({
        jsonrpc,
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` }
      })
    } catch (err: any) {
      return NextResponse.json({
        jsonrpc,
        id,
        result: {
          content: [{ type: 'text', text: err?.message || 'Tool execution failed' }],
          isError: true
        }
      })
    }
  }

  return NextResponse.json({
    jsonrpc,
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  })
}
