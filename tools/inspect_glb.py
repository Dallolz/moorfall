#!/usr/bin/env python3
"""Inspecte des GLB sans dépendance : clips d'animation, nodes, meshes, bones, hauteur.

Usage : python3 tools/inspect_glb.py <fichier.glb | dossier> [...]
"""
import json, struct, sys
from pathlib import Path


def read_gltf_json(path):
    with open(path, 'rb') as f:
        magic, _version, _length = struct.unpack('<III', f.read(12))
        if magic != 0x46546C67:
            raise ValueError(f'{path}: pas un GLB')
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        if chunk_type != 0x4E4F534A:
            raise ValueError(f'{path}: premier chunk non-JSON')
        return json.loads(f.read(chunk_len))


def clip_duration(gltf, anim):
    dur = 0.0
    for s in anim.get('samplers', []):
        acc = gltf['accessors'][s['input']]
        if acc.get('max'):
            dur = max(dur, acc['max'][0])
    return dur


def inspect(path):
    g = read_gltf_json(path)
    print(f'\n{"=" * 70}\n{path}\n{"=" * 70}')

    anims = g.get('animations', [])
    print(f'\n-- ANIMATIONS ({len(anims)}) --')
    for a in anims:
        print(f'  {a.get("name", "?"):48s} {clip_duration(g, a):6.2f}s')

    meshes = g.get('meshes', [])
    print(f'\n-- MESHES ({len(meshes)}) --')
    for m in meshes:
        prims = m.get('primitives', [])
        tris = sum(g['accessors'][p['indices']]['count'] // 3
                   for p in prims if 'indices' in p)
        print(f'  {m.get("name", "?"):48s} {len(prims)} prim, {tris} tris')

    skins = g.get('skins', [])
    nodes = g.get('nodes', [])
    print(f'\n-- SKINS ({len(skins)}) --')
    for s in skins:
        joints = [nodes[j].get('name', str(j)) for j in s.get('joints', [])]
        print(f'  {s.get("name", "?")}: {len(joints)} bones')
        print(f'    racines: {joints[:6]}')

    mesh_nodes = [n.get('name', '?') for n in nodes if 'mesh' in n]
    print(f'\n-- NODES AVEC MESH ({len(mesh_nodes)}) --')
    for n in mesh_nodes:
        print(f'  {n}')

    ys = [(g['accessors'][p['attributes']['POSITION']]['min'][1],
           g['accessors'][p['attributes']['POSITION']]['max'][1])
          for m in meshes for p in m.get('primitives', [])
          if 'POSITION' in p.get('attributes', {})
          and g['accessors'][p['attributes']['POSITION']].get('min')]
    if ys:
        lo, hi = min(y[0] for y in ys), max(y[1] for y in ys)
        print(f'\n-- HAUTEUR GEOMETRIE -- y ∈ [{lo:.3f}, {hi:.3f}]  (h ≈ {hi - lo:.3f})')

    bone_names = {nodes[j].get('name', '') for s in skins for j in s.get('joints', [])}
    for hint in ('Hand', 'hand'):
        hands = sorted(b for b in bone_names if hint in b)
        if hands:
            print(f'\n-- BONES D\'ATTACHE -- {hands}')
            break


if __name__ == '__main__':
    targets = []
    for arg in sys.argv[1:]:
        p = Path(arg)
        targets += sorted(p.rglob('*.glb')) if p.is_dir() else [p]
    if not targets:
        sys.exit('usage: inspect_glb.py <glb|dossier> [...]')
    for t in targets:
        try:
            inspect(t)
        except Exception as e:
            print(f'\n!! {t}: {e}')
