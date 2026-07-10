import { hashPassword, verifyPassword } from './auth.js'
import { createMobs } from './mobs.js'

// v2 trust boundary: the server owns accounts, characters, world presence,
// the mob registry (spawns, respawns, kill credit) and bounds movement speed
// and damage. Mob AI is simulated by one "owner" client per pack and relayed;
// full server-side simulation is a later milestone.

const NAME_RE = /^[\p{L}\p{N} _'-]{2,16}$/u
const MAX_CHARS_PER_ACCOUNT = 8
const CHAT_WINDOW_MS = 5000
const CHAT_MAX_IN_WINDOW = 5
const SAY_RANGE = 40
const MAX_SPEED = 25 // u/s, dash et montures compris
const MAX_PLAYER_HIT = 2000
const TP_COOLDOWN_MS = 4000
const PARTY_MAX = 5
const PARTY_XP_RANGE = 80

export function createGame(db) {
  const sessions = new Set()
  const mobs = createMobs()
  const parties = new Map() // partyId -> Set<charId>
  const invites = new Map() // charId invité -> partyId
  let partySeq = 0
  let shuttingDown = false
  let ownerT = 0

  function sessOf(charId) {
    for (const s of sessions) if (s.charId === charId) return s
    return null
  }
  function refreshOwners() {
    const players = [...sessions].filter(s => s.charId).map(s => ({ charId: s.charId, x: s.live.x, z: s.live.z }))
    for (const cid of mobs.assignOwners(players)) {
      const s = sessOf(cid)
      if (s) send(s, { t: 'eown', owned: mobs.ownedBy(cid) })
    }
  }

  function partyOf(charId) {
    for (const [pid, members] of parties) if (members.has(charId)) return pid
    return null
  }
  function partyUpdate(pid) {
    const members = parties.get(pid)
    if (!members) return
    const list = [...members].map(cid => {
      const s = sessOf(cid)
      return s ? { id: cid, name: s.charName, classe: s.classe, lvl: s.lvl } : null
    }).filter(Boolean)
    for (const cid of members) {
      const s = sessOf(cid)
      if (s) send(s, { t: 'pupdate', members: list })
    }
  }
  function partyLeave(charId) {
    const pid = partyOf(charId)
    if (!pid) return
    const members = parties.get(pid)
    members.delete(charId)
    const s = sessOf(charId)
    if (s) send(s, { t: 'pupdate', members: [] })
    if (members.size <= 1) {
      for (const cid of members) {
        const ms = sessOf(cid)
        if (ms) send(ms, { t: 'pupdate', members: [] })
      }
      parties.delete(pid)
    } else {
      partyUpdate(pid)
    }
  }
  // membres du groupe des damagers à portée du mob tué → crédit partagé
  function expandParts(parts, mob) {
    const out = new Set(parts)
    for (const cid of parts) {
      const pid = partyOf(cid)
      if (!pid) continue
      for (const mid of parties.get(pid)) {
        const ms = sessOf(mid)
        if (ms && Math.hypot(ms.live.x - mob.x, ms.live.z - mob.z) <= PARTY_XP_RANGE) out.add(mid)
      }
    }
    return [...out]
  }

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
      const pos = char.blob.pos || { x: 0, z: 189 }
      sess.live = { x: pos.x, z: pos.z, f: 0, hp: char.blob.hp ?? 100, mhp: 100, anim: 'idle', mnt: 0, atk: '' }
      const players = [...sessions].filter(s => s !== sess && s.charId).map(publicState)
      send(sess, { t: 'enterok', id: char.id, blob: char.blob, players })
      broadcast({ t: 'join', p: publicState(sess) }, sess)
      refreshOwners()
      send(sess, { t: 'eworld', ents: mobs.visibleFor(char.id, sess.live.x, sess.live.z), owned: mobs.ownedBy(char.id) })
    },
    state(sess, m) {
      if (!sess.charId) return
      if (typeof m.x === 'number' && isFinite(m.x) && typeof m.z === 'number' && isFinite(m.z)) {
        const nx = Math.max(-390, Math.min(390, m.x))
        const nz = Math.max(-390, Math.min(390, m.z))
        const now = Date.now()
        const dt = Math.min(0.5, (now - (sess.moveAt || now)) / 1000)
        sess.moveAt = now
        const dx = nx - sess.live.x, dz = nz - sess.live.z
        const d = Math.hypot(dx, dz)
        const allowed = MAX_SPEED * dt + 0.5
        if (m.tp && now - (sess.tpAt || 0) > TP_COOLDOWN_MS) {
          sess.tpAt = now
          sess.live.x = nx; sess.live.z = nz
        } else if (d <= allowed || d === 0) {
          sess.live.x = nx; sess.live.z = nz
        } else {
          sess.live.x += dx / d * allowed
          sess.live.z += dz / d * allowed
        }
      }
      if (typeof m.f === 'number' && isFinite(m.f)) sess.live.f = m.f
      if (typeof m.hp === 'number' && isFinite(m.hp)) sess.live.hp = m.hp
      if (typeof m.mhp === 'number' && isFinite(m.mhp)) sess.live.mhp = Math.max(1, Math.round(m.mhp))
      if (typeof m.anim === 'string' && m.anim.length <= 12) sess.live.anim = m.anim
      if (typeof m.mnt === 'number') sess.live.mnt = m.mnt | 0
      if (typeof m.atk === 'string' && m.atk.length <= 16) sess.live.atk = m.atk
    },
    epack(sess, m) {
      if (!sess.charId) return
      mobs.applyPackUpdate(sess.charId, m.ents)
    },
    ehit(sess, m) {
      if (!sess.charId) return
      const dmg = mobs.registerHit(sess.charId, String(m.id), m.dmg)
      if (dmg === null) return
      const owner = mobs.ownerOf(String(m.id))
      if (!owner || owner === sess.charId) return
      const os = sessOf(owner)
      if (os) send(os, {
        t: 'ehitf', id: m.id, dmg,
        fx: +m.fx || 0, fz: +m.fz || 0, force: Math.min(2000, +m.force || 0),
        slow: +m.slow || 0, dot: m.dot ? 1 : 0, up: typeof m.up === 'number' ? m.up : 0.35,
      })
    },
    eatkp(sess, m) {
      if (!sess.charId) return
      if (mobs.ownerOf(String(m.eid)) !== sess.charId) return
      const target = sessOf(String(m.pid))
      if (!target) return
      send(target, {
        t: 'ehitp', dmg: Math.max(1, Math.min(MAX_PLAYER_HIT, Math.round(m.dmg) || 1)),
        fx: +m.fx || 0, fz: +m.fz || 0, force: Math.min(2000, +m.force || 0),
      })
    },
    edie(sess, m) {
      if (!sess.charId) return
      const parts = mobs.kill(sess.charId, String(m.id))
      if (!parts) return
      const mob = mobs.get(String(m.id))
      const all = mob ? expandParts(parts, mob) : parts
      broadcast({ t: 'edie', id: m.id, parts: all, fx: +m.fx || 0, fz: +m.fz || 0, force: Math.min(2000, +m.force || 0) })
    },
    pinvite(sess, m) {
      if (!sess.charId) return
      const target = [...sessions].find(s => s.charId && s.charName.toLowerCase() === String(m.name || '').toLowerCase())
      if (!target || target === sess) return err(sess, 'noplayer', 'joueur introuvable')
      if (partyOf(target.charId)) return err(sess, 'inparty', target.charName + ' est déjà dans un groupe')
      let pid = partyOf(sess.charId)
      if (pid && parties.get(pid).size >= PARTY_MAX) return err(sess, 'full', 'groupe complet')
      if (!pid) {
        pid = 'p' + ++partySeq
        parties.set(pid, new Set([sess.charId]))
      }
      invites.set(target.charId, pid)
      send(target, { t: 'pinvited', from: sess.charName })
      send(sess, { t: 'chat', from: '⚔', msg: 'Invitation envoyée à ' + target.charName })
    },
    paccept(sess) {
      if (!sess.charId) return
      const pid = invites.get(sess.charId)
      invites.delete(sess.charId)
      const members = pid && parties.get(pid)
      if (!members || members.size >= PARTY_MAX) return err(sess, 'noinvite', 'aucune invitation valable')
      if (partyOf(sess.charId)) partyLeave(sess.charId)
      members.add(sess.charId)
      partyUpdate(pid)
    },
    pleave(sess) {
      if (sess.charId) partyLeave(sess.charId)
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
      const ch = m.p ? 'p' : typeof m.ch === 'string' ? m.ch : 'say'
      if (ch === 'p') {
        const pid = partyOf(sess.charId)
        if (!pid) return err(sess, 'noparty', 'tu n\'es pas dans un groupe')
        for (const cid of parties.get(pid)) {
          const ms = sessOf(cid)
          if (ms) send(ms, { t: 'chat', from: sess.charName, msg, p: 1, ch: 'p' })
        }
        return
      }
      if (ch === 'w') {
        const target = [...sessions].find(s => s.charId && s.charName.toLowerCase() === String(m.to || '').toLowerCase())
        if (!target || target === sess) return err(sess, 'noplayer', 'joueur introuvable')
        send(target, { t: 'chat', from: sess.charName, msg, ch: 'w' })
        send(sess, { t: 'chat', from: sess.charName, to: target.charName, msg, ch: 'w', self: 1 })
        if (target.afk) send(sess, { t: 'chat', from: target.charName, msg: '[absent] ' + (target.afkMsg || 'de retour bientôt'), ch: 'w' })
        return
      }
      if (ch === 'world') return broadcast({ t: 'chat', from: sess.charName, msg, ch: 'world' })
      for (const s of sessions) {
        if (s.charId && Math.hypot(s.live.x - sess.live.x, s.live.z - sess.live.z) <= SAY_RANGE)
          send(s, { t: 'chat', from: sess.charName, msg, ch: 'say', id: sess.charId })
      }
    },
    afk(sess, m) {
      if (!sess.charId) return
      sess.afk = !sess.afk
      sess.afkMsg = sess.afk && typeof m.msg === 'string' ? m.msg.trim().slice(0, 80) : ''
      send(sess, { t: 'chat', from: '⚔', msg: sess.afk ? 'Tu es maintenant absent.' : 'Te revoilà.' })
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
          partyLeave(sess.charId)
          invites.delete(sess.charId)
          broadcast({ t: 'leave', id: sess.charId })
          refreshOwners()
        }
      })
    },
    snapshot(dt = 0.1) {
      mobs.tickRespawn(dt)
      ownerT += dt
      if (ownerT >= 1) { ownerT = 0; refreshOwners() }
      const inWorld = [...sessions].filter(s => s.charId)
      for (const s of inWorld) {
        const ps = inWorld.filter(o => o !== s).map(o => ({
          id: o.charId,
          x: o.live.x,
          z: o.live.z,
          f: o.live.f,
          hp: o.live.hp,
          mhp: o.live.mhp,
          anim: o.live.anim,
          mnt: o.live.mnt,
          atk: o.live.atk,
        }))
        send(s, { t: 'snap', ps })
        const ents = mobs.visibleFor(s.charId, s.live.x, s.live.z)
        if (ents.length) send(s, { t: 'esnap', ents })
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
