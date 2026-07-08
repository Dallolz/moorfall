import { hashPassword, verifyPassword } from './auth.js'

// v1 trust boundary: the server owns accounts, characters and who is in the
// world; it RELAYS positions/hp sent by clients without simulating them.
// Server-authoritative movement and combat are a later milestone.

const NAME_RE = /^[\p{L}\p{N} _'-]{2,16}$/u
const MAX_CHARS_PER_ACCOUNT = 8
const CHAT_WINDOW_MS = 5000
const CHAT_MAX_IN_WINDOW = 5

export function createGame(db) {
  const sessions = new Set()
  let shuttingDown = false

  function send(sess, msg) {
    if (sess.ws.readyState === 1) sess.ws.send(JSON.stringify(msg))
  }
  function err(sess, code, msg) {
    send(sess, { t: 'err', code, msg })
  }
  function broadcast(msg, except) {
    for (const s of sessions) if (s !== except && s.charId) send(s, msg)
  }

  function publicState(sess) {
    return {
      id: sess.charId,
      name: sess.charName,
      classe: sess.classe,
      lvl: sess.lvl,
      wstyle: sess.wstyle,
      ...sess.live,
    }
  }

  function persist(sess) {
    if (!sess.charId || !sess.blob) return
    const blob = { ...sess.blob, pos: { x: sess.live.x, z: sess.live.z }, hp: sess.live.hp }
    db.saveCharacter(sess.account.id, sess.charId, blob)
  }

  const handlers = {
    async register(sess, m) {
      if (sess.account) return err(sess, 'state', 'déjà connecté')
      if (typeof m.name !== 'string' || !NAME_RE.test(m.name)) return err(sess, 'name', 'pseudo invalide (2-16 caractères)')
      if (typeof m.pass !== 'string' || m.pass.length < 6) return err(sess, 'pass', 'mot de passe trop court (6 min)')
      if (db.findAccount(m.name)) return err(sess, 'taken', 'pseudo déjà pris')
      sess.account = db.createAccount(m.name, await hashPassword(m.pass))
      send(sess, { t: 'authok', chars: [] })
    },
    async auth(sess, m) {
      if (sess.account) return err(sess, 'state', 'déjà connecté')
      const acc = typeof m.name === 'string' ? db.findAccount(m.name) : undefined
      if (!acc || typeof m.pass !== 'string' || !(await verifyPassword(m.pass, acc.hash))) {
        return err(sess, 'auth', 'pseudo ou mot de passe incorrect')
      }
      sess.account = acc
      send(sess, { t: 'authok', chars: db.listCharacters(acc.id) })
    },
    create(sess, m) {
      if (!sess.account) return err(sess, 'noauth', 'non connecté')
      if (typeof m.nom !== 'string' || !NAME_RE.test(m.nom)) return err(sess, 'name', 'nom de personnage invalide')
      if (typeof m.classe !== 'string' || m.classe.length > 24) return err(sess, 'classe', 'classe invalide')
      if (db.listCharacters(sess.account.id).length >= MAX_CHARS_PER_ACCOUNT) return err(sess, 'full', 'trop de personnages')
      const blob = { classe: m.classe, wstyle: typeof m.wstyle === 'string' && m.wstyle.length <= 8 ? m.wstyle : 'w1', lvl: 1 }
      let char
      try {
        char = db.createCharacter(sess.account.id, m.nom, m.classe, blob)
      } catch {
        return err(sess, 'taken', 'ce nom est déjà pris')
      }
      send(sess, { t: 'created', char })
    },
    delete(sess, m) {
      if (!sess.account) return err(sess, 'noauth', 'non connecté')
      db.deleteCharacter(sess.account.id, String(m.charId))
      send(sess, { t: 'authok', chars: db.listCharacters(sess.account.id) })
    },
    enter(sess, m) {
      if (!sess.account) return err(sess, 'noauth', 'non connecté')
      if (sess.charId) return err(sess, 'state', 'déjà en jeu')
      const char = db.loadCharacter(sess.account.id, String(m.charId))
      if (!char) return err(sess, 'nochar', 'personnage introuvable')
      for (const s of sessions) {
        if (s.charId === char.id) return err(sess, 'dupe', 'personnage déjà en jeu')
      }
      sess.charId = char.id
      sess.charName = char.name
      sess.classe = char.classe
      sess.lvl = char.lvl
      sess.wstyle = char.blob.wstyle || 'w1'
      sess.blob = char.blob
      const pos = char.blob.pos || { x: 0, z: 126 }
      sess.live = { x: pos.x, z: pos.z, f: 0, hp: char.blob.hp ?? 100, anim: 'idle', mnt: 0 }
      const players = [...sessions].filter(s => s !== sess && s.charId).map(publicState)
      send(sess, { t: 'enterok', id: char.id, blob: char.blob, players })
      broadcast({ t: 'join', p: publicState(sess) }, sess)
    },
    state(sess, m) {
      if (!sess.charId) return
      if (typeof m.x === 'number' && isFinite(m.x)) sess.live.x = Math.max(-260, Math.min(260, m.x))
      if (typeof m.z === 'number' && isFinite(m.z)) sess.live.z = Math.max(-260, Math.min(260, m.z))
      if (typeof m.f === 'number' && isFinite(m.f)) sess.live.f = m.f
      if (typeof m.hp === 'number' && isFinite(m.hp)) sess.live.hp = m.hp
      if (typeof m.anim === 'string' && m.anim.length <= 12) sess.live.anim = m.anim
      if (typeof m.mnt === 'number') sess.live.mnt = m.mnt | 0
    },
    save(sess, m) {
      if (!sess.charId || typeof m.blob !== 'object' || m.blob === null) return
      sess.blob = m.blob
      sess.lvl = m.blob.lvl || sess.lvl
      persist(sess)
    },
    chat(sess, m) {
      if (!sess.charId || typeof m.msg !== 'string') return
      const msg = m.msg.trim().slice(0, 200)
      if (!msg) return
      const now = Date.now()
      sess.chatTimes = (sess.chatTimes || []).filter(t => now - t < CHAT_WINDOW_MS)
      if (sess.chatTimes.length >= CHAT_MAX_IN_WINDOW) return err(sess, 'ratelimit', 'doucement sur le chat')
      sess.chatTimes.push(now)
      broadcast({ t: 'chat', from: sess.charName, msg })
    },
  }

  return {
    connect(ws) {
      const sess = { ws, account: null, charId: null }
      sessions.add(sess)
      ws.on('message', async raw => {
        if (raw.length > 64 * 1024) return ws.close(1009, 'trop gros')
        let m
        try {
          m = JSON.parse(raw)
        } catch {
          return
        }
        const h = handlers[m?.t]
        if (h) {
          try {
            await h(sess, m)
          } catch (e) {
            console.error('handler', m.t, e)
            err(sess, 'internal', 'erreur serveur')
          }
        }
      })
      ws.on('close', () => {
        sessions.delete(sess)
        if (sess.charId && !shuttingDown) {
          persist(sess)
          broadcast({ t: 'leave', id: sess.charId })
        }
      })
    },
    snapshot() {
      const inWorld = [...sessions].filter(s => s.charId)
      for (const s of inWorld) {
        const ps = inWorld.filter(o => o !== s).map(o => ({
          id: o.charId,
          x: o.live.x,
          z: o.live.z,
          f: o.live.f,
          hp: o.live.hp,
          anim: o.live.anim,
          mnt: o.live.mnt,
        }))
        send(s, { t: 'snap', ps })
      }
    },
    saveAll() {
      for (const s of sessions) persist(s)
    },
    shutdown() {
      shuttingDown = true
      this.saveAll()
    },
    playerCount() {
      return [...sessions].filter(s => s.charId).length
    },
  }
}
