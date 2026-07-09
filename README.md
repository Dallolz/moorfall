# Moorfall

Action-RPG dark fantasy jouable dans le navigateur — Three.js, zéro build.

**Jouer :** servez la racine du repo (`python3 -m http.server`) et ouvrez `index.html`, ou la version hébergée.

**Structure :** `index.html` (coquille HTML/UI) + `css/moorfall.css` + `js/NN-*.js` (scripts classiques chargés dans l'ordre, portée globale partagée — pas de bundler). `js/14-boot.js` exporte `window.MOOR` ; le multijoueur vit dedans. `server/` = serveur Node/ws (sert aussi les fichiers statiques).

- Personnages 3D riggés chargés en runtime (CC0), fallback procédural si le réseau est bloqué (`?norig` pour forcer).
- Assets : [moorfall-assets](https://github.com/Dallolz/moorfall-assets)
