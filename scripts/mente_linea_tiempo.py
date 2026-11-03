"""Línea de tiempo de la narración del canal mente: coloca cada línea de voz una tras otra.
Uso: python3 scripts/mente_linea_tiempo.py canal-mente/v01/lineas.json public/mente/v01/voz_fish src/mente/v01/narracion.ts
Acepta dos formatos de tiempos: el de ElevenLabs (tiempos por carácter) y el de Fish + faster-whisper ({"palabras", "dur"}).
Huecos: 0,45 s entre párrafos · 1,8 s al cambiar de capítulo (rótulo + whoosh). Nunca más de 3 s sin voz.
Genera, por línea: id, archivo, fotograma de inicio, duración y palabras con tiempo (para subtítulos)."""
import json, os, sys

FPS = 30
HUECO, HUECO_CAP, INICIO = 0.45, 1.8, 0.6
lineas = json.load(open(sys.argv[1]))
carpeta, salida = sys.argv[2], sys.argv[3]
t, tramo_prev, items = INICIO, None, []
for lid, texto in lineas:
    a = json.load(open(os.path.join(carpeta, f'{lid}.json')))
    fish = 'palabras' in a
    dur = a['dur'] if fish else a['character_end_times_seconds'][-1]
    tramo = lid.split('_')[0]
    if tramo_prev is not None:
        t += (2.6 if tramo_prev == 'gancho' else HUECO_CAP) if tramo != tramo_prev else HUECO  # tras el gancho: título + rótulo
    palabras, actual, ini, fin = (a['palabras'] if fish else []), '', None, 0
    for ch, s, e in ([] if fish else zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds'])):
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
    items.append({'id': lid, 'audio': os.path.relpath(os.path.join(carpeta, f'{lid}.mp3'), 'public'), 'tramo': tramo, 'desde': round(t * FPS), 'dur': round(dur * FPS) + 1, 'palabras': palabras})
    t += dur
    tramo_prev = tramo
total = round((t + 2.5) * FPS)
with open(salida, 'w') as o:
    o.write('// Generado por scripts/mente_linea_tiempo.py — no editar a mano.\n')
    o.write('export type LineaVoz = {id: string; audio: string; tramo: string; desde: number; dur: number; palabras: [string, number, number][]};\n')
    o.write(f'export const DURACION_TOTAL = {total};\n')
    o.write('export const NARRACION: LineaVoz[] = ')
    o.write(json.dumps(items, ensure_ascii=False))
    o.write(';\n')
tramos = {}
for it in items:
    tramos.setdefault(it['tramo'], [it['desde'], 0])
    tramos[it['tramo']][1] = it['desde'] + it['dur']
for k, (a, b) in tramos.items():
    print(f'{k:7s} {a/FPS/60:5.2f} → {b/FPS/60:5.2f} min  ({(b-a)/FPS/60:4.2f} min)')
print(f'TOTAL {total/FPS/60:.2f} min')
