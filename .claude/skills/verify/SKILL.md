---
name: verify
description: Vérifier Moorfall en conditions réelles — servir index.html, piloter Chrome headless via puppeteer-core, capturer screenshots et console.
---

# Vérifier Moorfall

Le jeu est un seul fichier `index.html` (Three.js r128 inliné, IIFE `window.MOOR`).
Les modèles 3D chargent depuis raw.githubusercontent.com (repo Dallolz/moorfall-assets) —
il faut du réseau ; sans réseau le jeu retombe sur les visuels procéduraux (`?norig` pour forcer).

## Lancer

```bash
python3 -m http.server 8123          # depuis la racine du repo
npm i puppeteer-core                 # dans un dossier de travail (ESM: fichiers .mjs)
```

Chrome headless via puppeteer-core (pas de téléchargement de navigateur) :
`executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`,
`headless:'new'`, `args:['--use-gl=angle']` (WebGL obligatoire).

## Piloter

- Attendre les modèles : `page.waitForFunction(() => window.RIG_DEBUG && RIG_DEBUG.loaded.length >= 6)`.
  `RIG_DEBUG.{loaded,failed,rigs}` est le témoin du pipeline de rigs.
- Accès aux internes du jeu : `MOOR._dbg()` → `{G, player, enemies, npcs, previewSet, majApparence, demarrer, RIG_CLASS, prevMesh}`.
- Démarrer une partie : `MOOR._dbg().G.classe='briseroc'; MOOR._dbg().demarrer(null)`.
- Aperçu de classe (écran titre) : `MOOR._dbg().previewSet('cendremage')`.
- Se déplacer : `page.keyboard.down('w')` ; téléporter : `player.pos.x=…; player.pos.z=…`.
- Combat : `player.targetEnemy = enemies.filter(e=>e.state!=='dead')[0]` → attaque auto.
- Loot visible : poser `G.equip.torse={rar:4,…}` puis `majApparence()` ;
  vérifier `player.mesh.userData.rig.pieces` (visibilité par pièce).
- Zombies (Creux) : pack vers x=-24, z=99.

## Pièges connus

- La scène est très sombre : cropper/zoomer les screenshots (`sips -c … --cropOffset …`).
- L'écran titre fait tourner le preview — deux captures espacées pour juger un angle.
- Console : les warnings AudioContext sont bénins. `THREE.SkinnedMesh with material.skinning
  set to false` = un matériau créé sans `skinning:true` (r128) — c'est un bug à corriger.
- Toute modification de `index.html` : vérifier la syntaxe des blocs `<script>` extraits
  avec `node --check` avant de servir.
