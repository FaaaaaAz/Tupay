# Plan de desarrollo — Tupay

## 1. Propósito del plan

Este documento organiza el desarrollo de **Tupay**, videojuego web de fútbol con tapitas inspirado en la Liga boliviana, desarrollado como proyecto final de Certificación.

El proyecto debe mostrar una evolución comprensible desde la idea inicial hasta la aplicación publicada. Cada fase produce código verificable, documentación, evidencia y commits claros, utilizables después en una presentación breve.

La prioridad no es acumular funciones, sino construir una partida completa, estable y explicable, alineada con la rúbrica del examen: dos jugadores como mínimo, interacción y movimiento, estado y reglas con finalización, React y Express comunicados con `fetch` y JSON, pruebas E2E con integración continua y despliegue, y documentación suficiente para defender el proyecto.

- **Último commit permitido:** martes 15 de septiembre, 16:00 (hora de GitHub).
- **Defensa:** a confirmar con el docente, después del cierre del repositorio.
- **Introducción y evolución de la idea:** `docs/introduccion.md`.
- **Reglas completas:** `docs/reglas.md`.

## 2. Nota de alcance: la Liga completa es la parte más ambiciosa

La visión de Tupay incluye una temporada de Liga con los 10 equipos reales definidos en `docs/reglas.md`, jugados todos contra todos (9 partidos por jugador). Esto es considerablemente más grande que un partido suelto.

Una decisión hace que sea manejable: **los partidos que no involucran a ninguna persona se resuelven con una simulación rápida** (un marcador generado con semilla, sin física completa), no jugándolos uno por uno. Así la tabla avanza para los 10 equipos sin tener que jugar de verdad los partidos entre equipos que no controla nadie.

Este plan sigue esa lógica en todas sus fases: primero el partido individual (Eliminatoria y un partido suelto de Liga), y solo después la temporada completa como una capa por encima. Si en algún punto conviene recortar, la sección 8 (orden de reducción de alcance) dice exactamente qué recortar primero, y la temporada completa está cerca del principio de esa lista.

## 3. Alcance del producto

### Núcleo obligatorio

La primera versión completa de Tupay debe incluir:

- partida de 5 contra 5 para uno o dos jugadores, en el mismo dispositivo;
- cancha que utilice la mayor parte de la pantalla, en navegador de escritorio;
- tapitas, pelota, arcos y colisiones con física propia;
- elección de tapita, dirección y fuerza del tiro, con tiempo límite por turno;
- turnos y validación de acciones inválidas, incluida la restricción de no repetir equipo;
- marcador, mensajes visibles y estado de la partida;
- modo Eliminatoria (partido único, sin empate, meta de goles configurable);
- modo Liga como partido suelto (reloj acelerado configurable, empate posible, puntos 3-1-0);
- el perro como fuente de variabilidad controlada por el servidor;
- creación, consulta y actualización de partidas mediante una API REST;
- frontend y backend publicados bajo una sola dirección;
- pruebas E2E locales, en CI y contra producción.

### Ampliaciones condicionadas

Estas funciones se desarrollan únicamente cuando el núcleo obligatorio está completo, publicado y probado:

1. temporada de Liga completa (calendario todos-contra-todos, tabla de posiciones, control del rival por el segundo jugador, simulación rápida de partidos sin humanos);
2. rival controlado por el servidor con distintas dificultades (fácil, medio, difícil);
3. estadios con efectos físicos propios;
4. tiro de poder;
5. mejoras visuales, sonoras y de animación.

No se inicia una ampliación si existen fallos en el partido de 1 o 2 jugadores, la API, las pruebas E2E o el despliegue.

## 4. Forma de trabajo con el agente de IA

1. Solicitar lo que se necesite en cada momento: una tarea puntual del plan (por ejemplo, `Implementa la tarea 4.3 de docs/plan.md`), varias tareas juntas o un pedido libre que no está numerado en este documento. No es obligatorio avanzar tarea por tarea.
2. El agente inspecciona el estado actual del proyecto cuando lo necesite; si ya tiene contexto suficiente de la conversación, no hace falta que revise todo de nuevo antes de cada cambio.
3. El agente puede sugerir un commit y su mensaje, pero no debe ejecutar `commit`, `push`, crear tags ni cambiar servicios externos por su cuenta.
4. Revisar el cambio y pedir una explicación de cualquier parte que no se comprenda. Todo el código debe poder explicarse y modificarse en la defensa.
5. Ejecutar las verificaciones correspondientes:

   ```bash
   npm run lint
   npm run typecheck
   npm run test:unit
   npm run test:e2e
   npm run build
   ```

6. Probar manualmente el comportamiento modificado.
7. Registrar en `docs/uso-ia.md` la solicitud, qué se incorporó y qué se verificó personalmente.
8. Hacer el commit manualmente, usando el mensaje sugerido si aplica.
9. Si el trabajo corresponde a una tarea numerada del plan, marcarla terminada solo cuando su criterio de aceptación se cumpla.

### Convención de commits

`feat:` funcionalidad nueva · `fix:` corrección · `docs:` documentación · `test:` pruebas · `ci:` integración continua o despliegue · `refactor:` reorganización sin cambiar comportamiento · `chore:` configuración.

Los commits representan avances pequeños y comprensibles; no se agrupan varias tareas grandes en un solo commit.

## 5. Estrategia de versiones y evidencias

Al terminar cada fase:

1. ejecutar todas las verificaciones aplicables;
2. actualizar `docs/uso-ia.md` y `docs/decisiones.md`;
3. guardar una captura representativa en `docs/evidencias/`, con nombre descriptivo (por ejemplo, `fase-2-actions-en-verde.png`);
4. crear el tag `fase-N` únicamente después de verificar el resultado;
5. comprobar que la versión publicada corresponde al commit esperado.

## 6. Arquitectura objetivo

```text
tupay/
├── AGENTS.md
├── README.md
├── package.json              scripts unificados y dependencias permitidas
├── tsconfig.base.json        opciones estrictas compartidas
├── tsconfig.json             cobertura de compartido/ para el editor
├── vite.config.ts            raíz en client/, salida a dist/cliente, proxy /api en desarrollo
├── eslint.config.js          reglas de lint para cliente y servidor
├── assets/                   originales sin comprimir (fuente de verdad, no se publican)
├── scripts/dev.mjs           levanta Express y Vite juntos con `npm run dev`
├── scripts/optimizar-recursos.mjs   genera client/src/recursos/ a partir de assets/
├── dist/                     salida de compilación (cliente y servidor), no versionada
├── compartido/               tipos de entrada y salida de la API (sin lógica)
├── client/src/
│   ├── api/                  llamadas a Express con fetch
│   ├── componentes/          elementos visuales reutilizables
│   ├── hooks/                estado y coordinación de la interfaz
│   ├── pantallas/            Portada, Menú, Configuración, Partida, Temporada, Resultado
│   ├── recursos/             imágenes listas para la web (equipos, estadios, juego, emotes, pantallas)
│   └── estilos/              CSS propio
├── server/src/
│   ├── rutas/                adaptación HTTP y respuestas JSON
│   ├── servicios/            casos de uso: partida individual y temporada
│   ├── dominio/
│   │   ├── fisica/           tiros, movimiento, choques y rebotes
│   │   ├── reglas/           turnos, goles, validaciones y finalización
│   │   ├── estadios/         configuración de cada estadio
│   │   ├── eventos/          el perro
│   │   ├── rival/            estrategias del rival (aleatoria, por muestreo)
│   │   └── temporada/        calendario todos-contra-todos y tabla de posiciones
│   ├── repositorios/         partidas y temporadas en memoria
│   ├── utilidades/           vectores y azar con semilla
│   ├── app.ts
│   └── index.ts
├── e2e/
├── docs/
│   ├── introduccion.md
│   ├── reglas.md
│   ├── plan.md
│   ├── api.md
│   ├── boceto.md
│   ├── decisiones.md
│   ├── investigacion.md
│   ├── uso-ia.md
│   └── evidencias/
└── .github/workflows/
```

Las dependencias del backend avanzan en un solo sentido: `rutas → servicios → dominio`. El dominio no depende de Express, por lo que se puede probar sin levantar el servidor. El módulo `temporada/` reutiliza el mismo motor de partida individual; no duplica la física ni las reglas de un partido.

### Decisiones de arquitectura

| Decisión | Justificación |
|---|---|
| SVG para la cancha | Elementos visibles en el DOM, CSS propio, interacción por puntero y localizadores claros para Playwright. |
| Física en el servidor | Hace que Express participe en una decisión significativa y evita que la lógica crítica exista solo en el navegador. |
| Animación en React | React reproduce el recorrido calculado por el servidor sin decidir el resultado del tiro. |
| Azar con semilla | Hace reproducibles los eventos variables, el rival y las pruebas. |
| Repositorio en memoria | Suficiente para el alcance del examen; se documenta como limitación. |
| Temporada como capa sobre la partida | El calendario y la tabla son datos y orquestación; el partido en sí sigue siendo el mismo motor de física y reglas. |
| Originales en `assets/`, versiones web en `client/src/recursos/` | Los originales pesan 46 MB y no deben publicarse; `scripts/optimizar-recursos.mjs` genera las versiones WebP (2,2 MB en total) que sí se empaquetan. Vite les pone hash y el navegador las cachea. |
| Arcos como imagen sobrepuesta | Dibujar el arco por encima de todo crea el efecto de que la pelota entra al arco. El mismo archivo sirve para los dos lados: se voltea en espejo horizontal, no se rota. |
| Partidos sin humanos resueltos por simulación rápida | Evita que jugar una Liga completa signifique jugar decenas de partidos que nadie observaría. |
| CSS propio, sin React Router ni librerías de estado | Cumple la restricción del examen de no usar frameworks o bibliotecas externas para la interfaz. |
| Un solo `package.json` en la raíz | Evita workspaces y dependencias duplicadas; `compartido/`, `client/` y `server/` se separan por su `tsconfig`, no por paquetes distintos. |
| `compartido/` solo con tipos | Al importarse con `import type`, desaparece al compilar: el cliente y el servidor comparten el contrato sin compartir código ejecutable. |

### Uso moderado de SOLID

- Las rutas manejan HTTP, los servicios coordinan casos de uso y el dominio aplica reglas.
- Los componentes dibujan; los hooks coordinan estado, animación y solicitudes.
- El rival y la resolución de un partido de temporada son estrategias intercambiables detrás de un contrato pequeño (por ejemplo, "decide un tiro" o "resuelve un resultado"), lo que permite tener una estrategia aleatoria simple y, más adelante, una por muestreo o una simulación rápida sin tocar el resto del sistema.
- El servicio de partidas recibe su repositorio y su generador aleatorio por parámetro, para que las pruebas puedan usar una semilla fija.
- No se crea una interfaz o abstracción sin una necesidad concreta: código simple y claro vale más en la defensa que una arquitectura sobrecargada.

---

## 7. Fases de desarrollo

### Fase 0 — Definición y planificación

- [x] **0.1 Preparar el repositorio local.** Clonar el repositorio de GitHub, crear `.gitignore` (`node_modules`, `dist`, `playwright-report`, `test-results`, archivos de entorno) y un README mínimo. Confirmar con el docente el tipo de acceso al repositorio. Commit: `chore: preparar repositorio de Tupay`.
- [x] **0.2 Cerrar la introducción y el origen de la idea.** Revisar y ajustar `docs/introduccion.md`: nombre, significado, propósito, experiencia de juego y evolución de la idea. Commit: `docs: introducción y evolución de la idea`.
- [x] **0.3 Cerrar las reglas del núcleo.** Revisar y ajustar `docs/reglas.md`. Las reglas deben poder explicarse sin consultar el código. Commit: `docs: definir reglas del juego`.
- [ ] **0.4 Registrar planificación y uso de IA.** Añadir este archivo como `docs/plan.md`, crear `AGENTS.md` con las reglas de trabajo del agente (sin librerías prohibidas, sin `commit`/`push` automáticos, explicar antes de modificar) y `docs/uso-ia.md` con la tabla de registro. Commit: `docs: agregar plan y reglas de trabajo con IA`.
- [x] **0.5 Revisar equipos y estadios.** Comprobar que la tabla de 10 equipos y sus estadios en `docs/reglas.md` está completa y que cada equipo se puede diferenciar visualmente de los demás. Commit: `docs: revisar equipos y estadios`.

**Criterio de salida:** otra persona puede comprender qué es Tupay, cómo se juega, por qué es original y qué se construirá.

**Evidencia:** carpeta `docs/` visible en GitHub. Tag: `fase-0`.

### Fase 1 — Esqueleto técnico

- [x] **1.1 Configurar el proyecto.** `package.json` raíz con módulos ES, Node 22 o superior declarado en `engines` y scripts unificados. `client/`, `server/` y `compartido/` con TypeScript estricto. Solo React, Express, TypeScript, Vite, tsx, ESLint y Playwright. Commit: `chore: configurar React, Express y TypeScript`.
- [x] **1.2 Crear el servidor mínimo.** `server/src/app.ts` arma Express; `server/src/index.ts` escucha `process.env.PORT`. `GET /api/salud` con estado y versión (`RENDER_GIT_COMMIT`); rutas de API inexistentes responden 404 en JSON. Commit: `feat: crear servidor Express y ruta de salud`.
- [x] **1.3 Crear el cliente mínimo.** React consulta `/api/salud` con `fetch` y muestra el estado del servidor. Commit: `feat: conectar cliente React con Express`.
- [x] **1.4 Unificar dominio y puerto.** Vite compila el cliente y Express lo sirve; en desarrollo, Vite reenvía `/api` al servidor. `npm run build && npm start` debe abrir toda la aplicación desde una sola dirección. Commit: `feat: servir cliente compilado desde Express`.
- [x] **1.5 Configurar calidad estática.** ESLint cubre cliente y servidor; scripts `lint`, `lint:client`, `lint:server`, `typecheck`. Comprobar deliberadamente que una infracción hace fallar el comando y luego retirarla. Commit: `chore: configurar lint y typecheck`.

**Criterio de salida:** el cliente obtiene información real de Express, toda la aplicación compila y lint cubre ambos lados.

**Evidencia:** aplicación abierta desde Express y respuesta JSON de `/api/salud`. Tag: `fase-1`.

### Fase 2 — Integración continua y despliegue temprano

- [x] **2.1 Configurar Playwright.** Ejecución headless para CI (`chromium`) y ejecución visual con Google Chrome para la defensa (`chrome`). Prueba inicial: la página carga y confirma la respuesta del servidor. Scripts `test:e2e` y `test:e2e:visual`. Commit: `test: configurar Playwright`.
- [x] **2.2 Crear el pipeline.** Tres trabajos claramente nombrados: `Lint (frontend y backend)`, `Pruebas E2E (headless)` y `Deploy a Render`. El despliegue depende de que los dos anteriores terminen bien. Guardar el reporte E2E como artefacto. Commit: `ci: validar, probar y desplegar la aplicación`.
- [x] **2.3 Configurar el servicio en Render.** Un único Web Service para frontend y backend (Build `npm ci --include=dev && npm run build`, Start `npm start`, plan Free). `--include=dev` es necesario porque Vite y TypeScript son dependencias de desarrollo y se necesitan para compilar; sin esa bandera, un `NODE_ENV=production` en el entorno las omitiría y el build fallaría. Auto-Deploy en Off. Guardar la Deploy Hook URL como secreto `RENDER_DEPLOY_HOOK_URL` y la URL pública como variable `URL_PRODUCCION` en GitHub. No usar Docker.
- [ ] **2.4 Verificar el despliegue automático.** Un push a `main` dispara el pipeline, publica exactamente el commit aprobado y `/api/salud` responde con ese commit desde la URL pública. Commit: `ci: completar despliegue automático`.
- [x] **2.5 Preparar pruebas de producción.** `playwright.prod.config.ts` recibe la URL pública mediante variable de entorno y reutiliza las pruebas relevantes contra ella, con tiempos de espera largos por el arranque en frío de Render. Script `test:e2e:prod`. Commit: `test: ejecutar E2E contra producción`.
- [x] **2.6 Documentar la investigación.** Iniciar `docs/investigacion.md`: fuentes consultadas sobre Playwright y Render, cómo se ejecutan las pruebas local y headless, puerto, variables, arranque en frío, limitaciones del plan gratuito y motivo para no usar Docker. Medir cuánto tarda el pipeline completo. Commit: `docs: registrar investigación técnica`.

**Criterio de salida:** un push válido produce lint, E2E y despliegue verificables, y la aplicación responde desde una URL pública. **Meta: pipeline completo en menos de 6 minutos.**

**Evidencia:** ejecución con los tres trabajos en verde y aplicación pública. Tag: `fase-2`.

### Fase 3 — Diseño funcional, visual y de API

- [x] **3.1 Crear el boceto.** Pantallas Inicio, Partida, Temporada y Resultado. En Partida, la cancha domina la pantalla, acompañada de marcador, turno, controles, tiros de poder y mensajes. En Temporada, el calendario y la tabla de posiciones. Commit: `docs: crear boceto de pantallas`.
- [x] **3.2 Definir la identidad visual.** Paleta, tipografía y estilo, apoyados en los recursos que ya existen: tapitas de los diez equipos, pelota, perro, arcos, charcos, seis estadios, siete emotes y las dos pantallas de presentación. Registrar su autoría propia y el criterio de no reproducir los escudos oficiales. Commit: `docs: definir identidad visual`.
- [x] **3.3 Definir el contrato compartido.** Tipos en `compartido/` para partida, equipo, tapita, pelota, turno, marcador, tiro, recorrido, evento, emote, error, resultado, jornada y tabla de posiciones. Sin lógica de negocio en `compartido/`. Commit: `feat: definir contrato TypeScript de la API`.
- [x] **3.4 Diseñar la API.** `docs/api.md` con método, ruta, entrada, salida, códigos de error y ejemplos JSON. Commit: `docs: diseñar API REST`.

  | Método | Ruta | Responsabilidad |
  |---|---|---|
  | GET | `/api/salud` | Estado y versión del servidor. |
  | GET | `/api/equipos` | Equipos disponibles. |
  | GET | `/api/estadios` | Estadios disponibles. |
  | POST | `/api/partidas` | Crear un partido individual (Eliminatoria o Liga suelta). |
  | GET | `/api/partidas/:id` | Estado actual del partido. |
  | POST | `/api/partidas/:id/tiros` | Validar y ejecutar un tiro. |
  | POST | `/api/partidas/:id/turno-rival` | Turno del servidor (modo 1 jugador). |
  | POST | `/api/partidas/:id/emotes` | Lanzar una carita sobre las cinco tapitas del jugador; valida el enfriamiento de 15 segundos. |
  | POST | `/api/temporadas` | Crear una temporada: equipos participantes, equipo(s) humano(s), duración y perro por defecto. Genera el calendario. |
  | GET | `/api/temporadas/:id` | Calendario, tabla de posiciones y próximo partido pendiente de cada jugador. |
  | POST | `/api/temporadas/:id/jornadas/:jornadaId/jugar` | Si el partido involucra a una persona, crea el partido individual correspondiente; si no, lo resuelve por simulación rápida y actualiza la tabla. |

- [x] **3.5 Registrar decisiones y riesgos.** `docs/decisiones.md` con las decisiones técnicas, alternativas descartadas, riesgos y mitigaciones: física, sincronización de animaciones, almacenamiento en memoria, simulación rápida de partidos sin humanos, recursos visuales, despliegue y tiempo de CI. Commit: `docs: registrar decisiones y riesgos`.

**Criterio de salida:** pantallas, estados, endpoints y responsabilidades de React y Express definidos antes de implementar el juego.

**Evidencia:** boceto e identidad visual inicial. Tag: `fase-3`.

### Fase 4 — Dominio y física en Express

Esta fase es el mayor riesgo técnico del proyecto. Se construye y se prueba antes que cualquier otra parte del juego.

- [ ] **4.1 Crear utilidades matemáticas.** Funciones puras para vectores y un generador aleatorio con semilla (por ejemplo, mulberry32). Commit: `feat: agregar vectores y azar reproducible`.
- [ ] **4.2 Centralizar la configuración.** Dimensiones de cancha, radios de tapita y pelota (5 tapitas por equipo), fricción, rebote, fuerza máxima, límite de simulación y umbral de detención. Sin números mágicos dentro de la física. Commit: `feat: configurar física del juego`.
- [ ] **4.3 Simular movimiento y rebotes.** Movimiento con fricción, rebote en los límites de la cancha (excepto en la boca del arco) y detención con pasos fijos, con subpasos para evitar que los objetos se atraviesen. Todavía sin choques múltiples ni efectos especiales. Commit: `feat: simular movimiento y rebotes`.
- [ ] **4.4 Añadir colisiones.** Choques entre tapitas y pelota, con suficientes subpasos para que nada se atraviese. Limitar la cantidad de cuadros del recorrido que se envían a React. Commit: `feat: resolver colisiones del juego`.
- [ ] **4.5 Detectar goles.** Gol únicamente cuando la pelota cruza completamente la línea dentro del arco; las tapitas rebotan en esa línea y nunca cuentan como gol. Commit: `feat: detectar goles correctamente`.
- [ ] **4.6 Crear pruebas unitarias.** Con `node:test` (incluido en Node, sin dependencias nuevas). Casos: rebote en una pared, un choque transfiere velocidad, todo termina deteniéndose, un tiro directo es gol, y el mismo tiro con la misma semilla da siempre el mismo resultado. Script `test:unit`. Commit: `test: comprobar física y goles`.

**Punto de control:** si la simulación no es estable (objetos que se atraviesan o nunca se detienen), reducir velocidad máxima y aumentar subpasos antes de continuar. No se agregan estadios, perro, tiro de poder ni rival hasta estabilizar esta fase.

**Criterio de salida:** el servidor calcula recorridos reproducibles y las pruebas cubren los casos esenciales.

**Evidencia:** pruebas unitarias en verde. Tag: `fase-4`.

### Fase 5 — Reglas y API del partido individual

Esta fase construye el partido completo para Eliminatoria y para un partido suelto de Liga. La temporada completa (Fase 7) se apoya en este motor sin modificarlo.

- [ ] **5.1 Guardar partidas en memoria.** `RepositorioPartidas` y `RepositorioEnMemoria` con operaciones pequeñas y comprobables. Commit: `feat: guardar partidas en memoria`.
- [ ] **5.2 Crear y consultar partidos.** Servicio y rutas `POST /api/partidas` y `GET /api/partidas/:id`. El servidor define la formación de 5 tapitas por equipo, el primer turno y valida que los equipos no se repitan. Commit: `feat: crear y consultar partidos`.
- [ ] **5.3 Validar acciones.** Cada acción inválida de `docs/reglas.md`: partido inexistente o terminado, turno incorrecto, tapita rival, fuerza o dirección fuera de rango, turno vencido, tiros de poder agotados y equipos repetidos. Errores siempre en JSON. Commit: `feat: validar acciones del partido`.
- [ ] **5.4 Ejecutar tiros.** `POST /api/partidas/:id/tiros`: validar, simular, registrar gol, reiniciar formación si corresponde, cambiar turno y devolver recorrido más estado final. Commit: `feat: ejecutar tiros desde la API`.
- [ ] **5.5 Implementar Eliminatoria.** Meta de goles configurable (1 a 5, por defecto 3), sin empate, partido único. Commit: `feat: modo Eliminatoria`.
- [ ] **5.6 Implementar Liga como partido suelto.** Reloj de 90 minutos de juego con duración real configurable, límite de 15 segundos por turno, empate posible. El servidor es la fuente de verdad del reloj. Commit: `feat: modo Liga con reloj acelerado`.
- [ ] **5.7 Implementar el perro.** Evento tras cada tiro con probabilidad configurable (activable o no); mueve la pelota, nunca genera gol, y el turno pasa al equipo cuyo arco quede más cerca de la nueva posición de la pelota. Commit: `feat: el perro entra a la cancha`.
- [ ] **5.8 Centralizar errores.** Rutas delgadas; un único manejador convierte errores del dominio en `{ "error": "mensaje" }` con su código HTTP. Commit: `refactor: centralizar errores de la API`.
- [ ] **5.9 Verificar el contrato.** Probar cada endpoint con `curl` o la pestaña Network; reemplazar los ejemplos teóricos de `docs/api.md` por solicitudes y respuestas reales. Commit: `docs: documentar ejemplos reales de la API`.

**Criterio de salida:** un partido completo, en cualquiera de los dos modos, se administra exclusivamente mediante solicitudes JSON.

**Evidencia:** creación de partido, tiro válido, tiro inválido y aparición del perro, observados en Network o con `curl`. Tag: `fase-5`.

### Fase 6 — Frontend jugable

- [ ] **6.1 Crear navegación interna.** `App` controla Portada, Menú, Configuración, Partida, Resultado y Temporada mediante estado de React, sin React Router. Commit: `feat: navegar entre pantallas del juego`.
- [ ] **6.2 Implementar Portada, Menú y Configuración.** Portada con el botón de iniciar sobre la imagen de presentación; menú con las tarjetas de Eliminatoria, Liga e instrucciones; pantalla de configuración para elegir 1 o 2 jugadores, dificultad, equipos, estadio, perro activado o no y, en Eliminatoria, la meta de goles. Los equipos y estadios se piden al servidor, no se escriben en el cliente. Commit: `feat: crear pantallas de inicio y configuración`.
- [ ] **6.3 Crear `usePartida`.** Centraliza estado remoto, carga, errores y llamadas `fetch`. Los componentes visuales no llaman a la API directamente. Commit: `feat: coordinar partida con usePartida`.
- [ ] **6.4 Dibujar la cancha en SVG.** Cancha, arcos, 5 tapitas por equipo y pelota, ocupando la mayor parte de la pantalla. Nombres accesibles o `data-testid` estables. Orden de capas, de atrás hacia adelante: fondo del estadio, charcos, pelota y tapitas, caritas de emote sobre cada tapita, y los arcos **por encima de todo**, para que la pelota se vea entrando al arco. El arco es un solo archivo: para el lado contrario se voltea en espejo horizontal, no se rota. Commit: `feat: dibujar cancha interactiva`.
- [ ] **6.5 Implementar apuntado.** Arrastrar desde una tapita propia para elegir dirección y fuerza, con una guía visual; cancelar correctamente un gesto inválido. Commit: `feat: apuntar y ejecutar tiros`.
- [ ] **6.6 Reproducir recorridos.** `useAnimacion` con `requestAnimationFrame`. Bloquear nuevos tiros durante la reproducción; al final, aplicar el estado confirmado por Express. Commit: `feat: animar recorridos del servidor`.
- [ ] **6.7 Mostrar información completa.** Marcador, turno con cuenta regresiva, minuto o goles rumbo a la meta, tiros de poder, errores y eventos (incluido el perro), siempre visibles sin abrir la consola. Commit: `feat: mostrar estado y retroalimentación`.
- [ ] **6.8 Crear Resultado.** Ganador, empate o derrota, marcador final, revancha o volver al inicio. Commit: `feat: crear pantalla de resultado`.

**Punto de control:** un partido completo de Eliminatoria y uno de Liga suelta se pueden jugar de principio a fin en la URL pública, con 1 o 2 jugadores.

**Evidencia:** inicio, partido en curso y resultado en producción. Tag: `fase-6`.

### Fase 7 — Temporada de Liga (ampliación condicionada)

Esta fase solo se inicia si el núcleo (fases 0 a 6) está completo, publicado y probado. Reutiliza el motor de partido de la Fase 5; no lo modifica.

- [ ] **7.1 Calendario todos-contra-todos.** Función pura que, dada una lista de equipos, genera un calendario de una vuelta (por ejemplo, con el método del círculo). Con los 10 equipos de `docs/reglas.md`, cada jugador tiene 9 partidos en su calendario. Commit: `feat: generar calendario de la temporada`.
- [ ] **7.2 Guardar y consultar temporadas.** `RepositorioTemporadas`, `POST /api/temporadas` y `GET /api/temporadas/:id` con calendario y tabla de posiciones inicial (todos en cero). Commit: `feat: crear y consultar temporadas`.
- [ ] **7.3 Jugar un partido de la jornada.** `POST /api/temporadas/:id/jornadas/:jornadaId/jugar`: si el partido involucra a una persona, crea el partido individual (reutilizando la Fase 5) y lo enlaza a esa jornada; si no involucra a ninguna, resuelve un resultado con la semilla de la temporada, sin física completa. Commit: `feat: jugar y simular jornadas`.
- [ ] **7.4 Cerrar un partido y actualizar la tabla.** Cuando un partido individual de una jornada termina, su resultado se refleja en la tabla de posiciones (puntos 3-1-0, diferencia de goles). Commit: `feat: actualizar tabla de posiciones`.
- [ ] **7.5 Control del rival por el segundo jugador.** Antes de un partido que no es el cruce directo entre ambos jugadores, el segundo jugador puede elegir si controla al equipo rival o lo deja en manos del servidor. Commit: `feat: controlar al equipo rival como segundo jugador`.
- [ ] **7.6 Pantalla de Temporada.** Calendario, próximo partido pendiente y tabla de posiciones, visibles sin abrir la consola. Commit: `feat: pantalla de temporada`.

**Punto de control:** si esta fase no avanza con fluidez, se detiene aquí. Liga sigue existiendo como partido suelto (Fase 5/6) y eso ya cumple el núcleo obligatorio; la temporada completa queda documentada en `docs/decisiones.md` como una mejora no terminada, lo cual es preferible a comprometer las fases 8 y 9.

**Evidencia:** tabla de posiciones actualizada tras jugar y simular varias jornadas. Tag: `fase-7`.

### Fase 8 — Variabilidad, dificultad y personalización

- [ ] **8.1 Estadios con efecto propio.** Añadir, sobre el estadio de referencia de Cochabamba (sin efecto especial), los demás estadios de `docs/reglas.md`, empezando por uno solo y agregando los demás si el tiempo lo permite. Commit: `feat: estadios con efectos propios`.
- [ ] **8.2 Rival aleatorio.** Estrategia sencilla del servidor para el modo 1 jugador y el endpoint de turno rival. Commit: `feat: rival controlado por el servidor`.
- [ ] **8.3 Rival por muestreo y dificultades.** Candidatos dirigidos hacia la pelota, función de puntuación, error de puntería y tres dificultades (fácil, medio, difícil) como configuración. Commit: `feat: rival por muestreo con tres dificultades`.
- [ ] **8.4 Tiro de poder.** Dos por jugador y por partido, con 50% más de fuerza máxima; libera un charco de una sola vez sin importar los golpes que le falten. Commit: `feat: tiro de poder`.
- [ ] **8.5 Integrar los recursos visuales.** Las imágenes ya existen: los originales están en `assets/` y las versiones web en `client/src/recursos/` (equipos, estadios, juego, emotes y pantallas). Falta conectarlas a las pantallas y documentar en `docs/decisiones.md` las herramientas usadas, la autoría propia y el criterio de no reproducir escudos oficiales. Commit: `feat: integrar recursos visuales`.
- [ ] **8.6 Emotes.** `POST /api/partidas/:id/emotes`: el servidor valida el enfriamiento de 15 segundos y registra la carita elegida; React la dibuja sobre las cinco tapitas del jugador durante 5 segundos y luego la retira. Botón deshabilitado con el tiempo restante mientras dura el enfriamiento. Commit: `feat: emotes sobre las tapitas`.

**Criterio de salida:** cada partido presenta alguna diferencia visible y estratégica, y el juego tiene una identidad reconocible sin comprometer el núcleo.

**Evidencia:** variaciones de partido y las tres dificultades del rival. Tag: `fase-8`.

### Fase 9 — Pruebas E2E y robustez

- [ ] **9.1 Estabilizar localizadores.** Roles accesibles y `data-testid` donde no exista un selector semántico estable. Commit: `test: estabilizar localizadores E2E`.
- [ ] **9.2 Cubrir el inicio.** Verificar que equipos y estadios provienen del servidor y que se puede crear un partido en cada modo. Commit: `test: comprobar inicio de partido`.
- [ ] **9.3 Cubrir la interacción principal.** Apuntar, tirar y comprobar que cambian posiciones o turno tras una respuesta real de la API. Commit: `test: comprobar tiro e integración HTTP`.
- [ ] **9.4 Cubrir una validación.** Forzar una acción inválida (por ejemplo, equipos repetidos) y comprobar que la interfaz muestra el mensaje devuelto por Express. Commit: `test: comprobar acción inválida`.
- [ ] **9.5 Cubrir la finalización.** Partido determinista y corto (Eliminatoria con `golesParaGanar: 1`) que termina en la pantalla de resultado. Commit: `test: comprobar finalización de partido`.
- [ ] **9.6 Preparar la prueba de defensa.** Prueba corta (menos de 30 segundos) contra la URL pública que demuestre inicio, comunicación real y una interacción relevante en Chrome visual. Commit: `test: preparar recorrido E2E de defensa`.
- [ ] **9.7 Comprobar CI y producción, y medir tiempos.** Ejecutar las mismas capacidades en modo headless en GitHub Actions y contra la versión publicada. Volver a medir la duración total del pipeline y optimizar si pasa de 6 minutos. Commit: `test: validar E2E en CI y producción`.

**Criterio de salida:** las pruebas demuestran inicio, interacción, backend y validación o finalización, tanto localmente como en CI y producción.

**Evidencia:** Chrome visual ejecutando la prueba pública y Actions en verde. Tag: `fase-9`.

### Fase 10 — Documentación final y video

- [ ] **10.1 Revisar experiencia de usuario.** Estados de carga, doble clic, gestos cancelados, partido inexistente, contraste y foco visible. Commit: `fix: mejorar robustez y experiencia de juego`.
- [ ] **10.2 Completar el README.** Requisitos, instalación, comandos, arquitectura, endpoints JSON, variables de entorno, pruebas, despliegue y URL pública. Commit: `docs: completar README`.
- [ ] **10.3 Completar la documentación.** Revisar `introduccion.md`, `reglas.md`, `plan.md`, `api.md`, `boceto.md`, `decisiones.md` (riesgos con su mitigación y cambios importantes con su justificación), `investigacion.md` y `uso-ia.md`. Commit: `docs: completar documentación técnica`.
- [ ] **10.4 Reunir evidencias.** Capturas útiles en `docs/evidencias/`, sin secretos ni datos irrelevantes. Commit: `docs: agregar evidencias finales`.
- [ ] **10.5 Grabar el video.** Entre 3 y 5 minutos: una partida, una solicitud JSON, una prueba E2E visual, GitHub Actions y la aplicación publicada.
- [ ] **10.6 Auditoría final.** Comparar el proyecto con la lista de verificación de la sección 10 de este documento y revisar que no haya ninguna librería prohibida instalada.

**Criterio de salida:** repositorio, documentación, video, CI y aplicación pública corresponden a la misma versión estable.

**Evidencia:** todo lo anterior reunido. Tag: `fase-10`.

### Fase 11 — Preparación de la defensa

- [ ] **11.1 Preparar el recorrido de defensa.** Abrir previamente editor, terminal, repositorio, Actions, Render y la aplicación pública.
- [ ] **11.2 Ensayar con cronómetro, al menos dos veces.** E2E visual contra producción, un cambio pequeño, verificarlo, activar CI/CD y mostrarlo publicado dentro de los 10 minutos.
- [ ] **11.3 Preparar cambios configurables.** Saber modificar sin buscar por todo el proyecto: meta de goles, duración real de la Liga, probabilidad del perro, fricción de un estadio, un texto o un color. Cada valor debe estar centralizado.
- [ ] **11.4 Preparar la explicación técnica.** Poder explicar un tiro completo: interacción en React, `fetch`, ruta Express, servicio, validación, física, JSON de respuesta, animación y renderizado; y, si se llegó a la Fase 7, cómo un resultado de partido se refleja en la tabla de la temporada.
- [ ] **11.5 Preparar fallos controlados.** Saber demostrar que lint falla, cómo se ve una acción inválida y cómo se diagnostica una prueba E2E.
- [ ] **11.6 Confirmar el procedimiento de la defensa.** Aclarar con el docente cómo se realiza el cambio obligatorio de la defensa sin contradecir el cierre del repositorio del 15 de septiembre.
- [ ] **11.7 Congelar el repositorio.** Último commit antes de las 16:00 del martes. Tag `v1.0`.
- [ ] **11.8 Preparar el equipo.** Batería, cargador, sesiones iniciadas, credenciales disponibles, Chrome instalado, dependencias listas y conexión de respaldo. Despertar el servicio de Render unos minutos antes de la defensa.

**Criterio de salida:** el recorrido completo se ejecuta de forma repetible y existe margen para explicar decisiones.

## 8. Orden de reducción de alcance

Si aparece un bloqueo, se recorta en este orden:

1. temporada de Liga completa (queda Liga como partido suelto, que ya cumple el núcleo);
2. dificultad avanzada del rival por muestreo (queda la aleatoria);
3. estadios con efectos físicos (queda el estadio de referencia de Cochabamba);
4. emotes (son expresión, no cambian el resultado de ninguna jugada);
5. tiro de poder;
6. control del equipo rival por el segundo jugador (queda solo contra el servidor);
7. mejoras visuales y sonoras decorativas.

Nunca se recorta:

- modo Eliminatoria y modo Liga como partido suelto, para 1 y 2 jugadores;
- 5 tapitas por equipo, movimiento, choques, goles y turnos;
- decisiones de dirección, fuerza y selección de tapita;
- estado no trivial, finalización y empate en Liga;
- el perro, como fuente de variabilidad mínima;
- acción inválida visible, incluida la restricción de equipos repetidos;
- las imágenes propias de `assets/`, que la rúbrica pide explícitamente;
- responsabilidades reales de Express;
- `fetch`, JSON, GET, POST y mismo dominio y puerto;
- lint de frontend y backend;
- pruebas E2E, CI/CD, despliegue y documentación.

## 9. Guion de evolución para la presentación

| Diapositiva | Mensaje principal | Evidencia sugerida |
|---|---|---|
| 1. Tupay | Qué es y qué experiencia propone. | Nombre, identidad y captura final. |
| 2. Evolución de la idea | Cómo las primeras ideas llevaron al fútbol con tapitas y al nombre Tupay. | Comparación breve de conceptos descartados. |
| 3. Planificación | Cómo se convirtió la idea en reglas, alcance y riesgos, incluida la decisión de acotar la Liga. | Fragmentos de `docs/` y este plan por fases. |
| 4. Diseño | Cómo se definieron pantallas, interacción e identidad boliviana. | Boceto frente a interfaz final. |
| 5. Arquitectura | Qué hace React, qué hace Express y cómo se comunican. | Diagrama simple y ejemplo JSON. |
| 6. Desarrollo | Cómo se construyeron física, reglas y partido jugable. | Evolución mediante tags o commits. |
| 7. Liga y temporada | Cómo el mismo motor de partido se convierte en una temporada con tabla. | Calendario y tabla de posiciones. |
| 8. Pruebas | Cómo se comprobaron inicio, tiro, backend, errores y finalización. | Playwright visual y Actions. |
| 9. Publicación | Cómo el mismo proyecto llegó a una URL pública. | Pipeline y aplicación publicada. |
| 10. Resultado y aprendizaje | Qué cambió, qué se recortó y qué se aprendió. | Comparación idea inicial contra resultado. |

Cada diapositiva responde tres preguntas: **qué decisión se tomó, por qué se tomó y cómo se verificó**.

## 10. Lista de verificación contra la rúbrica

| Requisito | Evidencia prevista |
|---|---|
| Juego original | Concepto, evolución y reglas documentadas. |
| Al menos dos jugadores | 1 jugador contra el servidor o 2 en el mismo dispositivo. |
| Uso significativo de pantalla | Cancha dominante, marcador, controles y mensajes. |
| Movimiento | Tapitas, pelota y el perro, animados. |
| Interacción entre jugadores | Choques, bloqueos, turnos y competencia por goles. |
| Estado no trivial | Posiciones, marcador, turno, tiros de poder, resultado y, en Liga, tabla de posiciones. |
| Reglas y finalización | Acciones válidas e inválidas, victoria, empate (Liga) y fin de temporada. |
| Decisión estratégica | Elección de tapita, dirección, fuerza y tiro de poder. |
| Variabilidad | El perro y, si se llega, estadios y dificultades del rival. |
| Retroalimentación visual | Turno, marcador, errores, eventos y resultado visibles, con las imágenes propias de `assets/` (tapitas, estadios, pelota y pantallas). |
| React y TypeScript | Componentes, hooks, estado, eventos y renderizado. |
| Express y TypeScript | Creación, validación, simulación y, si se llega, orquestación de temporada. |
| HTTP REST | `fetch`, JSON, GET y POST reales. |
| Mismo dominio y puerto | Cliente compilado servido por Express. |
| Sin librerías prohibidas | Dependencias auditadas y CSS propio. |
| Tres trabajos de Actions | Lint, E2E headless y deployment verificables. |
| Pruebas E2E | Inicio, interacción, backend y validación o finalización. |
| Publicación | Frontend y backend completos bajo una URL. |
| Repositorio y documentación | README, `docs/`, historial, evidencias y uso de IA. |
| Defensa | Explicación, E2E visual y cambio publicado dentro del tiempo. |

## 11. Riesgos prioritarios

| Riesgo | Señal temprana | Mitigación |
|---|---|---|
| Física inestable | Objetos se atraviesan o nunca se detienen. | Pasos fijos, subpasos, límites de iteración; reducir velocidad máxima si es necesario. |
| La Liga completa consume todo el tiempo | Avanza el trabajo y todavía no hay un partido de Liga suelto jugable. | Detenerse en la Fase 7 según su punto de control; Liga como partido suelto ya cumple el núcleo. |
| Animación distinta del servidor | React termina en otra posición que el servidor. | Animar solo los cuadros devueltos y aplicar el estado final del servidor. |
| Pruebas frágiles | E2E falla de forma intermitente. | Semilla fija, localizadores estables y espera de respuestas reales, no de tiempos arbitrarios. |
| Despliegue lento o fallido | El commit publicado no coincide con el esperado. | Despliegue temprano (Fase 2), endpoint de versión y medición continua. |
| Pérdida de partidas o temporadas | Reinicio del servicio borra la memoria. | Aceptarlo y documentarlo; mostrar un mensaje claro y permitir crear otro partido. |
| Exceso de alcance | Se empieza una ampliación con el núcleo todavía incompleto. | Aplicar estrictamente el orden de reducción de la sección 8. |
| Código difícil de defender | No se puede explicar una función o modificar una regla en el momento. | Tareas pequeñas, revisión personal y valores de configuración centralizados. |
| Identidad de los clubes | Uso de escudos oficiales sin autorización. | Escudos ilustrados propios, no oficiales; registrar el criterio en `docs/decisiones.md`. |
| Contradicción del cierre | El cambio de la defensa exige actualizar el repositorio ya congelado. | Solicitar una instrucción escrita del docente antes de la entrega (tarea 11.6). |

## 12. Condición final de éxito

Tupay está listo cuando una persona puede abrir la URL pública, comprender las instrucciones, completar un partido de Eliminatoria o de Liga con 1 o 2 jugadores, observar al perro entrar a la cancha, provocar una acción inválida y llegar a un resultado; mientras tanto, las pruebas y GitHub Actions demuestran que React, Express, la API y el despliegue funcionan como una sola aplicación. La temporada completa de Liga es un logro adicional, no una condición para que el proyecto esté completo.
