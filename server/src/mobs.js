// Registre canonique des monstres. Le serveur n'exécute pas l'IA : chaque pack
// est simulé par un client « owner » (le joueur le plus proche) qui streame son
// état ; le serveur garde l'autorité sur spawns, respawns, crédit de kill et
// bornes de plausibilité. Le peuplement vient du module PARTAGÉ avec le client
// (js/00-spawn-def.js, même graine => mêmes packs des deux côtés).
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { genSpawnData, SPAWN_SEED } = require('../../js/00-spawn-def.js')

export const BOSSES = new Set(['berger', 'mere', 'pendeur', 'roi'])

export const SPAWN_DATA = genSpawnData(SPAWN_SEED)

export function eHp(l, boss) { return Math.round((60 + l * 26) * (boss ? 6 : 1)) }
export function eDmg(l, boss) { return Math.round((8 + l * 2.6) * (boss ? 1.8 : 1)) }

const OWN_RANGE = 130
const OWN_DROP = 150
const VIEW_RANGE = 170
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
