# Memoria del proyecto

- El usuario habla **español** y no es técnico: responde siempre en español claro, sin jerga.
- Este repo produce Shorts verticales con Remotion para dos canales. Cada canal tiene su skill con el flujo completo:
  - **"¿Por qué pasó?"** (español, clips virales de Reddit + holograma 3D) → `.claude/skills/porque-paso/SKILL.md`
  - **@ToonUnpacked / "Could You Survive It?"** (inglés, escenas de Los Simpsons + física real) → `.claude/skills/toon-survive/SKILL.md`
    - Último video aprobado: S01, la caída al desfiladero (S2E08). Archivo: `out/S01v2q_desfiladero_4k.mp4`
    - Siguiente paso: proponer 3 capítulos/escenas; el usuario elige y sube el episodio.
- Reglas fijas:
  - Las claves solo van en variables de entorno o por el proxy; nunca en el chat ni en git.
  - Los clips y episodios de terceros no van a git.
  - No esquivar protecciones anti-bot.
  - Renders pesados: en segundo plano, uno a la vez.
  - Antes de entregar, revisar fotogramas (incluido el último).
  - Entregar con SendUserFile y explicar en una línea qué cambió.
  - Commit y push al terminar cada cambio.
