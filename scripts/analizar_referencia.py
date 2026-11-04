"""Mide el ritmo y la voz de un Short de referencia.

Uso: python3 scripts/analizar_referencia.py VIDEO.mp4

Saca:
- Cortes de plano por segundo y duración media de cada plano (ffmpeg scdet).
- Volumen integrado (LUFS), pico y rango (ebur128).
- Transcripción con tiempos por palabra (ElevenLabs Speech-to-Text, vía proxy):
  palabras por minuto, pausas entre palabras y cuántas pausas pasan de 0,25 s.
- Tono de la voz (frecuencia fundamental media y su variación) por autocorrelación.
"""
import json
import re
import subprocess
import sys
import urllib.request
import uuid

import numpy as np

video = sys.argv[1]


def ff(args):
    return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *args], capture_output=True, text=True).stderr


dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout)

# --- cortes de plano ---
r = ff(['-i', video, '-vf', 'scdet=threshold=10', '-an', '-f', 'null', '-'])
cortes = [float(x) for x in re.findall(r'lavfi\.scd\.time: ([0-9.]+)', r)]
planos = np.diff([0, *cortes, dur])

# --- volumen ---
r = ff(['-i', video, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
lufs = re.findall(r'I:\s+(-?[0-9.]+) LUFS', r)[-1]
lra = re.findall(r'LRA:\s+([0-9.]+) LU', r)[-1]
pico = re.findall(r'Peak:\s+(-?[0-9.]+) dBFS', r)[-1]

# --- audio mono 16 kHz ---
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

# --- tono (autocorrelación por ventanas con voz) ---
f0 = []
W = 1024
for i in range(0, len(x) - W, W // 2):
    v = x[i:i + W] - x[i:i + W].mean()
    if np.sqrt((v ** 2).mean()) < 0.02:
        continue
    ac = np.correlate(v, v, 'full')[W - 1:]
    lo, hi = 16000 // 400, 16000 // 70
    k = lo + np.argmax(ac[lo:hi])
    if ac[k] > 0.35 * ac[0]:
        f0.append(16000 / k)
f0 = np.array(f0)

# --- transcripción con tiempos (ElevenLabs STT) ---
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], capture_output=True).stdout
b = uuid.uuid4().hex
cuerpo = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'
          f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + wav + f'\r\n--{b}--\r\n'.encode()
req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=cuerpo,
                             headers={'Content-Type': f'multipart/form-data; boundary={b}', 'xi-api-key': 'dummy'})
stt = json.load(urllib.request.urlopen(req, timeout=300))
pal = [w for w in stt.get('words', []) if w.get('type') == 'word']
habla = pal[-1]['end'] - pal[0]['start'] if pal else 0
pausas = np.array([pal[i + 1]['start'] - pal[i]['end'] for i in range(len(pal) - 1)]) if len(pal) > 1 else np.array([0])

print(json.dumps({
    'duracion_s': round(dur, 2),
    'cortes': len(cortes),
    'cortes_por_segundo': round(len(cortes) / dur, 2),
    'plano_medio_s': round(float(planos.mean()), 2),
    'plano_mediana_s': round(float(np.median(planos)), 2),
    'volumen_LUFS': float(lufs),
    'rango_LRA': float(lra),
    'pico_dBFS': float(pico),
    'palabras': len(pal),
    'palabras_por_minuto': round(len(pal) / habla * 60, 1) if habla else None,
    'pausa_media_s': round(float(pausas.mean()), 3),
    'pausas_mayores_025s': int((pausas > 0.25).sum()),
    'tono_medio_Hz': round(float(np.median(f0)), 1) if len(f0) else None,
    'variacion_tono_Hz': round(float(f0.std()), 1) if len(f0) else None,
    'idioma': stt.get('language_code'),
    'texto': stt.get('text'),
}, ensure_ascii=False, indent=1))
