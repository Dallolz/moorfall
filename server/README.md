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
`state` (position/anim, ~10 Hz, `tp:1` après un respawn), `save` (blob personnage),
`chat`, `epack` (stream des mobs possédés), `ehit` (coup porté), `eatkp` (mob
possédé frappe un joueur distant), `edie` (mort constatée par l'owner).
Serveur → client : `authok`, `created`, `enterok`, `join`, `leave`, `snap` (10 Hz),
`eworld` (état initial des mobs + liste possédée), `esnap` (10 Hz), `eown`
(changement de possession), `ehitf` (coup relayé vers l'owner), `ehitp` (dégâts
subis), `edie` (mort + participants), `chat`, `err`.

## Frontière de confiance (v2, modèle « owner-client »)

Le serveur possède : comptes, personnages, présence, registre des mobs
(`src/mobs.js` : spawns, respawns 16 s/60 s boss, reset des packs abandonnés),
crédit de kill, bornes de vitesse (25 u/s) et de dégâts, laisse des mobs (±60 u).
L'IA des mobs est simulée par un client « owner » par pack (le joueur le plus
proche, hystérésis 95/110) et relayée aux autres — un owner malveillant peut donc
tricher sur SES packs. Limites assumées : projectiles et attaques spéciales ne
touchent que l'owner ; grab impossible sur un mob non possédé ; loot/XP instanciés
par participant. La simulation 100 % serveur (modèle World of ClaudeCraft) reste la
cible long terme.

## Déploiement (production : Fly.io, région CDG Paris)

L'app `moorfall` tourne sur Fly.io (~2 €/mois : machine shared-cpu 256 Mo
always-on + volume 1 Go pour la base SQLite, snapshots quotidiens automatiques).
`Dockerfile` et `fly.toml` sont à la racine du repo.

```bash
flyctl deploy --remote-only     # depuis la racine — build distant, pas besoin de Docker local
flyctl logs -a moorfall         # logs
flyctl ssh console -a moorfall  # shell dans la machine (la base est dans /data)
curl https://moorfall.fly.dev/health
```

Le serveur sert aussi le client : https://moorfall.fly.dev/ est jouable
directement. Le client GitHub Pages vise `wss://moorfall.fly.dev/ws` via
`MP_SERVER_OVERRIDE` dans `index.html` (utilisé seulement sur github.io/file:// ;
en local ou sur Fly, même origine).
