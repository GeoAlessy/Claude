# Estudio con la API de YouTube: canales que explotaron con pocos videos
*1 de noviembre de 2026 · Datos reales de la YouTube Data API v3*

## Metodología
- **Pasada 1 (general):** 21 búsquedas en 10 idiomas → 1,290 canales revisados → **5** con ≤10 videos y ≥1M de vistas.
- **Pasada 2 (enfocada en el nicho):** 20 búsquedas de explicadores, 3D, ciencia y dashcam → 1,348 canales revisados → **35** con ≤15 videos y ≥500k vistas.
- Datos crudos: `canales_virales_pasada1_general.*` y `canales_virales_pasada2_nicho.*`
- Se descartaron los canales con señales de vistas pagadas con anuncios (0 likes con cientos de miles de vistas: *willdo*, posiblemente *Wondora*).

---

## 1. Los casos más cercanos a nuestro formato ("¿Por qué pasa X?" + animación)

| Canal | Edad del canal | Videos | Video que explotó | Vistas | Duración |
|---|---|---|---|---|---|
| **The Universe Disagrees** | 5 semanas | 9 | *Why Do Phantom Traffic Jams Happen?* | **9.1M** (5,748 comentarios) | 61 s |
| **Doodles Fact** | 1 semana | 9 | *How a Hole in Your Yard Can Become a Nuclear Bunker* | **5.7M** (era su **1.er** video) | 99 s |
| **Badream** | — | 3 | *How You Accidentally Invented the Mechanical Typewriter* (Blender 3D) | **4.9M** | 146 s |
| **Built From Scraps** | — | 15 | *How Basketball Was Made From a Peach Basket* | **4.5M** | 61 s |
| **WorldMesh 3D** | 10 días publicando | 7 | *How Did Dinosaurs Protect Their Eggs?* (3D) | **3.6M** | 51 s |
| **3D Simplified** | 6 meses | 9 | *Why Does a Diesel Stop at 4,500 RPM?* | **2.7M** | 32 s |
| **Prospectus Lab** | 5 meses | 10 | *Why Do Military Helicopters Have Knives on Their Nose?* | **2.6M** | 88 s |
| **Global Secrets** | — | 10 | *How Did They Survive Running Out of Fuel in the Middle of the Atlantic?* | **2.2M** | 158 s |
| ↳ | | | *How Do You Survive a Bugatti Crash at 400 km/h?* | **1.1M** | 180 s |
| **Glamrev** | **9 días** | 3 | *He Trusted Physics… and Jumped From a Speeding Truck* | **27M** (su **1.er** video) | 20 s |

### En español y portugués (menos competencia, techo más bajo)

| Canal | Edad | Video que explotó | Vistas |
|---|---|---|---|
| **Nexo Espacial** | — | *El secreto de la gravedad en una Tierra plana* | 4.3M (5,470 comentarios) |
| **Cómo funcionan las motos** | **7 días** | *¿Sabías que al girar haces un contramanillar inconscientemente?* (su **1.er** video) | 922K |
| **Sabías que… ya** | 5 días | *¿Sabías que la madera es más rara que un diamante?* | 1.06M |
| **Engenho da Casa** (PT) | — | *Não alague o banheiro para tomar banho* (ingeniería de la casa) | 841K |
| **Desmonta Mundo** (PT) | 3 semanas | *É assim que protege o galinheiro contra raposas* | 793K |

---

## 2. Los 8 patrones que se repiten

### 1) Un video carga a todo el canal
En casi todos los casos, **el video top tiene entre el 75% y el 99% de las vistas del canal** (The Universe Disagrees 93%, Doodles Fact 99.7%, Badream 98%, WorldMesh 95%, Glamrev ~100%). **No crecen de a poco: un video se dispara.**

### 2) La explosión llega MUY temprano
Doodles Fact, Glamrev y *Cómo funcionan las motos* explotaron con **su primer video**. The Universe Disagrees y WorldMesh, en **semanas**. Los canales nuevos sí tienen oportunidad desde el primer día.

### 3) El título es SIEMPRE una pregunta concreta
*"Why do…"*, *"How did…"*, *"How do you survive…"*, *"¿Sabías que…?"*. Ninguno de los explicadores virales usa un título como *"Análisis de…"* o *"Explicación de…"*.

### 4) ⭐ La pregunta es sobre un DETALLE RARO de algo conocido
Esta es la tecla más importante del estudio:
- *"¿Por qué los helicópteros tienen **cuchillos en la nariz**?"*
- *"¿Por qué un diésel **se detiene a 4,500 RPM**?"*
- *"¿Por qué hay **atascos sin razón**?"*
- *"¿Un **hoyo en tu patio** puede ser un búnker?"*

Es algo que **todo el mundo vio, pero nunca se preguntó**. El detalle es pequeño, visual y concreto.

### 5) Los temas cotidianos generan los comentarios más altos
*Phantom traffic jams* (todos hemos estado en uno) tiene **5,748 comentarios**. Cuando el tema es parte de la vida de todos, **todos opinan**, y eso empuja al video a nuevas oleadas.

### 6) Supervivencia + peligro = escala enorme
*"He Trusted Physics… and Jumped From a Speeding Truck"* llegó a **27M en una semana**, y *"How do you survive…"* superó el millón **dos veces** en Global Secrets. **El peligro físico explicado con ciencia es justo nuestro nicho.**

### 7) Plantilla de título fija = serie
- Built From Scraps: *"How [deporte] Was Made From [objeto]"*
- Doodles Fact: *"How a Hole in Your Yard Can Become [X]"*
- Prospectus Lab: *"Why Does [arma] Have [cosa rara] on Its Nose?"*

Cada video es un episodio de la misma plantilla.

### 8) Duración
Los explicadores que explotaron duran **entre 32 y 99 segundos** (la mayoría, 50–70 s). Los de loop satisfactorio, 9–16 s. **Nuestro formato encaja en 45–70 s**, un poco más largo de lo que propuse antes (35–45 s).

---

## 3. 🔁 Analogía: de su tema al nuestro

| Su video viral | Lo que hace | Nuestra versión en "¿Por qué pasó?" |
|---|---|---|
| *Why Do Phantom Traffic Jams Happen?* | Un fenómeno cotidiano que todos vivimos y nadie entiende | **"¿Por qué las escaleras mecánicas atrapan zapatos?"** |
| *Why Do Helicopters Have Knives on Their Nose?* | Un detalle raro → su función secreta | **"¿Por qué las escaleras mecánicas tienen cepillos a los lados?"** → *"Porque esto pasa sin ellos"* + clip + 3D |
| *How Do You Survive a Bugatti Crash at 400 km/h?* | Supervivencia + física | **"¿Cómo sobrevives si el ascensor cae?"** |
| *He Trusted Physics… and Jumped From a Speeding Truck* | Persona + decisión peligrosa + física | **"Confió en el balcón… y esto pasó"** |
| *Why Does a Diesel Stop at 4,500 RPM?* | Un número exacto y curioso | **"¿Por qué esta llanta explotó a 120 km/h?"** |
| *How a Hole in Your Yard Can Become a Bunker* | Lo cotidiano se vuelve extraordinario | **"Así una grieta en tu pared se convierte en un derrumbe"** |

---

## 4. 🎯 Conclusión: la tecla ajustada

El estudio **confirma** la idea y la **afina**:

**Antes:** *"¿Por qué pasó esto?"* + un desastre.
**Ahora:** **una pregunta sobre un detalle raro de un objeto cotidiano**, con el desastre como **prueba** de por qué ese detalle importa.

### Plantilla de serie propuesta
> **"¿Por qué [objeto cotidiano] tiene [detalle raro]?"** → clip de Reddit de cuando ese detalle falla → 3D holográfico → *"Ahora ya sabes por qué."*

### Los 3 primeros pilotos propuestos
1. **"¿Por qué las escaleras mecánicas tienen cepillos a los lados?"** → los cepillos evitan que el zapato o el pie quede atrapado entre el escalón y la pared lateral.
2. **"¿Por qué los ascensores no pueden caer en picada?"** → el freno de seguridad (el paracaídas del ascensor).
3. **"¿Por qué las ollas a presión tienen una válvula extra?"** → la válvula de seguridad, y lo que pasa cuando se tapa.

**Duración objetivo:** 50–65 s. **Título:** la pregunta exacta. **Texto en pantalla, primer segundo:** la misma pregunta.

### Idioma
- En **inglés** los techos son de 5–27M, pero hay mucha más competencia.
- En **español y portugués** hay casos de ~1M con canales de **una semana** de vida → **menos competencia, entrada más fácil**.
- Recomendación: empezar en español y, si un video funciona, sacar su versión en inglés.
