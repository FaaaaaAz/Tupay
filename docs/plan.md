# Plan de desarrollo — TUPAY

## 1. Propósito del plan

Este documento organiza el desarrollo de **TUPAY**, videojuego web de fútbol con tapitas inspirado en el fútbol boliviano y desarrollado como proyecto final de Certificación.

El proyecto debe mostrar una evolución comprensible desde la idea inicial hasta la aplicación publicada. Cada fase produce código verificable, documentación, evidencia y commits claros que después podrán utilizarse en una presentación breve.

El objetivo no es acumular funcionalidades. La prioridad es construir una partida completa, estable, explicable y alineada con la rúbrica:

1. dos jugadores como mínimo;
2. interacción significativa y elementos en movimiento;
3. estado, reglas, estrategia, variabilidad y finalización;
4. React y Express comunicados realmente mediante `fetch` y JSON;
5. pruebas E2E, integración continua y despliegue;
6. documentación suficiente para explicar y modificar el proyecto durante la defensa.

## 2. Alcance del producto

### Núcleo obligatorio

La primera versión completa de TUPAY debe incluir:

- partida local para dos jugadores en el mismo dispositivo;
- cancha que utilice la mayor parte de la pantalla;
- tapitas, pelota, arcos y colisiones;
- elección de tapita, dirección y fuerza del tiro;
- turnos y validación de acciones inválidas;
- marcador, mensajes visibles y estado de la partida;
- victoria, empate y pantalla de resultado;
- al menos una fuente de variabilidad controlada por el servidor;
- creación, consulta y actualización de partidas mediante una API REST;
- frontend y backend publicados bajo una sola dirección;
- pruebas E2E locales, en CI y contra producción.

### Ampliaciones condicionadas

Estas funciones se desarrollan únicamente cuando el núcleo obligatorio está completo, publicado y probado:

1. evento del perro en la cancha;
2. tiro de altura;
3. estadios con efectos propios;
4. rival controlado por el servidor con lógica aleatoria;
5. rival controlado por el servidor con distintas dificultades;
6. avisos de clásicos y presentación especial de equipos;
7. mejoras visuales, sonoras y de animación.

No se inicia una ampliación si existen fallos en la partida de dos jugadores, la API, las pruebas E2E o el despliegue.

## 3. Forma de trabajo con el agente de IA

1. Solicitar una sola tarea por su código, por ejemplo: `Implementa la tarea 4.3 de docs/plan.md`.
2. Pedir al agente que inspeccione el estado actual antes de modificar archivos.
3. Indicar expresamente que no debe hacer `commit`, `push`, crear tags ni cambiar servicios externos.
4. Revisar el cambio y pedir una explicación de cualquier parte que no se comprenda.
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
8. Realizar el commit manualmente con el mensaje sugerido.
9. Marcar la tarea terminada solo cuando su criterio de aceptación se cumpla.

### Regla de finalización de una tarea

Una tarea está terminada cuando:

- el comportamiento funciona;
- no rompe funcionalidades anteriores;
- lint, TypeScript y las pruebas aplicables pasan;
- el código se puede explicar y modificar;
- la documentación afectada está actualizada;
- existe evidencia cuando la tarea la requiere.

### Convención de commits

- `feat:` nueva funcionalidad;
- `fix:` corrección de un defecto;
- `docs:` documentación;
- `test:` pruebas;
- `ci:` integración continua o despliegue;
- `refactor:` reorganización sin cambiar el comportamiento;
- `chore:` configuración y mantenimiento.

Los commits deben representar avances pequeños y comprensibles. No se deben agrupar varias tareas grandes en un solo commit.

## 4. Estrategia de versiones y evidencias

Al terminar cada fase:

1. ejecutar todas las verificaciones aplicables;
2. actualizar `docs/uso-ia.md` y `docs/decisiones.md`;
3. guardar una captura representativa en `docs/evidencias/`;
4. crear el tag `fase-N` únicamente después de verificar el resultado;
5. comprobar que la versión publicada corresponde al commit esperado.

Las evidencias deben tener nombres descriptivos, por ejemplo:

- `fase-1-servidor-y-cliente.png`;
- `fase-2-actions-en-verde.png`;
- `fase-5-partida-en-produccion.png`;
- `fase-7-e2e-produccion.png`.

## 5. Arquitectura objetivo

```text
tupay/
├── AGENTS.md
├── README.md
├── package.json
├── compartido/
│   └── tipos de entrada y salida de la API
├── client/
│   └── src/
│       ├── api/             llamadas a Express con fetch
│       ├── componentes/     elementos visuales reutilizables
│       ├── hooks/           estado y coordinación de la interfaz
│       ├── pantallas/       Inicio, Partida y Resultado
│       ├── recursos/        imágenes y sonidos con licencia documentada
│       └── estilos/         CSS propio
├── server/
│   └── src/
│       ├── rutas/           adaptación HTTP y respuestas JSON
│       ├── servicios/       casos de uso de la partida
│       ├── dominio/
│       │   ├── fisica/      tiros, movimiento, choques y rebotes
│       │   ├── reglas/      turnos, goles, validaciones y finalización
│       │   ├── variabilidad/
│       │   └── rival/       ampliación opcional
│       ├── repositorios/    almacenamiento de partidas en memoria
│       ├── utilidades/      vectores y azar con semilla
│       ├── app.ts
│       └── index.ts
├── e2e/
├── docs/
│   ├── introduccion.md
│   ├── reglas.md
│   ├── api.md
│   ├── boceto.md
│   ├── decisiones.md
│   ├── investigacion.md
│   ├── uso-ia.md
│   └── evidencias/
└── .github/
    └── workflows/
```

Las dependencias del backend avanzan en un solo sentido:

```text
rutas -> servicios -> dominio
```

El dominio no debe depender de Express. React representa y anima el resultado; Express conserva la partida, valida las acciones y calcula sus consecuencias.

## 6. Decisiones de arquitectura

| Decisión | Justificación |
| --- | --- |
| SVG para la cancha | Permite elementos visibles en el DOM, CSS propio, interacción por puntero y localizadores claros para Playwright. |
| Física en el servidor | Hace que Express participe en una decisión significativa y evita que la lógica crítica exista solo en el navegador. |
| Animación en React | React reproduce el recorrido calculado por el servidor sin decidir el resultado del tiro. |
| Azar con semilla | Hace reproducibles los eventos variables y las pruebas. |
| Repositorio en memoria | Es suficiente para el alcance del examen y evita introducir una base de datos innecesaria. |
| API con JSON y `fetch` | Cumple el contrato técnico sin Axios ni librerías de estado o comunicación. |
| Navegación con estado de React | Evita React Router y mantiene únicamente tres pantallas simples. |
| CSS propio | Cumple la restricción de no utilizar frameworks o bibliotecas de componentes. |

### Uso moderado de SOLID

- Las rutas manejan HTTP, los servicios coordinan casos de uso y el dominio aplica reglas.
- Los componentes dibujan; los hooks coordinan estado, animación y solicitudes.
- La estrategia de variabilidad y el rival pueden reemplazarse mediante contratos pequeños cuando exista más de una implementación real.
- El servicio recibe su repositorio y generador aleatorio para facilitar las pruebas.
- No se crea una interfaz o abstracción sin una necesidad concreta.

---

## 7. Fases de desarrollo

### Fase 0 — Definición y planificación

- [ ] **0.1 Preparar el repositorio local.** Clonar `https://github.com/FaaaaaAz/Tupay.git` dentro de la carpeta destinada al proyecto. Crear `.gitignore` para `node_modules`, `dist`, `playwright-report`, `test-results`, archivos de entorno y artefactos temporales. Crear un README mínimo. Commit sugerido: `chore: preparar repositorio de TUPAY`.
- [ ] **0.2 Documentar el origen de la idea.** Crear `docs/introduccion.md` con el nombre TUPAY, el significado elegido y su fuente, el propósito, la experiencia de juego y la evolución de las ideas anteriores hasta llegar al fútbol con tapitas. Commit sugerido: `docs: explicar origen y propósito de TUPAY`.
- [ ] **0.3 Cerrar las reglas del núcleo.** Crear `docs/reglas.md` con preparación, turnos, selección de tapita, dirección, fuerza, acciones válidas e inválidas, goles, victoria, empate y finalización. Las reglas deben poder explicarse sin consultar el código. Commit sugerido: `docs: definir reglas del juego`.
- [ ] **0.4 Registrar planificación y uso de IA.** Añadir `docs/plan.md`, `AGENTS.md` y `docs/uso-ia.md`. La tabla de IA debe incluir tarea, solicitud, respuesta utilizada, modificaciones propias y verificación. Commit sugerido: `docs: agregar plan y reglas de trabajo con IA`.
- [ ] **0.5 Definir la estrategia de equipos y recursos.** Decidir si se utilizarán nombres y emblemas originales o recursos oficiales; registrar autor, fuente y licencia de cualquier recurso externo. Commit sugerido: `docs: definir estrategia de recursos visuales`.

**Criterio de salida:** otra persona puede comprender qué es TUPAY, cómo se juega, por qué es original y qué se construirá.

**Evidencia:** carpeta `docs/` visible en GitHub.

### Fase 1 — Esqueleto técnico

- [ ] **1.1 Configurar el proyecto.** Crear un `package.json` raíz con módulos ES, scripts unificados y versión de Node declarada. Preparar `client/`, `server/` y `compartido/` con TypeScript estricto. Usar solo React, Express, TypeScript, Vite, ESLint, Playwright y herramientas mínimas de ejecución y construcción. Commit sugerido: `chore: configurar React Express y TypeScript`.
- [ ] **1.2 Crear el servidor mínimo.** `server/src/app.ts` arma Express y `server/src/index.ts` escucha `process.env.PORT`. Añadir `GET /api/salud` con estado y versión; las rutas de API inexistentes responden 404 en JSON. Commit sugerido: `feat: crear servidor Express y ruta de salud`.
- [ ] **1.3 Crear el cliente mínimo.** React consulta `/api/salud` mediante `fetch` y muestra el estado del servidor. Commit sugerido: `feat: conectar cliente React con Express`.
- [ ] **1.4 Unificar dominio y puerto.** Vite genera el cliente compilado y Express lo sirve. En desarrollo, Vite redirige `/api` al servidor. `npm run build && npm start` debe abrir la aplicación completa desde una sola dirección. Commit sugerido: `feat: servir cliente compilado desde Express`.
- [ ] **1.5 Configurar calidad estática.** ESLint debe cubrir cliente y servidor. Añadir `lint`, `lint:client`, `lint:server` y `typecheck`. Comprobar deliberadamente que una infracción hace fallar el comando y después retirarla. Commit sugerido: `chore: configurar lint y typecheck`.

**Criterio de salida:** el cliente obtiene información real de Express, toda la aplicación compila y lint cubre ambos lados.

**Evidencia:** aplicación abierta desde Express y respuesta JSON de `/api/salud`.

### Fase 2 — Integración continua y despliegue temprano

- [ ] **2.1 Configurar Playwright.** Preparar ejecución headless para CI y ejecución visual con Google Chrome para la defensa. Crear una prueba inicial que cargue la página y confirme la respuesta del servidor. Scripts: `test:e2e` y `test:e2e:visual`. Commit sugerido: `test: configurar Playwright`.
- [ ] **2.2 Crear el pipeline.** Añadir tres trabajos claramente nombrados: `Lint frontend y backend`, `Pruebas E2E headless` y `Deploy aplicación completa`. El despliegue depende de que las verificaciones anteriores terminen correctamente. Guardar el reporte E2E como artefacto. Commit sugerido: `ci: validar probar y desplegar la aplicación`.
- [ ] **2.3 Configurar el servicio público.** Crear un único servicio web para frontend y backend, configurar construcción, inicio, puerto y variables necesarias. No utilizar Docker salvo que el servicio realmente lo requiera. Guardar secretos únicamente en GitHub o en el proveedor. No escribirlos en el repositorio. 
- [ ] **2.4 Verificar el despliegue automático.** Confirmar que un cambio en `main` activa el pipeline, publica exactamente el commit aprobado y permite consultar `/api/salud` desde la URL pública. Commit sugerido: `ci: completar despliegue automático`.
- [ ] **2.5 Preparar pruebas de producción.** Crear una configuración E2E que reciba la URL pública mediante variable de entorno y reutilice pruebas relevantes. Commit sugerido: `test: ejecutar E2E contra producción`.
- [ ] **2.6 Documentar la investigación.** Iniciar `docs/investigacion.md`: fuentes consultadas, Playwright local y headless, servicio elegido, puerto, variables, despliegue, arranque en frío, limitaciones y motivo para utilizar o descartar Docker. Commit sugerido: `docs: registrar investigación técnica`.

**Criterio de salida:** un push válido produce lint, E2E y despliegue verificables, y la aplicación responde desde una URL pública.

**Evidencia:** ejecución con los tres trabajos en verde y aplicación pública.

### Fase 3 — Diseño funcional, visual y de API

- [ ] **3.1 Crear el boceto.** Documentar las pantallas Inicio, Partida y Resultado. En Partida, la cancha debe dominar la pantalla y acompañarse de marcador, turno, controles, recursos y mensajes. Commit sugerido: `docs: crear boceto de pantallas`.
- [ ] **3.2 Definir la identidad visual.** Establecer paleta, tipografía del sistema, estilo de tapitas, pelota, cancha, fondos e iconografía. Priorizar legibilidad y contraste. Crear recursos propios o registrar licencias. Commit sugerido: `docs: definir identidad visual`.
- [ ] **3.3 Definir el contrato compartido.** Crear tipos de datos para partida, jugadores, tapitas, pelota, turno, marcador, tiro, recorrido, evento, error y resultado. No incluir lógica de negocio en `compartido/`. Commit sugerido: `feat: definir contrato TypeScript de la API`.
- [ ] **3.4 Diseñar la API.** Crear `docs/api.md` con método, ruta, entrada, salida, códigos de error y ejemplos JSON para cada endpoint. Commit sugerido: `docs: diseñar API REST`.

| Método | Ruta | Responsabilidad |
| --- | --- | --- |
| GET | `/api/salud` | Informar estado y versión del servidor. |
| GET | `/api/equipos` | Entregar equipos disponibles. |
| GET | `/api/variantes` | Entregar configuraciones disponibles. |
| POST | `/api/partidas` | Crear una partida y devolver su estado inicial. |
| GET | `/api/partidas/:id` | Recuperar el estado actual. |
| POST | `/api/partidas/:id/tiros` | Validar y ejecutar un tiro. |
| POST | `/api/partidas/:id/turno-rival` | Ejecutar el turno del servidor si se implementa el modo individual. |

- [ ] **3.5 Registrar decisiones y riesgos.** Crear `docs/decisiones.md` con decisiones técnicas, alternativas descartadas, riesgos y mitigaciones. Incluir física, sincronización de animaciones, almacenamiento en memoria, recursos visuales, despliegue y tiempo de CI. Commit sugerido: `docs: registrar decisiones y riesgos`.

**Criterio de salida:** las pantallas, estados, endpoints y responsabilidades de React y Express están definidos antes de implementar el juego.

**Evidencia:** boceto e identidad visual inicial.

### Fase 4 — Dominio y física en Express

- [ ] **4.1 Crear utilidades matemáticas.** Implementar funciones puras para vectores y un generador aleatorio con semilla. Commit sugerido: `feat: agregar vectores y azar reproducible`.
- [ ] **4.2 Centralizar la configuración.** Definir dimensiones, radios, fricción, rebote, fuerza máxima, límite de simulación y umbral de detención. Evitar números mágicos. Commit sugerido: `feat: configurar física del juego`.
- [ ] **4.3 Implementar primero la física mínima.** Simular movimiento, fricción, rebote en límites y detención con pasos fijos. Todavía sin choques múltiples ni efectos especiales. Commit sugerido: `feat: simular movimiento y rebotes`.
- [ ] **4.4 Añadir colisiones.** Resolver choques entre tapitas, pelota y límites con subpasos suficientes para evitar atravesamientos. Limitar la cantidad de cuadros devueltos a React. Commit sugerido: `feat: resolver colisiones del juego`.
- [ ] **4.5 Detectar goles.** Considerar gol únicamente cuando la pelota cruza completamente la línea dentro del arco. Las tapitas no pueden convertirse en gol. Commit sugerido: `feat: detectar goles correctamente`.
- [ ] **4.6 Crear pruebas unitarias.** Usar `node:test` para comprobar rebote, transferencia de movimiento, detención, gol, ausencia de gol y resultado determinista con la misma semilla. Commit sugerido: `test: comprobar física y goles`.

**Plan de reducción del riesgo:** si la simulación no es estable, reducir la cantidad de tapitas, limitar fuerza y velocidad y aumentar subpasos. No agregar clima, perro, tiro especial o rival hasta estabilizar esta fase.

**Criterio de salida:** el servidor calcula recorridos reproducibles y las pruebas cubren los casos esenciales.

**Evidencia:** pruebas unitarias en verde y visualización temporal de un tiro calculado.

### Fase 5 — Reglas y API de la partida

- [ ] **5.1 Guardar partidas en memoria.** Crear `RepositorioPartidas` y `RepositorioEnMemoria` con operaciones pequeñas y comprobables. Commit sugerido: `feat: guardar partidas en memoria`.
- [ ] **5.2 Crear y consultar partidas.** Implementar servicio y rutas `POST /api/partidas` y `GET /api/partidas/:id`. El servidor define formación, primer turno y variabilidad inicial. Commit sugerido: `feat: crear y consultar partidas`.
- [ ] **5.3 Validar acciones.** Rechazar partida inexistente, partida terminada, turno incorrecto, tapita rival, fuerza o dirección inválida y tiro enviado mientras otro está en curso. Responder siempre con errores JSON consistentes. Commit sugerido: `feat: validar acciones de la partida`.
- [ ] **5.4 Ejecutar tiros.** Implementar `POST /api/partidas/:id/tiros`: validar, simular, registrar gol, reiniciar posiciones cuando corresponda, cambiar turno y devolver recorrido más estado final. Commit sugerido: `feat: ejecutar tiros desde la API`.
- [ ] **5.5 Implementar finalización.** Añadir modalidad por límite de goles y una condición de empate verificable. Si se incluye reloj, el servidor debe ser la fuente de verdad. Commit sugerido: `feat: finalizar partidas con victoria o empate`.
- [ ] **5.6 Centralizar errores.** Mantener rutas delgadas y convertir errores del dominio en respuestas `{ "error": { "codigo": "...", "mensaje": "..." } }`. Commit sugerido: `refactor: centralizar errores de la API`.
- [ ] **5.7 Verificar el contrato.** Probar endpoints con `curl` o la pestaña Network y reemplazar los ejemplos teóricos de `docs/api.md` por solicitudes y respuestas reales. Commit sugerido: `docs: documentar ejemplos reales de la API`.

**Criterio de salida:** una partida completa puede administrarse exclusivamente mediante solicitudes JSON.

**Evidencia:** creación de partida, tiro válido y tiro inválido observados en Network o mediante `curl`.

### Fase 6 — Frontend jugable

- [ ] **6.1 Crear navegación interna.** `App` controla Inicio, Partida y Resultado mediante estado de React, sin React Router. Commit sugerido: `feat: navegar entre pantallas del juego`.
- [ ] **6.2 Implementar Inicio.** Permitir elegir dos equipos y configurar la partida. Mostrar reglas resumidas e instrucciones de control antes de jugar. Commit sugerido: `feat: crear pantalla de inicio`.
- [ ] **6.3 Crear `usePartida`.** Centralizar estado remoto, carga, errores y llamadas `fetch`. Los componentes visuales no deben llamar a la API directamente. Commit sugerido: `feat: coordinar partida con usePartida`.
- [ ] **6.4 Dibujar la cancha en SVG.** Mostrar cancha, arcos, tapitas y pelota de manera adaptable. Añadir nombres accesibles o `data-testid` estables. Commit sugerido: `feat: dibujar cancha interactiva`.
- [ ] **6.5 Implementar apuntado.** Arrastrar desde una tapita propia para elegir dirección y fuerza. Mostrar una guía visual y cancelar correctamente gestos inválidos. Commit sugerido: `feat: apuntar y ejecutar tiros`.
- [ ] **6.6 Reproducir recorridos.** Crear `useAnimacion` con `requestAnimationFrame`. Bloquear nuevos tiros durante la reproducción y aplicar al final el estado confirmado por Express. Commit sugerido: `feat: animar recorridos del servidor`.
- [ ] **6.7 Mostrar información completa.** Marcador, turno, instrucciones, estado de carga, errores, goles y resultados deben ser visibles sin consola. Commit sugerido: `feat: mostrar estado y retroalimentación`.
- [ ] **6.8 Crear Resultado.** Mostrar ganador o empate, marcador final y acciones para revancha o regreso. Commit sugerido: `feat: crear pantalla de resultado`.
- [ ] **6.9 Adaptar a distintos tamaños.** Verificar computadora, tablet y celular en orientación apropiada. Mantener cancha, controles y textos utilizables. Commit sugerido: `feat: adaptar interfaz a diferentes pantallas`.

**Criterio de salida:** dos personas pueden completar una partida desde la URL pública sin abrir herramientas de desarrollo.

**Evidencia:** inicio, partida en curso y resultado en producción.

### Fase 7 — Variabilidad e identidad de TUPAY

Implementar esta fase de forma incremental. Cada función debe poder desactivarse mediante configuración para facilitar pruebas y defensa.

- [ ] **7.1 Añadir variabilidad mínima.** El servidor elige mediante semilla una variante de cancha o un evento sencillo que modifique una decisión de juego sin volver impredecibles las pruebas. Commit sugerido: `feat: agregar variabilidad reproducible`.
- [ ] **7.2 Implementar el perro.** Evento ocasional y limitado: el servidor calcula su recorrido y cómo afecta la pelota. Definir claramente si puede anular un gol. Commit sugerido: `feat: agregar evento del perro`.
- [ ] **7.3 Implementar tiro de altura.** Recurso limitado por jugador con efecto claro y contador visible. Commit sugerido: `feat: agregar tiro de altura`.
- [ ] **7.4 Incorporar estadios.** Empezar con diferencias visuales. Añadir un solo efecto físico por estadio únicamente si puede probarse y explicarse. Commit sugerido: `feat: diferenciar estadios`.
- [ ] **7.5 Agregar modo individual.** Crear una estrategia sencilla del servidor y el endpoint de turno rival. La dificultad avanzada por muestreo queda como mejora posterior. Commit sugerido: `feat: agregar rival controlado por el servidor`.
- [ ] **7.6 Crear recursos finales.** Integrar tapitas, emblemas, pelota, perro, texturas y sonidos optimizados. Documentar herramientas de IA, prompts relevantes, edición propia, autores y licencias. Commit sugerido: `feat: integrar recursos visuales y sonoros`.
- [ ] **7.7 Añadir presentación temática.** Incorporar mensajes de clásico u otros detalles bolivianos que no alteren la estabilidad. Commit sugerido: `feat: reforzar identidad de TUPAY`.

**Criterio de salida:** cada partida presenta alguna diferencia visible y estratégica, y el juego posee una identidad reconocible sin comprometer el núcleo.

**Evidencia:** variaciones de partida y al menos un evento especial.

### Fase 8 — Pruebas E2E y robustez

- [ ] **8.1 Estabilizar localizadores.** Usar roles accesibles y `data-testid` solo cuando no exista un selector semántico estable. Commit sugerido: `test: estabilizar localizadores E2E`.
- [ ] **8.2 Cubrir el inicio.** Verificar que equipos y variantes provienen del servidor y que se puede crear una partida. Commit sugerido: `test: comprobar inicio de partida`.
- [ ] **8.3 Cubrir la interacción principal.** Apuntar, tirar y comprobar que cambian posiciones o turno después de una respuesta real de la API. Commit sugerido: `test: comprobar tiro e integración HTTP`.
- [ ] **8.4 Cubrir una validación.** Forzar una acción inválida y comprobar que la interfaz muestra el mensaje devuelto por Express. Commit sugerido: `test: comprobar acción inválida`.
- [ ] **8.5 Cubrir la finalización.** Crear una partida determinista y corta, provocar el resultado y verificar la pantalla final. Los valores especiales de prueba solo pueden aceptarse en un entorno controlado. Commit sugerido: `test: comprobar finalización de partida`.
- [ ] **8.6 Preparar prueba de defensa.** Crear una prueba corta contra la URL pública que demuestre inicio, comunicación real y una interacción relevante en Chrome visual. Commit sugerido: `test: preparar recorrido E2E de defensa`.
- [ ] **8.7 Comprobar CI y producción.** Ejecutar las mismas capacidades en modo headless dentro de GitHub Actions y contra la versión publicada. Medir y registrar la duración total del pipeline. Commit sugerido: `test: validar E2E en CI y producción`.

**Criterio de salida:** las pruebas demuestran inicio, interacción, backend y validación o finalización, tanto localmente como en CI y producción.

**Evidencia:** Chrome visual ejecutando la prueba pública y Actions en verde.

### Fase 9 — Pulido, documentación y entrega

- [ ] **9.1 Revisar experiencia de usuario.** Corregir estados de carga, doble clic, gestos cancelados, desconexión, partida inexistente, pantalla pequeña, contraste, foco y mensajes. Commit sugerido: `fix: mejorar robustez y experiencia de juego`.
- [ ] **9.2 Completar README.** Incluir requisitos, instalación, comandos, arquitectura, endpoints JSON, variables, pruebas, despliegue y URL pública. Commit sugerido: `docs: completar README`.
- [ ] **9.3 Completar documentación.** Revisar introducción, reglas, API, boceto, decisiones, investigación, riesgos, cambios importantes y uso de IA. Commit sugerido: `docs: completar documentación técnica`.
- [ ] **9.4 Reunir evidencias.** Guardar capturas útiles y comprobar que no contienen secretos ni datos irrelevantes. Commit sugerido: `docs: agregar evidencias finales`.
- [ ] **9.5 Grabar el video.** Preparar un video de entre 3 y 5 minutos que muestre una partida, una solicitud JSON, una prueba E2E visual, GitHub Actions y la aplicación publicada.
- [ ] **9.6 Ejecutar auditoría final.** Comparar el proyecto con la lista de verificación de este documento, revisar dependencias instaladas y comprobar que no existe ninguna librería prohibida.

**Criterio de salida:** repositorio, documentación, video, CI y aplicación pública corresponden a la misma versión estable.

### Fase 10 — Preparación de la defensa

- [ ] **10.1 Preparar el recorrido de defensa.** Abrir previamente editor, terminal, repositorio, Actions, servicio de despliegue y aplicación pública.
- [ ] **10.2 Ensayar con cronómetro.** Ejecutar la E2E visual contra producción, realizar un cambio pequeño, verificarlo, activar CI/CD y mostrarlo publicado dentro del tiempo permitido.
- [ ] **10.3 Preparar cambios configurables.** Saber modificar rápidamente, sin buscar por todo el proyecto: goles para ganar, fuerza máxima, fricción, probabilidad de evento, texto, color o duración. Cada valor debe estar centralizado y tener pruebas aplicables.
- [ ] **10.4 Preparar explicación técnica.** Poder explicar un tiro completo: interacción en React, `fetch`, ruta Express, servicio, validación, física, JSON de respuesta, animación y renderizado.
- [ ] **10.5 Preparar fallos controlados.** Saber demostrar que lint falla, cómo se ve una acción inválida y cómo se diagnostica una prueba E2E.
- [ ] **10.6 Confirmar el procedimiento de congelamiento.** Obtener una aclaración del docente sobre cómo se realizará el cambio obligatorio de la defensa sin contradecir la prohibición de actualizar el repositorio después del cierre.
- [ ] **10.7 Preparar el equipo.** Contar con batería, cargador, sesiones iniciadas, credenciales disponibles, Chrome instalado, dependencias listas y una conexión de respaldo.

**Criterio de salida:** el recorrido completo se ejecuta de forma repetible y existe margen para explicar decisiones.

## 8. Orden de reducción de alcance

Si aparece un bloqueo, se recorta en este orden:

1. presentación especial de clásicos;
2. sonidos y animaciones decorativas;
3. dificultad avanzada del rival;
4. rival controlado por el servidor completo;
5. efectos físicos diferentes por estadio;
6. tiro de altura;
7. evento complejo del perro, conservando una variación más simple si fuera necesario.

Nunca se recorta:

- modo local para dos jugadores;
- movimiento, choques, goles y turnos;
- decisiones de dirección, fuerza y selección de tapita;
- estado no trivial, finalización y empate;
- al menos una variación entre partidas;
- acción inválida visible;
- responsabilidades reales de Express;
- `fetch`, JSON, GET, POST y mismo dominio y puerto;
- lint de frontend y backend;
- pruebas E2E, CI/CD, despliegue y documentación.

## 9. Guion de evolución para la presentación

La presentación debe contar una historia, no enumerar archivos.

| Diapositiva | Mensaje principal | Evidencia sugerida |
| --- | --- | --- |
| 1. TUPAY | Qué es y qué experiencia propone. | Nombre, identidad y captura final. |
| 2. Evolución de la idea | Cómo las primeras ideas llevaron al fútbol con tapitas. | Bocetos o comparación breve de conceptos. |
| 3. Planificación | Cómo se convirtió la idea en reglas, alcance y riesgos. | Fragmentos de `docs/` y plan por fases. |
| 4. Diseño | Cómo se definieron pantallas, interacción e identidad boliviana. | Boceto frente a interfaz final. |
| 5. Arquitectura | Qué hace React, qué hace Express y cómo se comunican. | Diagrama simple y ejemplo JSON. |
| 6. Desarrollo | Cómo se construyeron física, reglas y partida jugable. | Evolución mediante tags o commits. |
| 7. Pruebas | Cómo se comprobaron inicio, tiro, backend, errores y finalización. | Playwright visual y Actions. |
| 8. Publicación | Cómo el mismo proyecto llegó a una URL pública. | Pipeline y aplicación publicada. |
| 9. Resultado y aprendizaje | Qué cambió, qué se descartó y qué se aprendió. | Comparación idea inicial contra resultado. |

Cada diapositiva debe responder tres preguntas: **qué decisión se tomó, por qué se tomó y cómo se verificó**.

## 10. Lista de verificación contra la rúbrica

| Requisito | Evidencia prevista |
| --- | --- |
| Juego original | Concepto, evolución y reglas documentadas. |
| Al menos dos jugadores | Modo local para dos jugadores. |
| Uso significativo de pantalla | Cancha dominante, marcador, controles y mensajes. |
| Movimiento | Tapitas, pelota y evento opcional animados. |
| Interacción entre jugadores | Choques, bloqueos, turnos y competencia por goles. |
| Estado no trivial | Posiciones, marcador, turno, estado de animación, variante y resultado. |
| Reglas y finalización | Acciones válidas e inválidas, victoria y empate. |
| Decisión estratégica | Elección de tapita, dirección y fuerza. |
| Variabilidad | Variante o evento del servidor con semilla. |
| Retroalimentación visual | Turno, marcador, errores, eventos y resultado visibles. |
| React y TypeScript | Componentes, hooks, estado, eventos y renderizado. |
| Express y TypeScript | Creación, almacenamiento, validación y simulación de partidas. |
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
| --- | --- | --- |
| Física inestable | Objetos se atraviesan o nunca se detienen. | Pasos fijos, subpasos, límites de iteración y menos tapitas. |
| Animación distinta del servidor | React termina en otra posición. | Animar exclusivamente los cuadros devueltos y aplicar el estado final del servidor. |
| Pruebas frágiles | E2E falla de forma intermitente. | Semilla fija, localizadores estables y espera de respuestas, no de tiempos arbitrarios. |
| Despliegue lento o fallido | El commit publicado no coincide. | Despliegue temprano, endpoint de versión y medición continua. |
| Pérdida de partidas | Reinicio del servicio borra memoria. | Aceptarlo y documentarlo; mostrar un mensaje y permitir crear otra partida. |
| Exceso de alcance | El núcleo sigue incompleto al iniciar extras. | Aplicar estrictamente el orden de reducción. |
| Código difícil de defender | No se puede explicar una función o modificar una regla. | Tareas pequeñas, revisión personal y configuración centralizada. |
| Recursos sin permiso | No se conoce origen o licencia. | Preferir recursos propios y registrar toda fuente o herramienta generativa. |
| Contradicción del cierre | El cambio de defensa exige actualizar el repositorio congelado. | Solicitar una instrucción escrita del docente antes de la entrega. |

## 12. Condición final de éxito

TUPAY está listo cuando una persona puede abrir la URL pública, comprender las instrucciones, completar una partida de dos jugadores, observar una variación, provocar una acción inválida y llegar a un resultado; mientras tanto, las pruebas y GitHub Actions demuestran que React, Express, la API y el despliegue funcionan como una sola aplicación.
