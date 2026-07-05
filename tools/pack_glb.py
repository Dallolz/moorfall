#!/usr/bin/env python3
"""Emballe un .gltf (+ .bin + PNG externes) en .glb autonome, optimisé pour le web.

- Supprime les normal maps et textures ORM/metallicRoughness (style low-poly stylisé).
- Réduit les textures restantes (sips, macOS) à --max-tex px (défaut 1024).
- --no-textures : supprime toutes les textures (matériaux teintés au runtime).

Usage : python3 tools/pack_glb.py in.gltf out.glb [--max-tex 1024] [--no-textures]
"""
import json, struct, subprocess, sys, tempfile
from pathlib import Path


def resize_png(src, max_dim):
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as t:
        tmp = t.name
    subprocess.run(['sips', '-Z', str(max_dim), str(src), '--out', tmp],
                   check=True, capture_output=True)
    return Path(tmp).read_bytes()


def pad(data, align, fill):
    rem = len(data) % align
    return data + fill * (align - rem) if rem else data


def pack(src, dst, max_tex=1024, no_textures=False):
    src = Path(src)
    g = json.loads(src.read_text())
    base = src.parent

    for m in g.get('materials', []):
        m.pop('normalTexture', None)
        m.pop('occlusionTexture', None)
        pbr = m.get('pbrMetallicRoughness', {})
        if pbr.pop('metallicRoughnessTexture', None) is not None:
            pbr.setdefault('metallicFactor', 0)
            pbr.setdefault('roughnessFactor', 0.9)
        if no_textures and pbr.pop('baseColorTexture', None) is not None:
            pbr.setdefault('baseColorFactor', [1, 1, 1, 1])

    used_tex = sorted({ref['index'] for m in g.get('materials', [])
                       for ref in [m.get('emissiveTexture'),
                                   m.get('pbrMetallicRoughness', {}).get('baseColorTexture')]
                       if ref})
    tex_map = {old: new for new, old in enumerate(used_tex)}
    old_textures = g.get('textures', [])
    g['textures'] = [old_textures[i] for i in used_tex]
    for m in g.get('materials', []):
        for ref in (m.get('emissiveTexture'),
                    m.get('pbrMetallicRoughness', {}).get('baseColorTexture')):
            if ref:
                ref['index'] = tex_map[ref['index']]

    used_img = sorted({t['source'] for t in g['textures'] if 'source' in t})
    img_map = {old: new for new, old in enumerate(used_img)}
    old_images = g.get('images', [])
    for t in g['textures']:
        if 'source' in t:
            t['source'] = img_map[t['source']]

    assert len(g['buffers']) == 1, 'un seul buffer attendu'
    bin_data = bytearray((base / g['buffers'][0]['uri']).read_bytes())

    g['images'] = []
    for i in used_img:
        img = old_images[i]
        data = resize_png(base / img['uri'], max_tex)
        bin_data = bytearray(pad(bytes(bin_data), 4, b'\0'))
        g['bufferViews'].append({'buffer': 0, 'byteOffset': len(bin_data),
                                 'byteLength': len(data)})
        bin_data += data
        g['images'].append({'name': Path(img['uri']).stem, 'mimeType': 'image/png',
                            'bufferView': len(g['bufferViews']) - 1})
    if not g['textures']:
        g.pop('textures', None), g.pop('images', None), g.pop('samplers', None)

    g['buffers'] = [{'byteLength': len(bin_data)}]
    json_chunk = pad(json.dumps(g, separators=(',', ':')).encode(), 4, b' ')
    bin_chunk = pad(bytes(bin_data), 4, b'\0')
    total = 12 + 8 + len(json_chunk) + 8 + len(bin_chunk)
    with open(dst, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total))
        f.write(struct.pack('<II', len(json_chunk), 0x4E4F534A) + json_chunk)
        f.write(struct.pack('<II', len(bin_chunk), 0x004E4942) + bin_chunk)
    print(f'{dst}: {total / 1e6:.2f} Mo')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opts = [a for a in sys.argv[1:] if a.startswith('--')]
    max_tex = next((int(o.split('=')[1]) for o in opts if o.startswith('--max-tex=')), 1024)
    pack(args[0], args[1], max_tex, '--no-textures' in opts)
