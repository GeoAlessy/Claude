"""Genera la narración con ElevenLabs (voz oficial del canal) + tiempos por carácter.

Uso:
  export ELEVENLABS_API_KEY=...        # nunca en el código ni en el chat
  python3 scripts/narrar.py guiones/pXX_lineas.json public/porquepaso/pXX/voz [solo_id ...]

El JSON de líneas es una lista de pares: [["01_gancho", "texto…"], ["02_…", "…"], …]
Salida: <id>.mp3 + <id>.json (alignment) por línea. Luego:
  python3 scripts/subtitulos_voz.py public/porquepaso/pXX/voz src/porquepaso/pXX/subtitulos.ts
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

RAIZ = os.path.join(os.path.dirname(__file__), '..')
KEY = os.environ.get('ELEVENLABS_API_KEY')
# Sin variable: la clave puede llegar como secreto de red del entorno (el proxy la agrega).

cfg = json.load(open(os.path.join(RAIZ, 'src', 'porquepaso', 'voz.json')))
lineas = json.load(open(sys.argv[1]))
salida = sys.argv[2]
solo = set(sys.argv[3:])
os.makedirs(salida, exist_ok=True)

url = f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voice_id']}/with-timestamps?output_format=mp3_44100_192"
for nombre, texto in lineas:
    if solo and nombre not in solo:
        continue
    cuerpo = json.dumps({'text': texto, 'model_id': cfg['modelo'], 'voice_settings': cfg['ajustes']}).encode()
    for intento in range(5):
        try:
            req = urllib.request.Request(url, data=cuerpo, headers={**({'xi-api-key': KEY} if KEY else {}), 'Content-Type': 'application/json'})
            d = json.load(urllib.request.urlopen(req, timeout=240))
            break
        except urllib.error.HTTPError as e:
            sys.exit(f'{nombre}: HTTP {e.code} {e.read()[:300].decode(errors="ignore")}')
        except Exception as e:  # conexión cortada: reintentar
            print(f'{nombre}: {e}, reintento {intento + 1}')
            time.sleep(2 ** intento)
    else:
        sys.exit(f'{nombre}: sin respuesta')
    open(os.path.join(salida, f'{nombre}.mp3'), 'wb').write(base64.b64decode(d['audio_base64']))
    json.dump(d.get('alignment'), open(os.path.join(salida, f'{nombre}.json'), 'w'))
    print('ok', nombre)
