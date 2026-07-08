import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDb } from '../src/db.js'

function freshDb() {
  return openDb(':memory:')
}

test('createAccount then findAccount round-trips', () => {
  const db = freshDb()
  const acc = db.createAccount('Luc', 'fakehash')
  assert.ok(acc.id)
  const found = db.findAccount('Luc')
  assert.equal(found.id, acc.id)
  assert.equal(found.hash, 'fakehash')
})

test('account names are unique, case-insensitive', () => {
  const db = freshDb()
  db.createAccount('Luc', 'h1')
  assert.throws(() => db.createAccount('luc', 'h2'))
})

test('createCharacter stores the blob and lists metadata', () => {
  const db = freshDb()
  const acc = db.createAccount('Luc', 'h')
  const blob = { classe: 'ecorcheur', lvl: 1, gold: 0, pos: { x: 0, z: 126 } }
  const c = db.createCharacter(acc.id, 'Morgan', 'ecorcheur', blob)
  assert.ok(c.id)
  const list = db.listCharacters(acc.id)
  assert.equal(list.length, 1)
  assert.equal(list[0].name, 'Morgan')
  assert.equal(list[0].classe, 'ecorcheur')
  assert.equal(list[0].lvl, 1)
})

test('saveCharacter updates blob and lvl, scoped to owner', () => {
  const db = freshDb()
  const acc = db.createAccount('Luc', 'h')
  const other = db.createAccount('Intrus', 'h')
  const c = db.createCharacter(acc.id, 'Morgan', 'ecorcheur', { lvl: 1 })
  db.saveCharacter(acc.id, c.id, { lvl: 7, gold: 300 })
  const loaded = db.loadCharacter(acc.id, c.id)
  assert.equal(loaded.blob.lvl, 7)
  assert.equal(loaded.blob.gold, 300)
  assert.equal(db.listCharacters(acc.id)[0].lvl, 7)
  assert.equal(db.loadCharacter(other.id, c.id), undefined)
})

test('deleteCharacter removes it, scoped to owner', () => {
  const db = freshDb()
  const acc = db.createAccount('Luc', 'h')
  const other = db.createAccount('Intrus', 'h')
  const c = db.createCharacter(acc.id, 'Morgan', 'ecorcheur', { lvl: 1 })
  db.deleteCharacter(other.id, c.id)
  assert.equal(db.listCharacters(acc.id).length, 1)
  db.deleteCharacter(acc.id, c.id)
  assert.equal(db.listCharacters(acc.id).length, 0)
})

test('character names are unique per realm, case-insensitive', () => {
  const db = freshDb()
  const a = db.createAccount('Luc', 'h')
  const b = db.createAccount('Zoe', 'h')
  db.createCharacter(a.id, 'Morgan', 'ecorcheur', {})
  assert.throws(() => db.createCharacter(b.id, 'morgan', 'ossuaire', {}))
})
