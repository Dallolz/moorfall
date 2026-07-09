#!/usr/bin/env node
/* Emballe un modèle animé (glTF/GLB à rig propre) en GLB web compact.
   - Filtre les clips d'animation (--keep 'regex') : les accessors orphelins
     sont purgés par prune(), ce qui rétrécit vraiment le buffer.
   - Fusionne les données dupliquées (dedup).
   - Écrit une entrée de manifeste (clips + hauteur) sur stdout en JSON.

   Usage : node tools/pack_mob.mjs in.gltf out.glb [--keep 'Idle|Walk|...'] */
import { NodeIO } from '@gltf-transform/core';
import { getBounds } from '@gltf-transform/core';
import { prune, dedup } from '@gltf-transform/functions';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const keepArg = process.argv.find(a => a.startsWith('--keep='));
const keep = keepArg ? new RegExp('^(' + keepArg.slice(7) + ')$') : null;
const [src, dst] = args;

const io = new NodeIO();
const doc = await io.read(src);
const root = doc.getRoot();

const dropped = [];
for (const anim of root.listAnimations()) {
  if (keep && !keep.test(anim.getName())) {
    dropped.push(anim.getName());
    for (const ch of anim.listChannels()) ch.dispose();
    for (const s of anim.listSamplers()) s.dispose();
    anim.dispose();
  }
}
await doc.transform(dedup(), prune());

const scene = root.getDefaultScene() || root.listScenes()[0];
const b = getBounds(scene);
const clips = {};
for (const anim of root.listAnimations()) {
  let dur = 0;
  for (const s of anim.listSamplers()) {
    const inp = s.getInput();
    if (inp) dur = Math.max(dur, inp.getMax([0])[0]);
  }
  clips[anim.getName()] = Math.round(dur * 100) / 100;
}
await io.write(dst, doc);

const { statSync } = await import('node:fs');
console.log(JSON.stringify({
  file: dst.split('/').pop(),
  bytes: statSync(dst).size,
  height: Math.round((b.max[1] - b.min[1]) * 100) / 100,
  clips,
  droppedClips: dropped.length,
}));
