---
name: toon-survive
description: Produce el siguiente Short en inglés del canal de análisis de caricaturas (@ToonUnpacked, serie "Could You Survive It?"), que toma una escena de Los Simpsons y analiza si un humano real sobreviviría, con medidor de rosquillas, golpes, caso real y veredicto. Úsala cuando el usuario pida el siguiente video del canal de los Simpsons, elegir capítulo o escena, guion, voz, render en 4K o publicación.
---

# Canal de caricaturas, serie "Could You Survive It?": cómo hacer el siguiente video

**El usuario habla español y no es técnico: responde SIEMPRE en español claro.** Los videos van **en inglés**.
El S01 está aprobado: *"Could a real human survive Homer's fall into Springfield Gorge?"* (S2E08 "Bart the Daredevil"). Su versión final es `out/S01v2q_desfiladero_4k.mp4`. Toma `src/survive/s01/` (composición `S01v2`) como plantilla de código, estilo y ritmo.

## 0. Canal
- Identificador recomendado: **@ToonUnpacked** (alternativa: @TheToonLens). Es versátil a propósito: "Could You Survive It?" es **una serie** dentro del canal, y si no despega en ~60 Shorts se cambia de formato sin cambiar el nombre (siempre análisis de series y caricaturas).
- La voz del canal nuevo **todavía no está decidida**: el usuario la pedirá. Mientras tanto se usa Skylar (ver §4).

## 1. Fórmula (no cambiar)
1. **Cuadro 0:** frase original del personaje (≈1,3 s, p. ej. Homero "Don't you think I know that?") en pantalla completa.
   - Arriba va el **título del episodio en Simpsonfont** amarillo con una pastilla "SEASON X · EPISODE Y", centrado en el hueco entre el video y el borde superior. Solo se ve hasta que entra la narración.
   - Abajo va un **gancho escrito en Simpsonfont** (p. ej. "THIS FALL WON'T KILL YOU. / THE AMBULANCE WILL." con la palabra clave en rojo).
2. **0,6 s de aire** después de la frase original y entra la narración. **Gancho de curiosidad**, sin spoiler: nunca "Spoiler: he didn't".
3. **Ritmo dominó:** cada palabra trae su imagen, la cámara nunca se detiene y no hay pausas (voz ~205 palabras/min).
4. **Medidor "SURVIVAL %" con rosquillas** arriba a la izquierda (escala 0.72). Se pierden rosquillas con cada golpe (con mordisco: "CHOMP!").
5. **Medición física en estilo AR:** una línea punteada blanca que empieza en los pies del personaje y baja **recta y vertical**, con lectura en vivo "N m". Junto a ella va la pastilla de vidrio "📏 100 M / ≈ 30 FLOORS".
6. **Golpes:** se congela el cuadro con el **punto de impacto centrado**, viñeta roja, bonk y el "DAMAGE REPORT", que marca en rojo la parte del cuerpo.
7. **Velocidad:** en verde ▲ cuando acelera y en rojo ▼ cuando frena (mph).
8. **Caso real verificable:** tarjeta dibujada en estilo de la serie (p. ej. el avión DC-9 con Homero cayendo, "VESNA VULOVIC · FLIGHT ATTENDANT", sello SURVIVED).
9. **Veredicto** con chips horizontales (MAYBE / DEAD), sin rotar.
10. **Bucle:** termina con la frase original que va justo antes del cuadro 0, así que el final empalma con el inicio. **El último cuadro no puede tener cortes de escena** (en S01 salía 1 cuadro azul: revisa los últimos 10 cuadros).
11. **En TODAS las tomas debe verse al protagonista** (Homero). Si la acción sale de cuadro, usa `sigue` (paneo con keyframes) o `encaja` (cuadro completo sobre un fondo desenfocado). Si el episodio no muestra un momento, reutiliza metraje parecido del mismo personaje.

## 2. Elegir el capítulo y la escena
- Busca escenas icónicas de Los Simpsons con **un peligro físico medible**: caídas, golpes, choques, electricidad, comida extrema, frío/calor, explosiones, espacio.
- Deben tener **números verificables** (altura, velocidad, temperatura, voltaje) y, mejor aún, un **caso real documentado** para el giro.
- El guion necesita un **giro** que contradiga la intuición (en S01: "los golpes frenan la caída").
- Presenta **3 candidatos**. Para cada uno: capítulo (temporada/episodio y nombre), minuto aproximado, la pregunta, el giro, el caso real y un % de viralidad estimado y honesto. **El usuario elige y luego pasa el capítulo** (lo sube al chat). Guárdalo como `fuentes_video/ep_sXXeYY.mp4` (gitignored).

## 3. Guion
- Escribe `guiones/sNN_<tema>.md` (tabla: línea → imagen) y `guiones/sNN_lineas.json` (pares `[id, texto]`, con ids como `01_hook`, `02_…`).
- Unos **30–40 s** y 8 líneas. Las palabras clave se colorean: la lista `CLAVE` en rojo para el daño y en rosa para el resto.
- Comprueba cada dato con fuentes serias (física: ~44 m/s ≈ 99 mph para 100 m).

## 4. Voz y subtítulos
- `src/survive/voz.json`: Skylar (`MeDfWn0QGAwSljXBLc2G`), eleven_v3, speed 1.2, más `tempo_extra` 1.33.
- `VOZ_CFG=src/survive/voz.json python3 scripts/narrar.py guiones/sNN_lineas.json public/survive/sNN/voz`
- `python3 scripts/apretar_voz.py public/survive/sNN/voz --tempo 1.33`
- `python3 scripts/subtitulos_voz.py public/survive/sNN/voz src/survive/sNN/subtitulos.ts`
- ElevenLabs entra por el proxy (no pidas la clave; si una herramienta exige una, usa una ficticia). **Nunca le pidas al usuario que pegue claves en el chat.**
- El audio original del episodio (las frases de los personajes) se recorta con ffmpeg a WAV en `public/survive/sNN/clips/`.

## 5. Clips en máxima calidad
- La fuente suele ser 480p comprimida. La distorsión viene de los artefactos y de los zooms grandes, no de cuadros mezclados.
- Pasos (ver `fuentes_video/escalar_s01_hd.sh`): ffmpeg `fps=30,deblock=filter=strong:block=8` → `scripts/upscale_esrgan.py fuentes_video/modelos/realesr-animevideov3.pth IN OUT --alto 1920` (x4, sin reducir: 3392×1920) → libx264 crf 12.
  - Luego **re-codifica todo-intra** (`-g 1 -crf 14`) para que extraer cuadros sea rápido.
  - Guárdalo en `public/survive/sNN/clips_hd/` (solo los .mp4).
  - Saca también una versión de 848×480 en `clips_fondo/` para los fondos desenfocados.
- Los **PNG y WAV** (recortes, audio original) quedan en `clips/`. **No los busques en `clips_hd/`**: si falta un asset, el render se queda esperando hasta el timeout.
- Tarda unos 3 s por cuadro en CPU: escala solo los tramos que se usan, en segundo plano.
- Los zooms máximos deben ser suaves (≤1.75 en `encaja`, ≤1.4 a pantalla completa).

## 6. Código (copiar `src/survive/s01/` → `sNN/`)
- `tiempos2.ts`: toda la línea de tiempo sale de la voz (`ORDEN`, `marca(id, palabra)`, `INICIO`, `FIN`, `M.*`).
  - `plano({desde, src, vel, cx, sigue, cy, cy2, fy, zoom:[a,b], congela, encaja, archivo, golpe})`
  - `BRILLOS` usa recortes de Homero (`scripts/recortar_homero.py`) con brillo **horneado** (`scripts/hornear_brillo.py`): nunca uses `filter: drop-shadow` encadenado, porque cuesta ≈3,5 s por cuadro.
  - `DURACION = INI_B + ORIG_B.dur + 1`
- `Survive01v2.tsx`: los componentes Plano, la medición AR, Medida (velocidad), VidasEventos (rosquillas), CasoReal, TituloEpisodio, GanchoTexto, Veredicto, los subtítulos y la mezcla de SFX.
- Fuentes: LuckiestGuy, Bangers, Chewy y **Simpsonfont**.
  - La versión demo de Simpsonfont no trae `'` ni `.`: van en spans con LuckiestGuy.
  - Simpsonfont es **gratis solo para uso personal**; está local y gitignored. Para monetizar hace falta una licencia comercial (dennis@sharkshock.net); la alternativa es Luckiest Guy.
- SFX sintetizados (`scripts/sfx_survive.py` → `public/survive/sfx/`): swish 0.16 entre tomas, bonk 0.7 + impacto 0.35 por golpe, ding, pop, sello, riser 0.2, bip y brillo.
- Registra `SNN` en `src/Root.tsx`.
- **Para mostrar opciones de diseño:** haz hojas de 20 variantes como stills (`src/survive/opcionesN.tsx`) y deja que el usuario elija por número.

## 7. Render (4K)
```
npx remotion render src/index.ts SNN out/SNN_mezcla_4k.mp4 --scale=2 --crf=15 --x264-preset=slow --pixel-format=yuv420p --concurrency=2 --timeout=120000 --log=error
scripts/masterizar.sh out/SNN_mezcla_4k.mp4 out/SNN_<tema>_4k.mp4   # −14 LUFS
```
- Tarda ~1 h: córrelo en **segundo plano**, con `timeout` 7200000 y **un solo render a la vez** (en paralelo se cae por falta de memoria).
- Si va lento, mide 30 cuadros por tramo (`--frames=A-B`) para encontrar el culpable.
- **Antes de entregar:** comprueba que sea 2160×3840 y la duración, revisa cuadros de control (inicio, golpes y **los últimos 10 cuadros**) y envía el video con SendUserFile.

## 8. Preferencias del usuario (aprendidas en S01)
- **Nada de spoilers** en el gancho, y el gancho escrito debe verse desde el cuadro 0.
- Los gráficos deben verse **dibujados por un animador de los Simpsons**: contorno negro grueso, colores planos de la serie, profesionales. Nada blando ni genérico. Odia las alarmas tipo "W8 4 IT".
- Encuadres: Homero siempre visible, el impacto centrado y las escenas completas (`encaja`) cuando hay varios personajes.
- La regla elegida es la línea AR (opción 20) con la pastilla AR (opción 14).
- Quiere la máxima calidad: entrega siempre en **4K**. Explícale que el límite es la fuente original.
- Él sigue el trabajo desde el mismo chat. Hazlo directo, renderiza, revisa y entrega con una explicación corta de qué cambió.
- **Publicación:** título, descripción, etiquetas y comentario fijado en inglés (p. ej. "Would YOU survive fall #1? 👇"). Hay riesgo de Content ID: usa un clip corto con comentario transformador.
- No esquives protecciones anti-bot de YouTube ni de otros sitios.
