# Cómo seguir QUIET CORTEX en tu computadora

Hay dos piezas:
1. **La skill `quiet-cortex`**: la "memoria" del canal (nicho, estilo aprobado, flujo de trabajo y estado del vídeo 01).
2. **El proyecto**: el código, la voz, el guion y la marca. Está en GitHub: repositorio `geoalessy/claude`, rama `claude/upbeat-goldberg-v62nak`.

## Opción A — Claude Code en tu computadora (recomendada: puede renderizar los vídeos)
Abre la Terminal en tu Mac y ejecuta:

```bash
git clone -b claude/upbeat-goldberg-v62nak https://github.com/geoalessy/claude.git quiet-cortex
cd quiet-cortex
npm install
pip3 install faster-whisper numpy
brew install ffmpeg
```

- La skill ya viene dentro del proyecto (`.claude/skills/quiet-cortex/`): **se carga sola** al abrir Claude Code en esa carpeta (`claude`).
- Si la quieres disponible en cualquier carpeta, cópiala a tu carpeta personal:

```bash
mkdir -p ~/.claude/skills && cp -R .claude/skills/quiet-cortex ~/.claude/skills/
```

- **Claves (privadas, fuera del proyecto):** guarda tu clave de Fish Audio en `~/.claves/.fish_key` y la de Pixabay en `~/.claves/.pixabay_key` (un archivo de texto con solo la clave). Te recomiendo **generar claves nuevas**, porque las anteriores se pegaron en el chat.
- **Descargar otra vez el material pesado**, que no se sube a GitHub:

```bash
bash scripts/mente_clips_v01.sh
```

```bash
bash scripts/mente_audio_gratis.sh
```

- Para ver el proyecto: `npx remotion studio`. El primer minuto es la composición `MenteV01Minuto1HD`.

## Opción B — App de Claude (chat, escritorio o web)
1. Abre Configuración → Capacidades → **Skills** → "Subir skill".
2. Sube `canal-mente/quiet-cortex-skill.zip`.
3. En el chat sabrá todo del canal (estilo, nicho, estado). Para renderizar vídeos necesitas la Opción A o una sesión de Claude Code en la nube con este repositorio.

## Mensaje para empezar una sesión nueva
> Usa la skill quiet-cortex. Seguimos con el vídeo 01 de QUIET CORTEX: lee `referencias/estado-video-01.md` y continúa con lo que falta.
