import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMobs, SPAWN_DATA, eHp } from '../src/mobs.js'

test('registry builds one enemy per spawn slot with correct hp', () => {
  const mobs = createMobs()
  const expected = SPAWN_DATA.reduce((a, sd) => a + sd.n, 0)
  assert.equal(mobs.enemies.length, expected)
  const boss = mobs.enemies.find(e => e.type === 'berger')
  assert.equal(boss.maxHp, eHp(14, true))
})

test('nearest player owns the pack, with hysteresis', () => {
  const mobs = createMobs()
  const changed = mobs.assignOwners([{ charId: 'A', x: 0, z: 126 }])
  assert.ok(changed.includes('A'))
  const owned = mobs.ownedBy('A')
  assert.ok(owned.length > 0, 'A owns the packs near spawn')
  // B arrive au même endroit : hystérésis, A garde tout
  mobs.assignOwners([{ charId: 'A', x: 0, z: 126 }, { charId: 'B', x: 0, z: 126 }])
  assert.equal(mobs.ownedBy('B').length, 0)
  // A part très loin : B récupère
  mobs.assignOwners([{ charId: 'A', x: -250, z: -250 }, { charId: 'B', x: 0, z: 126 }])
  assert.ok(mobs.ownedBy('B').length > 0)
})

test('abandoned packs reset to home and full hp', () => {
  const mobs = createMobs()
  mobs.assignOwners([{ charId: 'A', x: 0, z: 126 }])
  const id = mobs.ownedBy('A')[0]
  mobs.applyPackUpdate('A', [{ id, x: mobs.get(id).hx + 5, z: mobs.get(id).hz, hp: 10 }])
  assert.equal(mobs.get(id).hp, 10)
  mobs.assignOwners([])
  assert.equal(mobs.get(id).hp, mobs.get(id).maxHp)
  assert.equal(mobs.get(id).x, mobs.get(id).hx)
})

test('pack updates are rejected from non-owners and clamped to leash', () => {
  const mobs = createMobs()
  mobs.assignOwners([{ charId: 'A', x: 0, z: 126 }])
  const id = mobs.ownedBy('A')[0]
  const e = mobs.get(id)
  mobs.applyPackUpdate('B', [{ id, hp: 1 }])
  assert.equal(e.hp, e.maxHp)
  mobs.applyPackUpdate('A', [{ id, x: e.hx + 500, hp: e.maxHp * 10 }])
  assert.equal(e.x, e.hx + 60)
  assert.equal(e.hp, e.maxHp)
})

test('kill: only the owner reports, participants collected, respawn resets', () => {
  const mobs = createMobs()
  mobs.assignOwners([{ charId: 'A', x: 0, z: 126 }])
  const id = mobs.ownedBy('A')[0]
  assert.equal(mobs.registerHit('B', id, 50), 50)
  assert.equal(mobs.registerHit('B', id, 1e9), 5000, 'damage clamped')
  assert.equal(mobs.kill('B', id), null, 'non-owner cannot report the kill')
  const parts = mobs.kill('A', id)
  assert.deepEqual(parts.sort(), ['A', 'B'])
  assert.equal(mobs.get(id).alive, false)
  assert.equal(mobs.registerHit('B', id, 50), null, 'no hits on dead mobs')
  mobs.tickRespawn(20)
  assert.equal(mobs.get(id).alive, true)
  assert.equal(mobs.get(id).hp, mobs.get(id).maxHp)
})
