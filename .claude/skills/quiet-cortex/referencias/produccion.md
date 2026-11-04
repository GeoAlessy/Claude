# Flujo de producción (técnico)

Proyecto: repositorio `geoalessy/claude`, rama `claude/upbeat-goldberg-v62nak`. Remotion 4 (React/TypeScript), 1920×1080, 30 fps.

## Archivos clave
| Qué | Dónde |
|---|---|
| Guion del vídeo 01 (narración + dirección visual + fuentes) | `canal-mente/guion-01-your-brain-is-lying-about-time.md` |
| Plan de material y porcentajes | `canal-mente/material-video-01.md` |
| Registro de licencias de cada clip, música y efecto | `canal-mente/fuentes-material-v01.md` |
| Líneas de narración (113) | `canal-mente/v01/lineas.json` |
| Voz final (mp3 + tiempos de cada palabra) | `public/mente/v01/voz_psico/` |
| Línea de tiempo generada | `src/mente/v01/narracion.ts` |
| Utilidades de montaje (P, A, tiemposFrase, volSfx, volMusica) | `src/mente/v01/montaje.ts` |
| Primer minuto montado (plantilla del resto) | `src/mente/v01/Minuto01HD.tsx` (composición `MenteV01Minuto1HD`) |
| Piezas (texto, rótulos, pruebas, gráficos, película antigua) | `src/mente/piezas/` |
| Marca (logo, banner, entrada) | `src/mente/marca/LogoLuna.tsx`, `canal-mente/marca/` |
| Estilo (colores, fuentes, easing) | `src/mente/estilo.ts` |

## Pasos para un vídeo
1. **Guion** en `canal-mente/guion-NN-*.md` (bloques NARRACIÓN en inglés + `[VISUAL: …]` en español + fuentes).
2. **Extraer líneas:** `python3 scripts/mente_extraer_narracion.py` → `canal-mente/vNN/lineas.json` (ids `gancho_NN`, `capNN_NN`, `cierre_NN`).
3. **Voz** (Fish Audio gratis + tiempos con faster-whisper en local):
   `FISH_KEY_FILE=/ruta/privada/.fish_key python3 scripts/mente_fish_narrar.py canal-mente/vNN/lineas.json public/mente/vNN/voz_psico [id …]`
   - Añade indicaciones de emoción entre corchetes por frase (la voz no las lee). Tarda ~40 min para 113 líneas.
   - Después, **comprobar contra el guion** (transcripción): solo deben quedar diferencias de cifras ("ten"→"10") o de nombres. Regenera las líneas con fallos reales pasando sus ids.
4. **Línea de tiempo:** `python3 scripts/mente_linea_tiempo.py canal-mente/vNN/lineas.json public/mente/vNN/voz_psico src/mente/vNN/narracion.ts`
   (pausas: 0,6 s entre párrafos, 2,0 s entre capítulos, 2,8 s tras el gancho).
5. **Material:** `bash scripts/mente_clips_v01.sh` (clips), `bash scripts/mente_audio_gratis.sh` (efectos y música; normaliza los efectos a -18 LUFS), `PIXABAY_KEY_FILE=… bash scripts/mente_pixabay.sh "consulta" 30` (buscar stock HD sin IA).
6. **Montaje:** cada plano en `PLANOS` con `desde/hasta` anclados a palabras (`A(P('cap01_02','close'))`). Las frases clave van en `FRASES`, los efectos en `SFX` y la música en `MUSICA`.
7. **Render + máster:**
   `npx remotion render <Composición> out/mente/x.mp4 --concurrency=4`
   `ffmpeg -i out/mente/x.mp4 -c:v copy -af loudnorm=I=-13:TP=-1:LRA=11 -ar 48000 -c:a aac -b:a 192k out/mente/x_master.mp4`
8. Mostrar el resultado al usuario. Hacer commit y push de código y voz (los clips, la música y los renders no se suben: están en `.gitignore`).

## Claves (nunca en el repo ni en el chat)
- **Fish Audio:** archivo privado `.fish_key` (fuera del proyecto) → `FISH_KEY_FILE`. La API tiene crédito 0, así que **solo funciona el modelo gratis** (cabecera `model: s2.1-pro-free`). `prosody.speed` se ignora (la velocidad se cambia con ffmpeg `atempo`).
- **Pixabay:** archivo privado `.pixabay_key` → `PIXABAY_KEY_FILE`. Usar curl (Python recibe un 403 de Cloudflare). No falsear el User-Agent.
- **ElevenLabs:** el usuario pidió **no usarlo más**.
- **Pexels:** no se pudo crear una clave; solo funcionan los enlaces directos de videos.pexels.com.

## Fuentes de material que funcionan
- **Películas de dominio público:** Prelinger / archive.org (pedir los masters HD; ffmpeg puede leer solo un trozo con `-ss` antes de `-i` sobre la URL de redirección). *Safety Last!* (1923) en 1080p, solo la imagen (no la música de Carl Davis).
- **Stock:** Mixkit (solo los ids antiguos tienen `-1080.mp4` público; algunos son verticales 1080×1920, así que hay que recortar a 16:9), Coverr (excluir clips de IA), Pixabay (API) y NASA (images-api, dominio público).
- **Efectos:** Mixkit SFX (`assets.mixkit.co/active_storage/sfx/<id>/<id>.wav`), más el proyector y el goteo de cueva sintetizados por código.
- **Música:** Chris Zabriskie (CC BY, archive.org), Kevin MacLeod (CC BY 4.0, incompetech), Mixkit, Chopin (CC0).

## Problemas ya resueltos (no volver a caer)
- faster-whisper: decodificar el audio con ffmpeg a un array de numpy (la lectura directa falla) y usar `condition_on_previous_text=False, beam_size=5` (sin `initial_prompt`).
- Vídeo dentro de una ventana pequeña: `OffthreadVideo` se pinta a su tamaño real, así que hay que **preparar el clip al tamaño de la ventana** (p. ej. 760×428).
- Vídeo dentro de las cifras: contenedor con `isolation: isolate` + capa `mix-blend-mode: multiply` con texto blanco.
- La luna con `mix-blend-mode: screen` sale con un cuadro negro mientras se anima: se usa un **PNG con fondo transparente**.
- Las cifras de Cormorant son de estilo antiguo ("01" parece "OI"): usar `fontFeatureSettings: '"lnum" 1'`.
- `padStart` no compila con el TS del proyecto: rellenar con ceros a mano.
- Mixkit a veces responde 429: esperar y reintentar (sin cambiar el User-Agent).
- Al trabajar en la nube, archive.org necesita los flags del proxy en ffmpeg (`-http_proxy "$HTTPS_PROXY" -ca_file /root/.ccr/ca-bundle.crt`). En un ordenador local no hacen falta.
