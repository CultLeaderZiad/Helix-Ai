import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { describe, it } from 'node:test'
import { hashWebhookSecret } from '../lib/webhooks/secret.ts'

describe('webhook secret hash', () => {
  it('stores sha256 hex, not the secret', () => {
    const secret = 'hello'
    const hash = hashWebhookSecret(secret)
    assert.equal(hash, createHash('sha256').update(secret, 'utf8').digest('hex'))
    assert.equal(hash, '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    assert.notEqual(hash, secret)
    assert.match(hash, /^[0-9a-f]{64}$/)
  })

  it('trims surrounding spaces before hashing', () => {
    assert.equal(hashWebhookSecret('  hello  '), hashWebhookSecret('hello'))
  })
})
