import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts(
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  hash TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS characters(
  id TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  classe TEXT NOT NULL,
  lvl INTEGER NOT NULL DEFAULT 1,
  maj INTEGER NOT NULL,
  state TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chars_account ON characters(account_id);
`

export function openDb(path) {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.exec(SCHEMA)

  return {
    createAccount(name, hash) {
      const info = db
        .prepare('INSERT INTO accounts(name, hash, created) VALUES(?, ?, ?)')
        .run(name, hash, Date.now())
      return { id: info.lastInsertRowid, name, hash }
    },
    findAccount(name) {
      return db.prepare('SELECT id, name, hash FROM accounts WHERE name = ?').get(name)
    },
    createCharacter(accountId, name, classe, blob) {
      const id = randomUUID()
      const lvl = blob.lvl || 1
      db.prepare(
        'INSERT INTO characters(id, account_id, name, classe, lvl, maj, state) VALUES(?, ?, ?, ?, ?, ?, ?)'
      ).run(id, accountId, name, classe, lvl, Date.now(), JSON.stringify(blob))
      return { id, name, classe, lvl, maj: Date.now() }
    },
    listCharacters(accountId) {
      return db
        .prepare('SELECT id, name, classe, lvl, maj FROM characters WHERE account_id = ? ORDER BY maj DESC')
        .all(accountId)
    },
    loadCharacter(accountId, charId) {
      const row = db
        .prepare('SELECT id, name, classe, lvl, state FROM characters WHERE id = ? AND account_id = ?')
        .get(charId, accountId)
      if (!row) return undefined
      return { id: row.id, name: row.name, classe: row.classe, lvl: row.lvl, blob: JSON.parse(row.state) }
    },
    saveCharacter(accountId, charId, blob) {
      db.prepare(
        'UPDATE characters SET state = ?, lvl = ?, maj = ? WHERE id = ? AND account_id = ?'
      ).run(JSON.stringify(blob), blob.lvl || 1, Date.now(), charId, accountId)
    },
    deleteCharacter(accountId, charId) {
      db.prepare('DELETE FROM characters WHERE id = ? AND account_id = ?').run(charId, accountId)
    },
    close() {
      db.close()
    },
  }
}
