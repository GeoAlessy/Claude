"""Narración del canal mente con Fish Audio (modelo gratuito s2.1-pro-free) — estilo "v3: emociones dirigidas".

Uso:
  FISH_KEY_FILE=/ruta/privada/.fish_key python3 scripts/mente_fish_narrar.py \
      canal-mente/v01/lineas.json public/mente/v01/voz_fish [solo_id ...]

Por cada línea:
  1. añade indicaciones de emoción entre corchetes, frase a frase (la voz no las lee: comprobado por transcripción);
  2. genera el audio con la voz "Calm storyteller male" de Fish Audio;
  3. baja la velocidad un 8 % sin cambiar el tono (atempo) y normaliza el volumen a -16 LUFS (pico -1,5 dB);
  4. saca el tiempo de cada palabra con faster-whisper en local (gratis) → <id>.json {"palabras": [[w, ini, fin]], "dur": s}.
La clave NUNCA va en el repositorio: se lee de un archivo privado.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

VOZ = 'e686ae649ee44f219a108aacba206c1a'  # "calm storyteller male" (voz genérica, no imita a nadie real)
MODELO = 's2.1-pro-free'
TEMPO = 0.92
LUFS = -16

INQUIETANTE = re.compile(r"\b(unsettling|quietly|barely|worry|strange|stranger|strangest|missing|gone|deleting|delet|never|lie|lying|blank|vanish|disappear|erase|terror|dark|alone|broken)\w*", re.I)
CIENCIA = re.compile(r"\b(19\d\d|20\d\d|researcher|researchers|study|studies|scientist|scientists|psychologist|neuroscientist|experiment|percent|surveyed|discovered)\b", re.I)
PRUEBA = re.compile(r"\b(close your eyes|watch the|glance|try it|look at|keep your eyes|let's try|count to)\b", re.I)
CALIDO = re.compile(r"\b(summer|child|childhood|kid|love|family|home|first|remember|sunset|eight years old)\b", re.I)


def marcar(lid: str, texto: str) -> str:
    """Indicaciones de emoción por frase (estilo de la versión v3 que eligió el usuario)."""
    # se corta solo en . ! ? (los puntos suspensivos "…" quedan dentro de la frase)
    frases = re.findall(r'(?:[^.!?]|\.(?=[^\s"”’)]))+(?:[.!?]+["”’)]*|$)', texto)
    frases = [f.strip() for f in frases if f.strip()]
    tramo = lid.split('_')[0]
    out = []
    for i, f in enumerate(frases):
        palabras = len(f.split())
        if i == 0 and lid.endswith('_01'):
            tag = 'thoughtful, slow'
        elif tramo in ('cierre',) or (tramo == 'cap09' and i == 0):
            tag = 'warm, hopeful'
        elif f.endswith('?'):
            tag = 'curious, building intrigue'
        elif palabras <= 4:
            tag = 'firm, with a dramatic pause before'
        elif PRUEBA.search(f):
            tag = 'gentle, guiding, unhurried'
        elif INQUIETANTE.search(f):
            tag = 'low, almost a whisper'
        elif CIENCIA.search(f):
            tag = 'calm, clear, storytelling'
        elif CALIDO.search(f):
            tag = 'warm, nostalgic'
        else:
            tag = None
        if out and tag and out[-1].startswith(f'[{tag}]'):
            tag = None  # nunca la misma indicación dos frases seguidas
        out.append(f'[{tag}] {f}' if tag else f)
    return ' '.join(out)


def fish(texto: str, clave: str) -> bytes:
    body = {'text': texto, 'reference_id': VOZ, 'format': 'mp3', 'temperature': 0.8, 'top_p': 0.85}
    for intento in range(6):
        req = urllib.request.Request('https://api.fish.audio/v1/tts', data=json.dumps(body).encode(),
                                     headers={'Authorization': f'Bearer {clave}', 'Content-Type': 'application/json', 'model': MODELO})
        try:
            return urllib.request.urlopen(req, timeout=240).read()
        except urllib.error.HTTPError as e:
            msg = e.read()[:200]
            if e.code in (429, 500, 502, 503):
                time.sleep(5 * (intento + 1))
                continue
            sys.exit(f'HTTP {e.code} {msg}')
        except Exception as e:  # conexión cortada
            print('reintento', e)
            time.sleep(3 * (intento + 1))
    sys.exit('Fish Audio no responde')


def main():
    import numpy as np
    from faster_whisper import WhisperModel

    clave = open(os.environ['FISH_KEY_FILE']).read().strip()
    lineas = json.load(open(sys.argv[1]))
    salida = sys.argv[2]
    solo = set(sys.argv[3:])
    os.makedirs(salida, exist_ok=True)
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    ruta_marcas = os.path.join(salida, '_marcas_emocion.json')
    marcas = json.load(open(ruta_marcas)) if os.path.exists(ruta_marcas) else {}
    for lid, texto in lineas:
        if solo and lid not in solo:
            continue
        mp3 = os.path.join(salida, f'{lid}.mp3')
        crudo = mp3 + '.crudo.mp3'
        etiquetado = marcar(lid, texto)
        marcas[lid] = etiquetado
        open(crudo, 'wb').write(fish(etiquetado, clave))
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', crudo, '-af',
                        f'atempo={TEMPO},loudnorm=I={LUFS}:TP=-1.5:LRA=7,aresample=44100',
                        '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '192k', mp3], check=True)
        os.remove(crudo)
        pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
        audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
        segs, _ = asr.transcribe(audio, word_timestamps=True, initial_prompt=texto[:200])
        palabras = [[w.word.strip(), round(float(w.start), 3), round(float(w.end), 3)] for s in segs for w in s.words]
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
        json.dump({'palabras': palabras, 'dur': round(dur, 3)}, open(os.path.join(salida, f'{lid}.json'), 'w'))
        print('ok', lid, f'{dur:.1f}s', len(palabras), 'palabras', flush=True)
        time.sleep(0.5)
        json.dump(marcas, open(ruta_marcas, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
