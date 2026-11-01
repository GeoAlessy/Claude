# Canales que explotan con pocos videos y cómo trasladar su "tecla" a "¿Por qué pasó?"
*1 de noviembre de 2026*

## ⚠️ Límite de esta investigación
Desde esta sesión **no puedo entrar a YouTube, Social Blade ni Playboard** (la red los bloquea) y no hay una clave de la API de YouTube configurada. Por eso:
- **Parte A:** solo los casos que encontré **documentados en la web**.
- **Parte B:** los **formatos que más se repiten** en canales que explotan rápido (conocimiento general, sin inventar nombres ni cifras).
- **Parte C:** la analogía de cada formato con nuestro nicho.
- Al final está el plan para conseguir **datos reales con la API de YouTube**.

---

## A. Casos documentados

| Canal / caso | Qué pasó | Tema que explotó | La "tecla" |
|---|---|---|---|
| **Zack D. Films** (hoy ~29M suscriptores) | Sus primeros videos largos no funcionaron. **Despegó con su 6.º Short**, sobre la desaparición del Titanic (marzo de 2022). Después empezó a publicar a diario | Un **desastre que todo el mundo ya conoce** + un dato oculto | Reconocimiento inmediato + "no sabías esto" |
| **Kuti Bari** (manualidades) | Un video **sin diálogo** de una botella de Coca-Cola convertida en lámpara superó los **16 millones de vistas** | Transformación de un objeto cotidiano | Se entiende en cualquier idioma + satisfacción |
| **Master POV** (animación, creado a finales de 2025) | Creció rápido con **un formato animado que se repite** igual en cada video | "POV: eres…" | El espectador está **dentro** de la historia |
| **Historias de chats falsos** (muchos canales) | Formato muy replicado. Los vendedores de herramientas dicen que hay videos de millones de vistas (no está verificado) | Peleas de pareja, infidelidades, chismes | Drama humano + final desconocido + lectura al ritmo del suspenso |
| **Caso personal** (newsletter jobtark) | **Un solo video llegó a ~20 millones** de vistas. El resto se quedó muy por debajo | (No especificado) | Un solo video carga al canal |

**Patrón confirmado en todos:** el canal no crece de a poco. **Un video se dispara** y arrastra a los demás. El trabajo es **producir intentos de calidad con el mismo formato** hasta que uno pegue (Zack D. Films lo logró en el 6.º).

---

## B y C. Los 10 formatos que más explotan → su analogía en nuestro nicho

| # | Formato viral | Por qué funciona (la tecla) | 🔁 Analogía para "¿Por qué pasó?" |
|---|---|---|---|
| 1 | **Chat de WhatsApp: "peleas con mi novio"** | Conflicto humano + **una pista que el espectador ve antes que el protagonista** + final sorpresa | **"La advertencia ignorada":** toda falla tiene una señal previa (una grieta, un ruido, un chirrido) que alguien ignoró. *"Este ascensor avisó 3 veces. Nadie escuchó."* |
| 2 | **Desastre famoso + dato oculto** (Zack D. Films y el Titanic) | Ya conoces la historia, así que no hay que explicar nada para engancharte | Empezar con **casos que salieron en las noticias** y que la gente ya vio en su celular |
| 3 | **"¿Qué pasa si…?"** | Hipótesis imposible de ignorar | *"¿Qué pasa si te quedas en la escalera mecánica cuando se rompe?"* |
| 4 | **POV en segunda persona** | El espectador **es** el protagonista | *"POV: estás en el ascensor y escuchas esto…"* |
| 5 | **"Encuentra el error"** | El espectador participa y vuelve a ver el video para encontrarlo | ⭐ *"Esta escalera dio una señal 3 segundos antes de romperse. ¿La viste?"* → lo ven otra vez para buscarla |
| 6 | **Sin diálogo / satisfactorio** (Kuti Bari) | Funciona en cualquier idioma | Que el 3D se entienda **sin audio**: flechas, etiquetas, colores (rojo = falla) |
| 7 | **"¿Qué harías tú?"** | Abre debate en comentarios | *"Tienes 2 segundos. ¿Saltas o te agarras?"*, y luego el 3D muestra la respuesta correcta |
| 8 | **Historias de Reddit narradas** | Una historia real contada por quien la vivió | Usar el **título del post de Reddit** como gancho: *"Mi edificio crujía todas las noches…"* |
| 9 | **Rankings ("Top 3 más peligrosos")** | Hay que esperar al #1 | Serie: *"3 cosas de tu casa que pueden explotar"*, con el #1 al final |
| 10 | **Cuenta regresiva / tensión** | El reloj obliga a quedarse | Un contador en pantalla: *"7 segundos antes del colapso…"* sobre el 3D |

---

## 🎯 La tecla para nosotros: combinar 1 + 4 + 5

El chat de WhatsApp funciona porque **el espectador ve la señal antes que el protagonista y quiere gritarle "¡no lo hagas!"**. Ese es el detonante. En nuestro nicho se traduce así:

> **"Esta [cosa cotidiana] avisó antes de fallar. ¿Lo notaste?"**

1. **0–1 s:** el clip de Reddit + texto: *"Avisó 3 segundos antes. ¿Lo viste?"*
2. **1–5 s:** el desastre, que se congela antes del final.
3. **5–35 s:** el 3D holográfico **regresa al momento de la señal** (el ruido, la grieta), la marca en rojo y explica por qué ocurrió.
4. **35–42 s:** *"Si alguna vez escuchas / ves esto → aléjate."*
5. **Repetición:** al volver al inicio, el espectador **ya sabe dónde mirar** y lo ve de nuevo para encontrar la señal. **El replay se vuelve parte del juego.**

**Por qué esta combinación:**
- **Repetición garantizada** (formato 5): el algoritmo lo premia.
- **Miedo personal** (formato 4): retiene en todas las oleadas, no solo en tu nicho.
- **Para compartir** (formato 1): *"mira, si tu ascensor hace este ruido…"*.
- **Se entiende sin audio** (formato 6): puede viajar a otros idiomas.

**Serie de nombre fijo para el canal:** *"Avisó antes de fallar"*. Cada video es un episodio con la misma estructura. Así YouTube aprende rápido a quién mostrarlo y el espectador reconoce el formato.

---

## Para conseguir datos reales (siguiente paso)
Con una **clave gratuita de la API de YouTube** (Google Cloud → YouTube Data API v3) puedo hacer un script que:
1. Busque Shorts publicados en los últimos 90 días sobre cualquier tema y en cualquier idioma.
2. Filtre los canales con **≤ 10 videos** y **más de 1 millón de vistas** en total.
3. Saque el tema, el título, la duración y las vistas de cada uno.
4. Haga un ranking de los temas que más se repiten.

## Fuentes
- [Zack D. Films Wiki (fandom)](https://zackdfilms.fandom.com/wiki/Zack_D._Films)
- [Zack D. Films en NamuWiki](https://en.namu.wiki/w/Zack%20D.%20Films)
- [Zack D. Films en vidIQ](https://vidiq.com/pt/youtube-stats/channel/UCvz84_Q0BbvZThy75mbd-Dg/)
- [vidIQ: ideas de canales sin mostrar la cara (Kuti Bari, Master POV)](https://vidiq.com/blog/post/youtube-channel-ideas-without-showing-your-face/)
- [Clippie: historias de chats falsos](https://clippie.ai/blog/how-to-create-fake-text-message-story-videos)
- [Korpi: videos de historias de mensajes](https://korpi.ai/blog/how-to-make-text-message-story-videos)
- [jobtark: "Abrí un canal de YouTube Shorts y esto es lo que gané"](https://newsletter.jobtark.com/p/abr-un-canal-de-youtube-shorts-y-esto-es-lo-que-gan)
- [Merca2.0: estudio de Metricool sobre vistas en Shorts y TikTok](https://merca20.com/tiktok-consigue-hasta-518-mas-vistas-que-youtube-shorts-revela-estudio-de-metricool)
- [Medium: canal de 1M de suscriptores con pocos ingresos](https://medium.com/write-a-catalyst/i-had-a-1m-subscriber-channel-and-still-barely-made-any-money-e83839f59101)
