---
name: quiet-cortex
description: Produce los vídeos largos del canal de YouTube QUIET CORTEX ("the unsettling science of your mind": neurociencia inquietante de tu propia mente, en inglés, sin rostro, 22–30 min). Úsala cuando el usuario quiera seguir el vídeo 01 ("Your Brain Is Lying To You About Time"), empezar un vídeo nuevo, elegir tema, escribir guion, generar la voz, buscar material, montar en Remotion, hacer rótulos, logo, banner, miniatura, música, efectos o publicar en este canal. NO es para el canal "¿Por qué pasó?" (ese tiene su propia skill).
---

# QUIET CORTEX: cómo seguir el canal

**El usuario habla español: responde SIEMPRE en español, claro, sin jerga técnica.** Los vídeos, la voz y los textos en pantalla van en **inglés** (público de EE. UU., Reino Unido y Canadá).

Antes de trabajar, lee lo que toque:
- `referencias/canal.md` → nicho, promesa, público, temas de los próximos vídeos, estructura de cada vídeo.
- `referencias/estilo.md` → **reglas visuales, de texto y de audio que el usuario ya aprobó** (no las cambies sin preguntar).
- `referencias/produccion.md` → el flujo técnico paso a paso, con comandos, y los problemas ya resueltos.
- `referencias/estado-video-01.md` → en qué punto está el vídeo 01 y qué falta.

## Reglas de oro (resumen)
1. **La voz nunca calla más de 3 s.** El montaje se ancla a las palabras de la narración: si cambia la voz, el vídeo se reajusta solo.
2. **Material:** películas antiguas de dominio público + stock gratis en **HD (1080p o más)**, nunca clips borrosos ni estirados. El resto son motion graphics hechos con código. **Poca IA visual. El código nunca dibuja personas.**
3. **Textos:** ninguno aparece de golpe. Las frases se escriben sílaba a sílaba, al ritmo de la voz. La palabra clave va en **dorado o azul luna, en negrita y con destello**. **Nunca en rojo ni subrayada.** Todos los textos llevan un contorno oscuro fino.
4. **Audio:** voz Fish Audio **"Psychological"**. Los efectos nunca suenan más fuerte que la voz, pero deben oírse. El máster final va **fuerte: -13 LUFS**.
5. **ElevenLabs: NO tocar** (ni voz, ni música, ni efectos). La música y los efectos salen de fuentes gratis con licencia.
6. **Rótulo de capítulo = estilo A ("cine")** y **la entrada del logo va sobre fondo NEGRO propio**, sin estrellas.
7. **Claves (API keys):** nunca en el repositorio ni en el chat. Se leen de archivos privados (ver `produccion.md`).
8. **Dale alternativas al usuario cuando las pida, con una recomendación clara.** Muéstrale el resultado (render o imagen) antes de pasar a lo siguiente.
9. **No toques la skill ni los archivos del canal "¿Por qué pasó?"** (`src/porquepaso/`, `.claude/skills/porque-paso/`).
