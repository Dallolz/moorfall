import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { WebSocketServer } from 'ws'
import { openDb } from './db.js'
import { createGame } from './game.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const STATIC_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
}

export async function startServer({ port = 8787, dbPath = 'moorfall.db', snapMs = 100, saveMs = 30000 } = {}) {
  const db = openDb(dbPath)
  const game = createGame(db)

  const server = http.createServer(async (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, players: game.playerCount() }))
    }
    const clean = req.url.split('?')[0]
    const path = clean === '/' ? '/index.html' : clean
    const type = STATIC_TYPES[path.slice(path.lastIndexOf('.'))]
    if (type && !path.includes('..') && (path === '/index.html' || path.startsWith('/js/') || path.startsWith('/css/'))) {
      try {
        const body = await readFile(join(ROOT, path.slice(1)))
        res.writeHead(200, { 'content-type': type })
        return res.end(body)
      } catch {
        res.writeHead(404)
        return res.end('introuvable : ' + path)
      }
    }
    res.writeHead(404)
    res.end()
  })

  const wss = new WebSocketServer({ noServer: true })
  server.on('upgrade', (req, socket, head) => {
    if (!req.url.startsWith('/ws')) return socket.destroy()
    wss.handleUpgrade(req, socket, head, ws => game.connect(ws))
  })

  const snapTimer = setInterval(() => game.snapshot(snapMs / 1000), snapMs)
  const saveTimer = setInterval(() => game.saveAll(), saveMs)

  await new Promise(resolve => server.listen(port, resolve))
  const actualPort = server.address().port

  function close() {
    clearInterval(snapTimer)
    clearInterval(saveTimer)
    game.shutdown()
    for (const ws of wss.clients) ws.terminate()
    server.close()
    db.close()
  }

  return { port: actualPort, close }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8787
  const srv = await startServer({ port, dbPath: process.env.DB_PATH || 'moorfall.db' })
  console.log(`Moorfall serveur : http://localhost:${srv.port} (ws /ws)`)
  const stop = () => {
    srv.close()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}
