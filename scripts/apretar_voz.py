"""Acorta los silencios internos de cada línea de voz (ritmo rápido) y corrige sus tiempos.

Uso: python3 scripts/apretar_voz.py CARPETA_VOZ [--deja 0.14] [--umbral 0.22]

Para cada <id>.mp3 + <id>.json (alignment de ElevenLabs):
- detecta silencios más largos que --umbral (ffmpeg silencedetect, -38 dB),
- deja solo --deja segundos de cada uno,
- reescribe <id>.mp3 (los originales quedan en CARPETA_VOZ/originales/) y remapea los tiempos del .json.
Después hay que volver a correr scripts/subtitulos_voz.py.
"""
import argparse
import json
import os
import re
import shutil
import subprocess

ap = argparse.ArgumentParser()
ap.add_argument('carpeta')
ap.add_argument('--deja', type=float, default=0.14)
ap.add_argument('--umbral', type=float, default=0.22)
ap.add_argument('--tempo', type=float, default=1.0, help='acelera sin cambiar el tono (atempo)')
args = ap.parse_args()


def silencios(ruta):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', ruta, '-af', f'silencedetect=n=-38dB:d={args.umbral}', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    ini = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', r)]
    fin = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', r)]
    return list(zip(ini, fin))  # un silencio final sin "end" se ignora


for f in sorted(os.listdir(args.carpeta)):
    if not f.endswith('.mp3'):
        continue
    nombre = f[:-4]
    mp3 = os.path.join(args.carpeta, f)
    dir_orig = os.path.join(args.carpeta, 'originales')
    os.makedirs(dir_orig, exist_ok=True)
    orig = os.path.join(dir_orig, f)
    if not os.path.exists(orig):
        shutil.copy(mp3, orig)
    # recortes: de cada silencio [a, b] se quita el tramo central, dejando args.deja
    cortes = []
    for a, b in silencios(orig):
        if a < 0.05:
            continue  # silencio inicial: lo dejamos
        quitar = (b - a) - args.deja
        if quitar > 0.02:
            cortes.append((a + args.deja / 2, b - args.deja / 2))
    # tramos que se conservan
    tramos, t = [], 0.0
    for a, b in cortes:
        tramos.append((t, a))
        t = b
    tramos.append((t, None))
    partes = ''.join(f"[0:a]atrim=start={a}{'' if b is None else f':end={b}'},asetpts=PTS-STARTPTS[p{i}];" for i, (a, b) in enumerate(tramos))
    filtro = partes + ''.join(f'[p{i}]' for i in range(len(tramos))) + f'concat=n={len(tramos)}:v=0:a=1[o]'
    if args.tempo != 1.0:
        filtro = filtro.replace('[o]', '[c]') + f';[c]atempo={args.tempo}[o]'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', orig, '-filter_complex', filtro, '-map', '[o]',
                    '-c:a', 'libmp3lame', '-b:a', '192k', mp3], check=True)

    def remap(x):
        quitado = 0.0
        for a, b in cortes:
            if x >= b:
                quitado += b - a
            elif x > a:
                quitado += x - a
        return (x - quitado) / args.tempo

    jr = os.path.join(args.carpeta, nombre + '.json')
    jo = os.path.join(dir_orig, nombre + '.json')
    if not os.path.exists(jo):
        shutil.copy(jr, jo)
    al = json.load(open(jo))
    al['character_start_times_seconds'] = [round(remap(x), 3) for x in al['character_start_times_seconds']]
    al['character_end_times_seconds'] = [round(remap(x), 3) for x in al['character_end_times_seconds']]
    json.dump(al, open(jr, 'w'))
    print(nombre, f'{len(cortes)} silencios acortados, -{sum(b - a for a, b in cortes):.2f}s')
