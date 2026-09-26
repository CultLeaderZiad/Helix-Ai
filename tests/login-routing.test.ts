import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveLoginPath, type LoginPath } from '../lib/auth/portal-route.ts'

function assertHome(path: LoginPath) {
  assert.ok(path === '/admin' || path === '/dashboard')
}

describe('login routing', () => {
  it('sends a client to the workspace', () => {
    assert.equal(resolveLoginPath({ role: 'client_user' }), '/dashboard')
    assert.equal(resolveLoginPath({ role: 'client_staff' }), '/dashboard')
  })

  it('sends an agency admin to the agency console', () => {
    assert.equal(resolveLoginPath({ role: 'agency_admin' }), '/admin')
    assert.equal(resolveLoginPath({ role: 'agency_admin', portal: null }), '/admin')
  })

  it('keeps a client on the workspace when they open the agency login', () => {
    const path = resolveLoginPath({ role: 'client_user', portal: 'agency' })
    assert.equal(path, '/dashboard')
    assertHome(path)
    assert.equal(resolveLoginPath({ role: 'client_staff', portal: 'admin' }), '/dashboard')
  })

  it('does not sign anyone out: every account receives a home path', () => {
    const cases = [
      resolveLoginPath({ role: 'client_user', portal: 'agency' }),
      resolveLoginPath({ role: 'agency_admin' }),
      resolveLoginPath({ role: 'client_staff', portal: 'admin' }),
      resolveLoginPath({
        role: 'client_user',
        roles: ['client_user', 'agency_admin'],
        portal: 'agency',
      }),
    ]
    for (const path of cases) assertHome(path)
  })

  it('forces the agency console only for dual-role users who ask for it', () => {
    assert.equal(
      resolveLoginPath({
        role: 'client_user',
        roles: ['client_user', 'agency_admin'],
        portal: 'agency',
      }),
      '/admin',
    )
    assert.equal(
      resolveLoginPath({
        role: 'client_user',
        roles: ['client_user', 'agency_admin'],
        portal: 'admin',
      }),
      '/admin',
    )
    assert.equal(
      resolveLoginPath({
        role: 'client_user',
        roles: ['client_user', 'agency_admin'],
      }),
      '/dashboard',
    )
    assert.equal(
      resolveLoginPath({
        role: 'agency_admin',
        roles: ['agency_admin', 'client_user'],
      }),
      '/admin',
    )
  })
})
