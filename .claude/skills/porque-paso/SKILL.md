---
name: porque-paso
description: Produce un nuevo Short del canal "¿Por qué pasó?" (clip viral real de Reddit + explicación en holograma 3D + bucle "Ahora ya sabes por qué"). Úsala cuando el usuario pida el siguiente video, buscar tema, guion, voz, render o publicación del canal.
---

# Canal "¿Por qué pasó?": cómo hacer el siguiente video

**El usuario habla español: responde SIEMPRE en español, claro y sin jerga técnica.**
El Piloto 01 ya está aprobado (`src/porquepaso/p01/`). Úsalo como plantilla de código, estilo y ritmo.

## 1. Fórmula del formato (no cambiar)
1. **Gancho real (0–8 s):** un clip de Reddit en el momento más fuerte. El título-pregunta aparece desde el cuadro 0 y el crédito va arriba.
2. **Congelado + palabra de impacto:** un zoom, un flash y una palabra roja grande (p. ej. "¿SABOTAJE?") con un golpe de sonido.
3. **Escaneo → holograma 3D:** se reconstruye la escena en cian con hilos de luz y se explica el mecanismo paso a paso. Usa etiquetas HUD profesionales (retículas, pastillas de estado), nunca flechas feas.
4. **Cierre circular:** la última frase completa la primera, por ejemplo "…Y ahora ya sabes por qué" + "se detuvo la escalera de Trump…".
   - La tarjeta final pasa los segundos reales que van justo antes del gancho, de modo que el último cuadro sea igual al cuadro 0.
   - **Nunca imagen estática:** siempre hay algo moviéndose (la cámara orbita, pulsos, video real).
5. **Nada desaparece de golpe:** personas, objetos y etiquetas del holograma se quedan hasta el cambio de toma. Si estorban, se vuelven tenues o salen caminando de cuadro; nunca se borran.
6. **Efectos tipo "fiu" (transiciones, risers, escaneos) MUY bajos** (~0.05–0.14). El usuario los quiere casi imperceptibles: no deben distraer del video.
7. **Música de fondo** leve (`fondo_curiosidad.wav`), unos 20 dB bajo la voz.
8. **Ritmo:** 40–50 s, cero silencios (pausas de 3–8 cuadros) y subtítulos palabra por palabra.

## 2. Elegir el tema (REGLAS DEL USUARIO)
- **Actual:** pasó **este mes** (máximo unas 4–6 semanas). Lo del año pasado ya no impacta.
- **Súper viral en Reddit:** un post con **decenas de miles de upvotes** (orientativo: ≥20k; nunca 1k o menos), en el top del mes de subs grandes, y que **la mayoría haya visto y le haya gustado**.
  - Subs: r/interestingasfuck, r/nextfuckinglevel, r/Damnthatsinteresting, r/WTF, r/whatcouldgowrong, r/BeAmazed, r/oddlysatisfying, r/mildlyinteresting, r/Unexpected, r/PublicFreakout, r/LiveNews_24H, r/videos.
- **Los comentarios piden la explicación:** "¿por qué pasa eso?", "¿cómo es posible?", teorías cruzadas. Ese es el disparador del formato.
- **Nicho:** fallas cotidianas y mecanismos de seguridad o física que "todos los humanos" entienden (escaleras, ascensores, puertas, autos, aviones, clima, materiales). Que salga alguien famoso o atractivo suma.
- **Explicación verificable** con fuentes serias (comunicado oficial, NPR, ingenieros). Si no hay explicación confirmada, descarta el tema.
- Evita contenido médico, violencia explícita o tragedias con víctimas (desmonetiza y no encaja en el tono).
- Presenta al usuario **3 candidatos** con: enlace, upvotes, fecha, por qué se pregunta la gente, la explicación en una línea y un "% de viralidad" estimado. **Él elige.**

### Cómo buscar en Reddit
- Ve a `reddit.com/r/<sub>/top/?t=month`.
- La API JSON pública pide login. **No falsifiques User-Agent ni esquives protecciones anti-bot** (eso ya fue bloqueado).
- Opciones:
  - (a) Si existe `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` en el entorno (app `porquepaso_bot`), usa OAuth oficial.
  - (b) Busca en la web (WebSearch) noticias virales del mes que citen el post.
  - (c) Pide al usuario que abra el top del mes y pase los enlaces.
- **Descarga del clip:** el usuario baja el video (p. ej. con rapidsave.com) y lo sube al chat. Guárdalo en `clips/raw/` (gitignored: los clips de terceros no se suben a git).
- Identifica al **autor original** para el crédito. Una app de reposteo no cuenta como autor.

## 3. Guion (reglas que funcionaron)
- La línea 1 es la pregunta y engancha en 2 s. La 2–3 da contexto y una teoría falsa ("sabotaje").
- Luego viene "Pero la verdadera razón…", y cada frase revela algo nuevo, concreto y visual.
- Palabras cortas e imágenes mentales ("un peine metálico", "un clic"). Frases de 6–14 palabras.
- Remate emocional y útil para el espectador ("¡Te está protegiendo!") + "Y ahora ya sabes por qué".
- Datos neutrales, sin opinión política. Guarda el guion en `guiones/pXX_<tema>.md` y el kit de publicación en `guiones/pXX_publicacion.md` (copia la estructura de `piloto01_publicacion.md`).

## 4. Voz (ElevenLabs, aprobada)
- Configuración en `src/porquepaso/voz.json`: voz "PorQuePaso – Narrador oficial v2 (cálido)", latino cálido, `eleven_v3`, stability 0.35, similarity 0.8, style 0.4, speed 1.08. **No cambiarla** sin que el usuario lo pida.
- Las líneas van en `guiones/pXX_lineas.json` como `[["01_...", "texto"], ...]`.
- `python3 scripts/narrar.py guiones/pXX_lineas.json public/porquepaso/pXX/voz`
- La clave sale SOLO de la variable `ELEVENLABS_API_KEY`. Si falta, pide al usuario que la agregue en las variables de entorno del entorno de Claude Code (nunca por el chat).
- `python3 scripts/subtitulos_voz.py public/porquepaso/pXX/voz src/porquepaso/pXX/subtitulos.ts`

## 5. Código (copiar `src/porquepaso/p01/` → `pXX/`)
- `tiempos.ts`: **toda la línea de tiempo sale de los tiempos de la voz** (`ORDEN`, `marca(id, palabra)`, `SEG`, `H`, `INI_HOLO`). Al cambiar una frase, todo se re-sincroniza.
- `Gancho.tsx`: segmentos de video real (`OffthreadVideo` + `trimBefore`), título, crédito, retículas (`../hud.tsx`), pastillas de estado y el congelado con la palabra roja.
- `Holograma.tsx`: escena con `@remotion/three`, material holográfico (`../three/holo.tsx`: relleno aditivo + `EdgesGeometry`), etiquetas proyectadas 3D→2D con `proyectar()`, keyframes de cámara `CAM` y maniquíes de cápsulas.
  - **No uses `filter: drop-shadow` en el canvas** (el render pasa de minutos a horas). El brillo se pone después con ffmpeg.
- `Piloto01.tsx`: arma gancho, holograma, cierre, subtítulos (Inter Display Black 74 px, top 1440, 3 palabras, palabra activa en cian), firma del canal y audio.
  - SFX: `riser`, `impacto`, `escaneo`, `transicion` (0.22, suave; el usuario odió el whoosh fuerte), `clic`, `senal`, `motor_apagado`, `freno`, `confirmacion`.
  - Música `fondo_investigacion` con ducking: 0.07 con voz y 0.18 en pausas.
- Estilo en `../estilo.ts`: cian #22D3EE, rojo #FF3B47, verde #34D399, ámbar #FBBF24 y las fuentes de `public/fonts/porquepaso/`.
- Registra las composiciones en `src/Root.tsx` (`PXX`, `PXXGancho`, `PXXHolograma`).
- Si hacen falta sonidos nuevos, agrégalos en `scripts/sfx_porquepaso.py`. Se sintetizan con numpy, sin licencias.

## 6. Mejorar la calidad del clip (Real-ESRGAN sin PyTorch)
- Pesos `realesr-general-x4v3.pth`, descargables desde GitHub releases de xinntao/Real-ESRGAN, en `/tmp/x4v3.pth`.
- Extrae los PNG con ffmpeg (recorte 9:16 del 720p), luego `python3 scripts/upscale_esrgan.py /tmp/x4v3.pth entrada/ salida/ --alto 1920`, y rearma el video a 1080×1920, 30 fps, en `public/porquepaso/pXX/*.mp4` (gitignored).
- Tarda unos 4–10 s por cuadro en CPU: escala solo los segmentos que se usan.

## 7. Render final
```
npx remotion render PXX clips/pXX/PXX_raw.mp4 --gl=swangle --crf=16 --concurrency=2 --log=error
ffmpeg -i clips/pXX/PXX_raw.mp4 -filter_complex "[0:v]format=gbrp,split[a][b];[b]gblur=sigma=7[g];[a][g]blend=all_mode=screen:all_opacity=0.5:enable='between(t,INICIO_HOLO_s,FIN_HOLO_s)',format=yuv420p[v]" -map "[v]" -map 0:a -c:v libx264 -crf 17 -preset slow -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 clips/pXX/PXX_final.mp4
```
- **Entrega final en 1440×2560 (2K)**: renderiza con `--scale=1.5 --crf=14` (1620×2880; 1.333 falla porque no da un tamaño entero), y en ffmpeg agrega `scale=1440:2560:flags=lanczos,` antes de `format=gbrp`, sigma 9, `-crf 15 -profile:v high -movflags +faststart` y audio a 256k. Subir en 2K hace que YouTube use un códec mejor y se ve más nítido que un 1080 (el usuario lo pidió).
- El brillo **solo en el tramo del holograma**, y siempre con `format=gbrp` antes del blend (en YUV el video sale morado).
- El render tarda unos 10 min: córrelo en segundo plano.
- **Antes de entregar:** saca fotogramas de control (sobre todo inicio, cambios y final) y míralos. Revisa también que no haya imágenes quietas y que los colores estén bien.
- Entrega con SendUserFile y explica en español qué cambió.

## 8. Seguridad y derechos
- Claves solo como variables de entorno (`YOUTUBE_API_KEY`, `ELEVENLABS_API_KEY`, `REDDIT_CLIENT_ID/SECRET`). Nunca en archivos del repo ni en commits. Si el usuario las pega en el chat, recomiéndale regenerarlas.
- Los clips de terceros no van a git. Siempre da crédito al autor original en pantalla y en la descripción ("Usado con fines educativos y de comentario").

## 9. Investigación previa del canal
En `investigacion/` están los estudios de canales virales con pocos videos, los disparadores de viralidad, las analogías de formato y el estudio de Shorts. Consúltalos para el título, la miniatura y el comentario fijado.
