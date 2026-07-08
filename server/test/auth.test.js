import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../src/auth.js'

test('verifyPassword accepts the original password', async () => {
  const hash = await hashPassword('grimoire-42')
  assert.equal(await verifyPassword('grimoire-42', hash), true)
})

test('verifyPassword rejects a wrong password', async () => {
  const hash = await hashPassword('grimoire-42')
  assert.equal(await verifyPassword('grimoire-43', hash), false)
})

test('hashing the same password twice gives different hashes (salted)', async () => {
  const a = await hashPassword('même-mdp')
  const b = await hashPassword('même-mdp')
  assert.notEqual(a, b)
})
