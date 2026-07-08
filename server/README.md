# Serveur Moorfall

Serveur multijoueur : Node + `ws` + SQLite. Il sert aussi `../index.html`, donc en
local un seul process suffit pour jouer en ligne.

```bash
npm install
npm start          # http://localhost:8787 — WebSocket sur /ws
npm test
```

Variables : `PORT` (défaut 8787), `DB_PATH` (défaut `moorfall.db`).

## Protocole (JSON sur WebSocket)

Client → serveur : `register`/`auth` (premier message), `create`, `delete`, `enter`,
`state` (position/anim, ~10 Hz), `save` (blob personnage complet), `chat`.
Serveur → client : `authok`, `created`, `enterok`, `join`, `leave`, `snap` (10 Hz),
`chat`, `err`.

Frontière de confiance v1 : le serveur possède les comptes, les personnages et la
présence en monde ; il relaie les positions/hp envoyées par les clients sans les
simuler. L'autorité serveur sur le déplacement et le combat (modèle World of
ClaudeCraft : le client n'envoie que des intentions) est le prochain jalon.

## Déploiement VPS

1. Node ≥ 18, `npm ci --omit=dev`, puis un service systemd qui lance `npm start`.
2. Reverse proxy TLS (Caddy) : `moorfall.exemple.fr { reverse_proxy localhost:8787 }` —
   Caddy gère le certificat et l'upgrade WebSocket automatiquement.
3. Côté client GitHub Pages : renseigner `MP_SERVER_OVERRIDE` dans `index.html`
   (`wss://moorfall.exemple.fr/ws`). Servi par le serveur lui-même, rien à configurer.
4. Sauvegarde : copier `moorfall.db` (cron `sqlite3 moorfall.db ".backup ..."`).
