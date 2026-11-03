# Material del vídeo 01 — lista de descarga

**Regla del canal:** casi nada de IA. Prioridad: **película antigua de dominio público** y **stock gratis**; todo lo demás lo hacemos con código. Imágenes IA solo como último recurso, si no aparece nada real.

## Mezcla objetivo

| Material | % del vídeo | Notas |
|---|---|---|
| Película antigua de dominio público | ~28 % | Nostalgia, infancia, memoria. Solo escaneos HD; filtro `PeliculaAntigua` suave (intensidad 0,3–0,5). |
| Stock gratis de internet | ~30 % | Vida cotidiana actual. Filtro suave (intensidad 0,2–0,35) para que no parezca genérico. |
| Motion graphics por código | ~33 % | Explicar la ciencia: cerebro-galaxia, línea de vida, fichas, pruebas interactivas. |
| Tarjetas de testimonio | ~5,5 % | Posts públicos **parafraseados**, sin usuario, sin logos ni capturas. |
| Tu móvil (planos sin cara) | ~3 % (dentro del stock) | Relojes, pasillos, ventanas. Lo más auténtico. |
| Imágenes IA | ~1 % | Solo si no existe material real (p. ej. la cueva de Siffre). |

**Ritmo:** ningún plano de más de 4–6 s; nunca dos planos seguidos del mismo tipo.

## Reparto por capítulo (vídeo de ~26 min)

| Tramo | Película antigua | Stock | Gráficos | Otros |
|---|---|---|---|---|
| Gancho (0:00–0:50) | 40 % | 20 % | 40 % | — |
| Cap. 1 · Los años se aceleran | 30 % (películas caseras de infancia) | 25 % | 30 % | 15 % testimonios |
| Cap. 2 · El cerebro deja de grabar | 30 % (rutina, oficinas) | 40 % (trayecto diario) | 30 % | — |
| Cap. 3 · Cámara lenta | 25 % (crash tests) | 35 % (caída libre, montaña rusa) | 30 % | 10 % testimonios |
| Cap. 4 · El tiempo vuela | 15 % | 40 % (concierto, sala de espera) | 35 % | 10 % testimonios |
| Cap. 5 · El reloj del cuerpo | 30 % (fiebre, años 60) | 25 % (cueva) | 35 % | 10 % imagen IA si no hay foto de Siffre |
| Cap. 6 · Sueños | 35 % (Méliès, laboratorio del sueño) | 20 % | 35 % | 10 % testimonios |
| Cap. 7 · Vives en el pasado | 15 % | 35 % (ojo macro, reloj) | 50 % (pruebas visuales) | — |
| Cap. 8 + cierre | 40 % (familias, películas caseras) | 40 % (viaje, atardecer) | 20 % | — |

## Regla de calidad (obligatoria)

- **Nada por debajo de 1080 líneas de resolución.** Prohibido usar las copias de 320×240 o 640×480 de archive.org estiradas.
- **Prelinger:** usar solo los ítems con *master* escaneado (`*_master.intros.mov` o `.mp4` de 2K, 4K o 5K). Pesan decenas de GB, pero ffmpeg lee por HTTP solo los segundos necesarios (`-ss` antes de `-i`).
- **Clásicos:** buscar copias 1080p (p. ej. *Safety Last!* en `safety-last-1923`). Usar solo la imagen: la banda sonora de las restauraciones modernas tiene derechos.
- **Stock:** descargar siempre la versión 1080p o 4K (Mixkit la ofrece gratis). Pexels también tiene 4K, pero necesita permitir `pexels.com` y `videos.pexels.com` en la red del entorno.
- **Filtro suave en material HD:** sin sepia fuerte ni rayas falsas; solo grano ligero y el color del canal. El escaneo real ya tiene textura de película.
- *The City* (1939), *Sleep for Health* (1950) y *American Look* (1958) solo existen a 640×480 → se sustituyen por planos equivalentes de masters HD.

## Regla visual

**El código nunca dibuja personas.** El código hace lo abstracto (cerebro, datos, tiempo, ilusiones). Las personas salen siempre de material real.

## Películas clásicas de dominio público (el impacto de "película de verdad", sin riesgo)

En EE. UU. las películas estrenadas antes de 1930 son de dominio público, y algunas posteriores también (por no renovar el registro). Usar copias **sin la música añadida en restauraciones modernas** y guardar el enlace de origen.

| Película | Escena útil | Para |
|---|---|---|
| *Safety Last!* (1923) | Harold Lloyd colgado de las manecillas de un reloj gigante | Gancho / cap. 1 (el tiempo) |
| *Metropolis* (1927) | Obreros moviendo el reloj-máquina; ciudad futurista | Cap. 2 (rutina) |
| *Le Voyage dans la Lune* (1902) | Imágenes oníricas imposibles | Cap. 6 (sueños) |
| *Nosferatu* (1922) | Sombras en la escalera | Cap. 6 / futuros vídeos de miedos |
| *Carnival of Souls* (1962) | Atmósfera liminal, inquietante | Futuros vídeos de miedos |
| *Charade* (1963), *His Girl Friday* (1940) | Escenas humanas de cine clásico | Planos de personas |

**No usar:** películas o series con copyright, ni siquiera 3–5 segundos sin sonido. Content ID reconoce la imagen y un solo reclamo puede llevarse los ingresos de todo el vídeo.

**YouTube con licencia Creative Commons:** solo de autores originales verificados (universidades, NASA, creadores de stock), citando al autor en la descripción.

## Dónde buscar (todo gratis y con licencia para monetizar)

| Fuente | Qué tiene | Licencia |
|---|---|---|
| **Prelinger Archives** — archive.org/details/prelinger | Películas caseras, educativas e industriales de 1930–1980 | Dominio público (revisa la ficha de cada clip) |
| **Pexels Videos** — pexels.com/videos | Stock moderno de calidad | Licencia Pexels: uso comercial, sin atribución |
| **Pixabay Videos** — pixabay.com/videos | Stock moderno | Licencia Pixabay: uso comercial |
| **Mixkit** — mixkit.co/free-stock-video | Stock cinematográfico | Licencia gratuita de Mixkit |
| **NASA Image and Video Library** — images.nasa.gov | Espacio, astronautas, Tierra | Dominio público en general (sin usar logos para respaldo) |
| **Wikimedia Commons** | Fotos y vídeos científicos e históricos | Revisa cada archivo: dominio público o CC-BY (citar autor) |

**Importante:** guarda en un `.txt` el enlace de cada clip que uses. Si alguna vez llega un reclamo, ese enlace es tu prueba de licencia.

## Lista por escena

Guarda cada archivo en `public/mente/clips/` con el nombre indicado.

| Escena | Qué buscar | Fuente sugerida | Búsqueda (en inglés) | Nombre del archivo |
|---|---|---|---|---|
| Gancho | Niños jugando en la playa o en verano, película casera antigua | Prelinger | `home movies beach children`, `summer vacation 1950s` | `v01_verano_infancia.mp4` |
| Gancho | Adulto en oficina gris de hoy, mirando la pantalla | Pexels | `office worker tired desk`, `bored office` | `v01_oficina_gris.mp4` |
| Gancho | Calendario arrancando hojas / reloj rápido | Pexels / Pixabay | `calendar pages flipping`, `clock time lapse` | `v01_calendario.mp4` |
| Cap. 1 | Fiesta de cumpleaños infantil antigua | Prelinger | `birthday party home movie` | `v01_cumple_antiguo.mp4` |
| Cap. 1 | Persona mayor mirando por la ventana | Pexels | `elderly man window`, `old woman looking outside` | `v01_mayor_ventana.mp4` |
| Cap. 2 | Primer día de escuela antiguo | Prelinger | `first day of school 1950s`, `classroom children` | `v01_escuela_antigua.mp4` |
| Cap. 2 | Mismo trayecto al trabajo: metro, tráfico, escaleras mecánicas | Pexels / Mixkit | `subway commute crowd`, `traffic jam morning` | `v01_trayecto_1.mp4` … `_3.mp4` |
| Cap. 2 | Oficinas antiguas en fila (rutina) | Prelinger | `office workers typing 1950s` | `v01_oficina_antigua.mp4` |
| Cap. 3 | Accidente / choque antiguo de prueba (crash test) | Prelinger | `crash test film`, `highway safety film` | `v01_crash_antiguo.mp4` |
| Cap. 3 | Atracción de parque: caída libre / montaña rusa | Pexels / Pixabay | `drop tower ride`, `roller coaster pov` | `v01_caida_libre.mp4` |
| Cap. 4 | Concierto con luces / fiesta de noche | Pexels / Mixkit | `concert crowd lights`, `night party friends` | `v01_concierto.mp4` |
| Cap. 4 | Sala de espera vacía / reloj de pared | Pexels | `waiting room`, `wall clock ticking` | `v01_sala_espera.mp4` |
| Cap. 5 | Termómetro, persona enferma en cama, tono antiguo | Prelinger / Pexels | `fever thermometer`, `sick in bed` | `v01_fiebre.mp4` |
| Cap. 5 | Cueva, espeleólogos, interior de cueva con lámpara | Pexels / Wikimedia | `cave explorer headlamp`, `ice cave` | `v01_cueva.mp4` |
| Cap. 5 | Microscopio / neuronas reales | Wikimedia / Pexels | `neurons microscope`, `brain cells` | `v01_neuronas.mp4` |
| Cap. 6 | Dormitorio de noche, persona durmiendo | Pexels | `sleeping at night bedroom dark` | `v01_dormir.mp4` |
| Cap. 6 | Laboratorio del sueño antiguo / electrodos | Prelinger / Wikimedia | `sleep laboratory`, `EEG electrodes` | `v01_lab_sueno.mp4` |
| Cap. 7 | Ojo en primer plano moviéndose | Pexels | `eye close up macro`, `eye movement` | `v01_ojo.mp4` |
| Cap. 7 | Reloj analógico con segundero | **Tu móvil** o Pexels | `analog clock second hand` | `v01_reloj.mp4` |
| Cap. 8 | Viaje / lugar nuevo, caminar por calle desconocida | Pexels / Mixkit | `walking new city`, `travel street` | `v01_lugar_nuevo.mp4` |
| Cap. 8 | Cocinar algo, manos | Pexels | `cooking hands kitchen` | `v01_cocinar.mp4` |
| Cap. 8 | Atardecer mirado con calma | Pexels | `sunset watching person` | `v01_atardecer.mp4` |
| Cierre | Película casera antigua de una familia feliz (cierre emotivo) | Prelinger | `family home movie 1960s` | `v01_familia_antigua.mp4` |

## Testimonios (tarjetas)

Busca en Reddit (r/AskReddit, r/NoStupidQuestions, r/Showerthoughts) posts públicos sobre:
- "time goes faster as I get older" (cap. 1)
- "car accident felt like slow motion" (cap. 3)
- "the night went by in minutes" (cap. 4)
- "dream felt like it lasted hours" (cap. 6)

Copia el enlace del post, y en el guion lo **parafraseamos** (nunca captura con el usuario ni el logo de Reddit). Si el post es muy bueno, puedes pedir permiso al autor por mensaje.

## Imágenes IA (último recurso)

Solo si no aparece nada real:
- La cueva de Siffre en 1962 (si no hay foto real libre de derechos).
- El experimento de la torre de caída (SCAD) si no hay stock de una atracción parecida.

En ese caso, imágenes **fijas** con movimiento lento de cámara hecho por código, pasadas por el filtro de película para que no se note "IA cinematográfica".

## Candidatos HD encontrados (Prelinger, masters 2K–5K)

Se leen por HTTP solo los segundos necesarios (ver `scripts/mente_clips_v01.sh`, función `cortar_hd`).

| Para | Ítem de archive.org | Resolución |
|---|---|---|
| Memoria (¡título perfecto!) | `202096_The_Memory_Chain` | 2048×1536 |
| Oficinas, rascacielos | `200718_Rockefeller_Center` (1945) | 4096×3072 |
| Calles de Nueva York | `IA35000011001_201710` (Manhattan, 1945) | 2048×1536 |
| Multitudes, feria | `200732_New_York_Worlds_Fair_6` | 2048×1536 |
| Miedo (cap. 3) | `202891_Overcoming_Fear` (1950) | 2048×1536 |
| Accidentes (cap. 3) | `200503_The_Human_Factor_In_Driving` | 2048×1536 |
| Cuerpo, salud (cap. 5) | `201668_Television_Commercials_The_Body` | 2048×1536 |
| Infancia, familia a color | `201047_Home_Movie_003791`, `HomeMoviePA097836`, `HMFamilyHolidayand97317` (1950) | 1440–2048 |
| Relojes, oficios | `masterhandscomplete4kh264` (*Master Hands*, 1936) | 4096×3072 |
