// Registre canonique des monstres. Le serveur n'exécute pas l'IA : chaque pack
// est simulé par un client « owner » (le joueur le plus proche) qui streame son
// état ; le serveur garde l'autorité sur spawns, respawns, crédit de kill et
// bornes de plausibilité. Copie de SPAWN_DATA/eHp/eDmg du client (index.html).

export const BOSSES = new Set(['berger', 'mere', 'pendeur', 'roi'])

export const SPAWN_DATA = [
  { type: 'creux', lvl: 3, x: -24, z: 104, n: 5, r: 11 }, { type: 'creux', lvl: 5, x: 22, z: 142, n: 5, r: 11 },
  { type: 'creux', lvl: 7, x: -14, z: 158, n: 5, r: 10 }, { type: 'traqueur', lvl: 9, x: -42, z: 132, n: 4, r: 12 },
  { type: 'traqueur', lvl: 12, x: 40, z: 106, n: 4, r: 12 }, { type: 'creux', lvl: 12, x: 62, z: 158, n: 4, r: 8 },
  { type: 'berger', lvl: 14, x: 70, z: 150, n: 1, r: 2 },
  { type: 'noyeur', lvl: 23, x: 122, z: 44, n: 5, r: 12 }, { type: 'noyeur', lvl: 27, x: 150, z: 26, n: 5, r: 12 },
  { type: 'noyeur', lvl: 30, x: 132, z: 80, n: 4, r: 11 }, { type: 'gonfle', lvl: 28, x: 168, z: 52, n: 4, r: 11 },
  { type: 'gonfle', lvl: 34, x: 150, z: 96, n: 4, r: 11 }, { type: 'mere', lvl: 38, x: 188, z: 74, n: 1, r: 2 },
  { type: 'pendu', lvl: 43, x: -132, z: -24, n: 5, r: 12 }, { type: 'pendu', lvl: 48, x: -160, z: -8, n: 5, r: 12 },
  { type: 'pendu', lvl: 52, x: -178, z: -42, n: 4, r: 11 }, { type: 'hurleur', lvl: 47, x: -146, z: -56, n: 3, r: 12 },
  { type: 'hurleur', lvl: 54, x: -186, z: -20, n: 3, r: 12 }, { type: 'pendeur', lvl: 58, x: -202, z: -62, n: 1, r: 2 },
  { type: 'ossature', lvl: 62, x: 36, z: -148, n: 5, r: 12 }, { type: 'ossature', lvl: 66, x: 78, z: -158, n: 5, r: 12 },
  { type: 'colosse', lvl: 65, x: 52, z: -182, n: 3, r: 11 }, { type: 'colosse', lvl: 69, x: 88, z: -190, n: 3, r: 11 },
  { type: 'roi', lvl: 70, x: 62, z: -208, n: 1, r: 2 },
  { type: 'rodeuse', lvl: 6, x: -40, z: 100, n: 4, r: 11 }, { type: 'brule', lvl: 10, x: 30, z: 160, n: 4, r: 11 },
  { type: 'rodeuse', lvl: 15, x: 55, z: 135, n: 4, r: 11 },
  { type: 'sangsue', lvl: 22, x: 120, z: 70, n: 5, r: 11 }, { type: 'porteur', lvl: 31, x: 160, z: 20, n: 3, r: 10 },
  { type: 'sangsue', lvl: 35, x: 175, z: 95, n: 4, r: 11 },
  { type: 'echassier', lvl: 45, x: -120, z: -10, n: 4, r: 11 }, { type: 'veuve', lvl: 50, x: -170, z: -55, n: 4, r: 11 },
  { type: 'echassier', lvl: 55, x: -195, z: -30, n: 4, r: 11 },
  { type: 'moine', lvl: 63, x: 20, z: -165, n: 3, r: 10 }, { type: 'choeur', lvl: 67, x: 95, z: -140, n: 3, r: 10 },
  { type: 'moine', lvl: 69, x: 45, z: -195, n: 3, r: 10 },
]

export function eHp(l, boss) { return Math.round((60 + l * 26) * (boss ? 6 : 1)) }
export function eDmg(l, boss) { return Math.round((8 + l * 2.6) * (boss ? 1.8 : 1)) }

const OWN_RANGE = 95
const OWN_DROP = 110
const VIEW_RANGE = 120
const LEASH = 60
const RESPAWN = 16
const RESPAWN_BOSS = 60
const MAX_HIT = 5000

export function createMobs() {
  const enemies = []
  const packs = SPAWN_DATA.map((sd, pi) => {
    for (let i = 0; i < sd.n; i++) {
      const boss = BOSSES.has(sd.type)
      const hx = sd.x + (Math.random() * 2 - 1) * sd.r
      const hz = sd.z + (Math.random() * 2 - 1) * sd.r
      enemies.push({
        id: 'e' + enemies.length, pack: pi, type: sd.type, lvl: sd.lvl, boss,
        hx, hz, x: hx, z: hz, f: 0, st: 'idle',
        maxHp: eHp(sd.lvl, boss), hp: eHp(sd.lvl, boss),
        alive: true, respawnT: 0, damagers: new Set(),
      })
    }
    return { idx: pi, x: sd.x, z: sd.z, owner: null }
  })
  const byId = new Map(enemies.map(e => [e.id, e]))

  function resetEnemy(e) {
    e.x = e.hx; e.z = e.hz; e.f = 0; e.st = 'idle'
    e.hp = e.maxHp; e.damagers = new Set()
  }

  return {
    enemies,
    packs,
    get(id) { return byId.get(id) },
    ownerOf(id) {
      const e = byId.get(id)
      return e ? packs[e.pack].owner : null
    },

    // players: [{charId, x, z}] — renvoie la liste des charId dont la
    // possession a changé (il faut leur renvoyer eown)
    assignOwners(players) {
      const changed = new Set()
      for (const p of packs) {
        const cur = p.owner ? players.find(pl => pl.charId === p.owner) : null
        if (cur && Math.hypot(cur.x - p.x, cur.z - p.z) <= OWN_DROP) continue
        let best = null, bd = OWN_RANGE
        for (const pl of players) {
          const d = Math.hypot(pl.x - p.x, pl.z - p.z)
          if (d < bd) { bd = d; best = pl.charId }
        }
        if (best !== p.owner) {
          if (p.owner) changed.add(p.owner)
          if (best) changed.add(best)
          p.owner = best
          if (!best) for (const e of enemies) if (e.pack === p.idx && e.alive) resetEnemy(e)
        }
      }
      return [...changed]
    },

    ownedBy(charId) {
      const ids = []
      for (const e of enemies) if (e.alive && packs[e.pack].owner === charId) ids.push(e.id)
      return ids
    },

    // tous les mobs vivants en portée, y compris ceux possédés par le
    // destinataire (il ignore l'écho de position mais en a besoin pour spawn)
    visibleFor(charId, x, z) {
      const out = []
      for (const e of enemies) {
        if (!e.alive) continue
        if (Math.hypot(e.x - x, e.z - z) > VIEW_RANGE) continue
        out.push({
          id: e.id, type: e.type, lvl: e.lvl, x: e.x, z: e.z, f: e.f,
          st: e.st, hp: e.hp, mhp: e.maxHp, hx: e.hx, hz: e.hz,
        })
      }
      return out
    },

    applyPackUpdate(charId, ents) {
      if (!Array.isArray(ents)) return
      for (const u of ents) {
        const e = byId.get(u?.id)
        if (!e || !e.alive || packs[e.pack].owner !== charId) continue
        if (typeof u.x === 'number' && isFinite(u.x)) e.x = Math.max(e.hx - LEASH, Math.min(e.hx + LEASH, u.x))
        if (typeof u.z === 'number' && isFinite(u.z)) e.z = Math.max(e.hz - LEASH, Math.min(e.hz + LEASH, u.z))
        if (typeof u.f === 'number' && isFinite(u.f)) e.f = u.f
        if (typeof u.st === 'string' && u.st.length <= 10) e.st = u.st
        if (typeof u.hp === 'number' && isFinite(u.hp)) e.hp = Math.max(0, Math.min(e.maxHp, Math.round(u.hp)))
      }
    },

    registerHit(charId, id, dmg) {
      const e = byId.get(id)
      if (!e || !e.alive) return null
      e.damagers.add(charId)
      return Math.max(1, Math.min(MAX_HIT, Math.round(dmg) || 1))
    },

    kill(reporterCharId, id) {
      const e = byId.get(id)
      if (!e || !e.alive || packs[e.pack].owner !== reporterCharId) return null
      e.alive = false
      e.hp = 0
      e.respawnT = e.boss ? RESPAWN_BOSS : RESPAWN
      e.damagers.add(reporterCharId)
      const parts = [...e.damagers]
      e.damagers = new Set()
      return parts
    },

    tickRespawn(dt) {
      const respawned = []
      for (const e of enemies) {
        if (e.alive || e.respawnT <= 0) continue
        e.respawnT -= dt
        if (e.respawnT <= 0) {
          e.alive = true
          resetEnemy(e)
          respawned.push(e.id)
        }
      }
      return respawned
    },
  }
}
