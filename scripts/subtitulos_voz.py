"""Convierte los tiempos por carácter de ElevenLabs (voz/*.json) en palabras con tiempo.
Uso:  python3 scripts/subtitulos_voz.py public/porquepaso/p01/voz src/porquepaso/p01/subtitulos.ts
"""
import json
import os
import sys

carpeta, salida = sys.argv[1], sys.argv[2]
lineas = {}
for f in sorted(os.listdir(carpeta)):
    if not f.endswith('.json'):
        continue
    a = json.load(open(os.path.join(carpeta, f)))
    palabras, actual, ini = [], '', None
    en_etiqueta = False  # las etiquetas de eleven_v3 ([pause], [urgent]…) no van en subtítulos
    for ch, s, e in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if ch == '[':
            en_etiqueta = True
            continue
        if en_etiqueta:
            if ch == ']':
                en_etiqueta = False
            continue
        if ch.isspace():
            if actual:
                palabras.append([actual, round(ini, 3), round(fin, 3)])
            actual, ini = '', None
            continue
        if ini is None:
            ini = s
        actual += ch
        fin = e
    if actual:
        palabras.append([actual, round(ini, 3), round(fin, 3)])
    lineas[f[:-5]] = palabras

with open(salida, 'w') as o:
    o.write('// Generado por scripts/subtitulos_voz.py — no editar a mano.\n')
    o.write('// [palabra, inicio_s, fin_s] relativo al inicio de cada archivo de voz.\n')
    o.write('export const PALABRAS: Record<string, [string, number, number][]> = ')
    o.write(json.dumps(lineas, ensure_ascii=False, indent=1))
    o.write(';\n')
print('ok', salida, {k: len(v) for k, v in lineas.items()})
