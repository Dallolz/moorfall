import { test } from 'node:test'
import assert from 'node:assert/strict'
import WebSocket from 'ws'
import { startServer } from '../src/main.js'

function client(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`)
  const queue = []
  const waiters = []
  ws.on('message', raw => {
    const msg = JSON.parse(raw)
    const i = waiters.findIndex(w => msg.t === w.type)
    if (i >= 0) waiters.splice(i, 1)[0].resolve(msg)
    else queue.push(msg)
  })
  return {
    ws,
    send: m => ws.send(JSON.stringify(m)),
    next(type, timeout = 3000) {
      const i = queue.findIndex(m => m.t === type)
      if (i >= 0) return Promise.resolve(queue.splice(i, 1)[0])
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`timeout waiting for '${type}'`)), timeout)
        waiters.push({ type, resolve: m => { clearTimeout(timer); resolve(m) } })
      })
    },
    open: () => new Promise(r => ws.on('open', r)),
    close: () => ws.close(),
  }
}

async function loggedIn(port, name) {
  const c = client(port)
  await c.open()
  c.send({ t: 'register', name, pass: 'motdepasse' })
  const ok = await c.next('authok')
  return { c, chars: ok.chars }
}

test('full flow: register, create, enter, see each other, chat, persist', async t => {
  const srv = await startServer({ port: 0, dbPath: ':memory:', snapMs: 30 })
  t.after(() => srv.close())
  const port = srv.port

  const { c: a } = await loggedIn(port, 'Alice')
  a.send({ t: 'create', nom: 'Aza', classe: 'ecorcheur', wstyle: 'w2' })
  const created = await a.next('created')
  assert.equal(created.char.name, 'Aza')
  a.send({ t: 'enter', charId: created.char.id })
  const enterA = await a.next('enterok')
  assert.equal(enterA.blob.classe, 'ecorcheur')
  assert.equal(enterA.blob.wstyle, 'w2')
  assert.deepEqual(enterA.players, [])

  const { c: b } = await loggedIn(port, 'Bob')
  b.send({ t: 'create', nom: 'Bor', classe: 'ossuaire', wstyle: 'w1' })
  const createdB = await b.next('created')
  b.send({ t: 'enter', charId: createdB.char.id })
  const enterB = await b.next('enterok')
  assert.equal(enterB.players.length, 1)
  assert.equal(enterB.players[0].name, 'Aza')

  const join = await a.next('join')
  assert.equal(join.p.name, 'Bor')

  b.send({ t: 'state', x: 12.5, z: 120, f: 1.2, hp: 90, anim: 'run', tp: 1 })
  let seen
  for (let i = 0; i < 20 && !seen; i++) {
    const snap = await a.next('snap')
    seen = snap.ps.find(p => p.id === enterB.id && p.x === 12.5)
  }
  assert.ok(seen, 'A never saw B at x=12.5 in snapshots')
  assert.equal(seen.z, 120)

  b.send({ t: 'chat', msg: 'salut !' })
  const chat = await a.next('chat')
  assert.equal(chat.from, 'Bor')
  assert.equal(chat.msg, 'salut !')

  b.send({ t: 'save', blob: { classe: 'ossuaire', lvl: 5, gold: 42 } })
  b.close()
  const leave = await a.next('leave')
  assert.equal(leave.id, enterB.id)

  const c2 = client(port)
  await c2.open()
  c2.send({ t: 'auth', name: 'Bob', pass: 'motdepasse' })
  const re = await c2.next('authok')
  assert.equal(re.chars[0].lvl, 5)
  c2.send({ t: 'enter', charId: createdB.char.id })
  const reEnter = await c2.next('enterok')
  assert.equal(reEnter.blob.gold, 42)
  assert.equal(reEnter.blob.pos.x, 12.5, 'live position persisted on disconnect')
  c2.close()
  a.close()
})

test('movement speed is clamped without tp flag', async t => {
  const srv = await startServer({ port: 0, dbPath: ':memory:', snapMs: 30 })
  t.after(() => srv.close())
  const { c: a } = await loggedIn(srv.port, 'Alice')
  a.send({ t: 'create', nom: 'Aza', classe: 'ecorcheur', wstyle: 'w1' })
  const created = await a.next('created')
  a.send({ t: 'enter', charId: created.char.id })
  await a.next('enterok')
  const { c: b } = await loggedIn(srv.port, 'Bob')
  b.send({ t: 'create', nom: 'Bor', classe: 'ossuaire', wstyle: 'w1' })
  const cb = await b.next('created')
  b.send({ t: 'enter', charId: cb.char.id })
  await b.next('enterok')

  b.send({ t: 'state', x: 200, z: -200 }) // téléportation sauvage, sans tp
  let last
  for (let i = 0; i < 5; i++) {
    const snap = await a.next('snap')
    last = snap.ps[0] || last
  }
  assert.ok(last, 'B visible in snapshots')
  const dist = Math.hypot(last.x - 0, last.z - 126)
  assert.ok(dist < 30, `wild jump clamped, moved ${dist.toFixed(1)}u`)
  a.close(); b.close()
})

test('shared mobs: eworld, ownership, hit relay, kill credit, eatkp', async t => {
  const srv = await startServer({ port: 0, dbPath: ':memory:', snapMs: 30 })
  t.after(() => srv.close())

  const { c: a } = await loggedIn(srv.port, 'Alice')
  a.send({ t: 'create', nom: 'Aza', classe: 'ecorcheur', wstyle: 'w1' })
  const ca = await a.next('created')
  a.send({ t: 'enter', charId: ca.char.id })
  const enterA = await a.next('enterok')
  const worldA = await a.next('eworld')
  assert.ok(worldA.ents.length > 0, 'mobs visible near spawn')
  assert.ok(worldA.owned.length > 0, 'first player owns nearby packs')
  const ent = worldA.ents.find(e => worldA.owned.includes(e.id))
  assert.ok(ent, 'owned ents included in eworld')

  const { c: b } = await loggedIn(srv.port, 'Bob')
  b.send({ t: 'create', nom: 'Bor', classe: 'ossuaire', wstyle: 'w1' })
  const cb = await b.next('created')
  b.send({ t: 'enter', charId: cb.char.id })
  const enterB = await b.next('enterok')
  const worldB = await b.next('eworld')
  assert.equal(worldB.owned.length, 0, 'hysteresis: A keeps ownership')
  assert.ok(worldB.ents.some(e => e.id === ent.id))

  // A (owner) streame une position ; B la voit en esnap
  a.send({ t: 'epack', ents: [{ id: ent.id, x: ent.hx + 3, z: ent.hz, f: 1, st: 'chase', hp: ent.mhp - 25 }] })
  let seen
  for (let i = 0; i < 20 && !seen; i++) {
    const es = await b.next('esnap')
    seen = es.ents.find(e => e.id === ent.id && e.hp === ent.mhp - 25)
  }
  assert.ok(seen, 'B saw the streamed mob state')
  assert.equal(seen.st, 'chase')

  // B frappe : A (owner) reçoit le forward
  b.send({ t: 'ehit', id: ent.id, dmg: 40, fx: 1, fz: 0, force: 300 })
  const fwd = await a.next('ehitf')
  assert.equal(fwd.id, ent.id)
  assert.equal(fwd.dmg, 40)

  // A attaque B via un mob possédé
  a.send({ t: 'eatkp', eid: ent.id, pid: enterB.id, dmg: 22, fx: 0, fz: 1, force: 260 })
  const hitp = await b.next('ehitp')
  assert.equal(hitp.dmg, 22)

  // B (non-owner) ne peut pas rapporter le kill ; A oui, crédit aux deux
  b.send({ t: 'edie', id: ent.id, fx: 0, fz: 1, force: 300 })
  a.send({ t: 'edie', id: ent.id, fx: 0, fz: 1, force: 300 })
  const dieA = await a.next('edie')
  const dieB = await b.next('edie')
  assert.deepEqual(dieA.parts.sort(), [enterA.id, enterB.id].sort())
  assert.deepEqual(dieB.parts.sort(), dieA.parts.sort())
  a.close(); b.close()
})

test('auth failures', async t => {
  const srv = await startServer({ port: 0, dbPath: ':memory:' })
  t.after(() => srv.close())
  const c = client(srv.port)
  await c.open()
  c.send({ t: 'auth', name: 'Personne', pass: 'x' })
  assert.equal((await c.next('err')).code, 'auth')
  c.send({ t: 'register', name: 'Luc', pass: 'bon-mdp' })
  await c.next('authok')
  c.close()

  const c2 = client(srv.port)
  await c2.open()
  c2.send({ t: 'auth', name: 'Luc', pass: 'mauvais' })
  assert.equal((await c2.next('err')).code, 'auth')
  c2.send({ t: 'enter', charId: 'peu-importe' })
  assert.equal((await c2.next('err')).code, 'noauth')
  c2.close()
})

test('rejects malformed and oversized messages without crashing', async t => {
  const srv = await startServer({ port: 0, dbPath: ':memory:' })
  t.after(() => srv.close())
  const c = client(srv.port)
  await c.open()
  c.ws.send('pas du json{{{')
  c.send({ t: 'register', name: 'Luc', pass: 'motdepasse' })
  await c.next('authok')
  c.close()
})
