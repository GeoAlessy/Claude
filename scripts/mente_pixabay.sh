#!/usr/bin/env bash
# Busca vídeos en Pixabay (licencia Pixabay: uso comercial, sin atribución) y descarta los generados con IA.
# Uso: PIXABAY_KEY_FILE=/ruta/privada/.pixabay_key bash scripts/mente_pixabay.sh "analog clock" [n]
# La clave NUNCA va en el repositorio: se lee de un archivo privado fuera del proyecto.
set -euo pipefail
K=$(cat "${PIXABAY_KEY_FILE:?Indica PIXABAY_KEY_FILE}")
Q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))" "$1")
curl -sS "https://pixabay.com/api/videos/?key=$K&q=$Q&per_page=${2:-20}&safesearch=true" | python3 -I -c "
import json,sys
for h in json.load(sys.stdin)['hits']:
    if 'ai generated' in h['tags'] or 'ai-generated' in h['tags']: continue
    m=max(h['videos'].values(),key=lambda x:x.get('width',0))
    if min(m['width'],m['height'])<1080: continue
    print(h['id'],f\"{h['duration']}s\",f\"{m['width']}x{m['height']}\",m['url'],'|',h['tags'][:60],sep='  ')"
