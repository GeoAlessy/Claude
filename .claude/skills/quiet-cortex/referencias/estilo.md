# Estilo aprobado por el usuario (no cambiar sin preguntar)

## Marca
- **Paleta** (`src/mente/estilo.ts`): noche `#05070F`, noche media `#0B1024`, luz `#F4EFE6`, **oro `#E9C27B`** (recuerdos, acento principal), **luna `#A9C4FF`** (segundo acento: lo inquietante). El rojo `#E5484D` existe pero **no se usa en textos**.
- **Fuentes** (`public/mente/fonts/`): Cormorant Garamond 500/500i/700/700i (titulares), Inter 400/600 (textos), JetBrains Mono 500 (rótulos en mayúsculas).
- **Logo:** media luna **fotográfica** (foto de la NASA, dominio público, `public/mente/marca/luna_nasa.png` con fondo transparente) + una estrella dorada con destellos de 4 puntas + "QUIET CORTEX" + lema entre dos líneas finas doradas. Código: `src/mente/marca/LogoLuna.tsx`.
  - Foto de perfil 800×800 con el nombre dentro del círculo: `canal-mente/marca/quiet_cortex_avatar_800.png`.
  - Banner 2560×1440 (todo dentro de la zona segura de 1546×423): `canal-mente/marca/quiet_cortex_banner_2560x1440.png`.
  - **Entrada del logo en los vídeos** (`LogoEntrada`, ~2,4 s): la luna sale de la sombra, la estrella destella, "QUIET CORTEX" se escribe y el lema se teclea. **Fondo NEGRO propio, sin estrellas** (`FondoLogo`), para que no se confunda con el fondo del vídeo. Solo 3 elementos: luna, nombre y lema. Versión 4K: `canal-mente/marca/quiet_cortex_entrada_4k.mp4`.
- Fondo de los gráficos del vídeo: cielo azul noche con estrellas (`piezas/Fondo.tsx`). El cerebro se representa como un cosmos (neuronas = galaxias, recuerdos = estrellas).

## Material visual (porcentajes por tramo, aprobados)
| Tramo | Película antigua | Stock | Gráficos | Otros |
|---|---|---|---|---|
| Gancho | 40 % | 20 % | 40 % | — |
| Cap. 1 | 30 % | 25 % | 30 % | 15 % testimonios |
| Cap. 2 | 30 % | 40 % | 30 % | — |
| Cap. 6 | 35 % | 20 % | resto gráficos + testimonios | |
| Resto | ver `canal-mente/material-video-01.md` | | | |
- **Solo HD:** masters de Prelinger/archive.org en 2K–5K, Safety Last! 1080p, stock 1080p o 4K. Nunca 640×480 estirado.
- Película antigua: filtro `PeliculaAntigua` suave (grano, viñeta, Ken Burns lento) y un rótulo discreto tipo "HOME MOVIE · 1950". Stock: modo `stock` (contraste suave, desaturado, empuje lento).
- **El código nunca dibuja personas.** Las personas salen de película o stock reales.
- Testimonios: posts públicos **parafraseados**, sin usuario, sin logos ni capturas (`TarjetaTestimonio`).
- Cada fuente se anota con su licencia en `canal-mente/fuentes-material-v01.md`.

## Texto en pantalla (tipografía cinética, `piezas/TextoAnimado.tsx`)
- **Nada aparece de golpe.** `Escribe` revela cada palabra **sílaba a sílaba** (desenfoque → nítido, subiendo un poco). Con `tiemposFrase(id, texto)`, cada palabra aparece justo cuando el narrador la dice.
- **Marcado:** `*palabra*` = acento **dorado**; `!palabra!` = acento **azul luna**. Los acentos van en negrita con un pequeño destello. **Sin rojo y sin subrayado** (el usuario los rechazó).
- **Contorno oscuro fino + sombra suave** en todos los textos, para que se lean sobre cualquier imagen.
- Rótulos en mayúsculas (mono): `Teclea` letra a letra con un cursor dorado que se apaga.
- **Frases clave:** las frases más épicas o importantes del narrador se escriben en pantalla (`FraseClave`, sobre la imagen con un velo oscuro suave). Ejemplo: "That summer felt *endless.*" / "Last year… !barely! happened."

## Estructura visual del vídeo
- **Título** ("YOUR BRAIN IS LYING / TO YOU ABOUT *TIME*"): solo se queda ~0,4 s tras la voz → **entrada del logo** (fondo negro) → capítulo 1. Silencio total tras el gancho: 2,8 s.
- **Rótulo de capítulo = estilo A, "cine"** (`piezas/RotuloCapituloCine.tsx`): 3–4 destellos muy rápidos de planos del capítulo con flash blanco y un "tic" → un **número gigante** que cae desde el desenfoque con **vídeo dentro de las cifras** (borde dorado fino + brillo que lo barre, cifras de estilo *lining* con `lnum`) → "CHAPTER 01" tecleado + nombre escrito. En cada capítulo cambian los destellos, el vídeo de dentro y el ritmo (`tono: 'rapido' | 'lento'`) para que no parezca plantilla.
- **Pruebas interactivas = diseño 1+3** (`piezas/PruebaContar.tsx`): gráfico a la izquierda (cronómetro con 30 marcas, consigna, pulso de 1 s); a la derecha una **ventana con una persona real haciendo la prueba** (stock HD, "TRY IT WITH ME") y debajo **tarjetas de resultados** ilustrativas; al final, el botón dorado "Comment your result ↓". Cada prueba cambia la persona y el tipo de resultados.
- Cortes **4 fotogramas antes de la palabra** (`A(P(id, palabra))`), fundidos cortos de 4 fotogramas.

## Audio
- **Voz:** Fish Audio, voz **"Psychological"** (id `c8c398f58ea74012969c3d9e51dd086c`, ~29 mil usos: poco usada, no suena a IA genérica), modelo gratis `s2.1-pro-free`, tempo 0,97, cada línea a -16 LUFS. El usuario la aprobó tras una prueba de pronunciación (0 tartamudeos; claridad 96,7 %, comparable a ElevenLabs).
- **Efectos:** archivos normalizados a **-18 LUFS**; mientras habla el narrador bajan 6 dB (`volSfx` en `v01/montaje.ts`). El usuario pidió **subirlos** (casi no se oían) pero **nunca por encima de la voz**.
- **Música:** con "ducking" (baja cuando habla, sube en las pausas: `volMusica`). Ahora suena *Is That You or Are You You?* (Chris Zabriskie, CC BY) **de forma provisional**: el usuario aún no eligió la definitiva (opciones p1–p7 psicológicas, m1–m7 de Mixkit).
- **Máster final:** `loudnorm=I=-13:TP=-1:LRA=11`, AAC 192k. YouTube baja los vídeos fuertes a ~-14 pero nunca sube los flojos.
- Créditos obligatorios en la descripción (CC BY): ver `canal-mente/fuentes-material-v01.md`.
