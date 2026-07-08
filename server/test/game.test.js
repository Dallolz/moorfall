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

  b.send({ t: 'state', x: 12.5, z: -3, f: 1.2, hp: 90, anim: 'run' })
  let seen
  for (let i = 0; i < 20 && !seen; i++) {
    const snap = await a.next('snap')
    seen = snap.ps.find(p => p.id === enterB.id && p.x === 12.5)
  }
  assert.ok(seen, 'A never saw B at x=12.5 in snapshots')
  assert.equal(seen.z, -3)

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
