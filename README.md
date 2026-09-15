# Tupay

Videojuego web de fútbol con tapitas, con equipos y estadios de la Liga boliviana. Dos equipos de
5 tapitas se turnan para lanzar sus fichas, como en el billar, con el objetivo de meter la pelota en
el arco rival. Proyecto final de la materia de Certificación en React.

**Aplicación publicada:** <https://tupay.onrender.com>

- Introducción y origen de la idea: [`docs/introduccion.md`](docs/introduccion.md)
- Reglas completas del juego: [`docs/reglas.md`](docs/reglas.md)
- Plan de desarrollo por fases: [`docs/plan.md`](docs/plan.md)
- API con ejemplos reales: [`docs/api.md`](docs/api.md)
- Pantallas, identidad visual y recursos: [`docs/boceto.md`](docs/boceto.md)
- Decisiones técnicas, riesgos y cambios: [`docs/decisiones.md`](docs/decisiones.md)
- Pruebas, despliegue y tiempos medidos: [`docs/investigacion.md`](docs/investigacion.md)
- Registro del uso de IA: [`docs/uso-ia.md`](docs/uso-ia.md)
- Capturas y auditorías: [`docs/evidencias/`](docs/evidencias/)

## Qué se puede jugar

- **Eliminatoria:** un partido a una meta de 1 a 5 goles, sin empate.
- **Liga:** un partido de 90 minutos a reloj acelerado, con minutos y segundos; puede terminar empatado.
- **Temporada:** los 10 equipos todos contra todos, con calendario, tabla de posiciones y campeón.
- **1 jugador** contra el servidor (fácil, medio o difícil) o **2 jugadores** en el mismo dispositivo.
- Seis estadios reales: en La Paz y Oruro hay charcos de agua; en El Alto y Potosí, de nieve.
- El perro puede meterse a la cancha y llevarse la pelota; nunca hace un gol ni da doble turno.
- Tiro de poder, emotes, pausa, salida con confirmación, música y efectos de sonido.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior
- Google Chrome, solo para las pruebas E2E visuales

## Instalación

```bash
npm install
npx playwright install chromium   # solo para correr las pruebas E2E
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor Express (puerto 3000) y Vite (puerto 5173) a la vez. Se abre `http://localhost:5173`. |
| `npm run dev:server` | Solo el servidor Express, con recarga automática. |
| `npm run dev:client` | Solo el cliente React con Vite. |
| `npm run build` | Compila el cliente a `dist/cliente` y el servidor a `dist/server`. |
| `npm start` | Levanta Express sirviendo el cliente ya compilado en `http://localhost:3000`. |
| `npm run lint` | ESLint sobre cliente y servidor. Falla si hay infracciones. |
| `npm run typecheck` | TypeScript estricto sobre `compartido/`, `client/`, `server/` y `e2e/`. |
| `npm run test:unit` | Pruebas unitarias del dominio del servidor y del motor de audio del cliente, con `node:test`. |
| `npm run test:e2e` | Pruebas end-to-end sin ventana (lo que corre GitHub Actions). |
| `npm run test:e2e:visual` | Las mismas pruebas con ventana, en el Google Chrome instalado. |
| `npm run test:e2e:prod` | Las mismas pruebas contra la aplicación publicada. Necesita `URL_PRODUCCION`. |
| `npm run test:e2e:defensa` | Solo el recorrido de defensa, en Chrome visible, contra la aplicación publicada. Necesita `URL_PRODUCCION`. |

En desarrollo son dos procesos: Vite sirve el cliente y reenvía `/api` a Express, de modo que el
navegador siempre ve una sola dirección. En producción hay un solo proceso: Express sirve el cliente
compilado y la API bajo el mismo dominio y puerto.

## Arquitectura

Express decide y React presenta. Ninguna regla del juego vive en el navegador.

- **Express (`server/src/`):** crea partidas y temporadas, valida cada acción, simula la física con
  pasos fijos (choques, fricción, paredes, postes y charcos), aplica las reglas (gol, perro, turnos,
  reloj de Liga, emotes y pausa), mueve al rival del servidor y guarda todo en memoria.
- **React (`client/src/`):** navega entre pantallas con estado propio, sin router; se comunica con
  Express mediante `fetch` y JSON; anima el recorrido que devuelve el servidor y hace sonar golpes y
  eventos solo cuando están confirmados.
- **`compartido/`:** los tipos del contrato JSON. Los usan los dos lados, así que un cambio en la API
  rompe la compilación en vez de fallar en tiempo de ejecución.

Recorrido de un tiro:

1. La persona arrastra hacia atrás desde una tapita; React calcula dirección y fuerza.
2. `POST /api/partidas/:id/tiros` con `{ lado, tapita, direccion, fuerza, tiroDePoder }`.
3. La ruta revisa la forma del cuerpo y el dominio valida turno, tapita, fuerza y tiros de poder.
4. La física simula hasta que todo se detiene o entra un gol; las reglas aplican charcos, gol, perro,
   turno y final.
5. Express responde el `recorrido` cuadro a cuadro, los `eventos`, los `contactos` que suenan y la
   `partida` nueva.
6. React anima los cuadros, hace sonar cada golpe en su cuadro y aplica el estado final del servidor.

## Estructura

```text
compartido/          tipos de entrada y salida de la API (sin lógica)
client/src/          React: api, audio, componentes, hooks, pantallas, recursos, estilos
server/src/          Express: rutas, servicios y dominio (física, reglas, estadios, rival, temporada)
e2e/                 pruebas end-to-end con Playwright
docs/                documentación del proyecto y evidencias
assets/              imágenes y audios originales (fuente de verdad)
scripts/             utilidades de desarrollo
.github/workflows/   pipeline de lint, pruebas y despliegue
```

Las imágenes que usa el juego viven en `client/src/recursos/` y se generan desde `assets/` con
un script que se corre a mano, solo cuando cambia algún original:

```bash
npm install --no-save sharp
node scripts/optimizar-recursos.mjs            # todos los grupos
node scripts/optimizar-recursos.mjs escudos    # solo los grupos nombrados
```

`sharp` no es dependencia del proyecto: hace falta para regenerar las imágenes, no para compilar
ni para jugar. Los audios, su autoría y su licencia están en
[`assets/audio/README.md`](assets/audio/README.md).

## API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/api/salud` | Estado del servidor y commit publicado. |
| GET | `/api/equipos` | Los diez equipos, con su estadio y sus colores. |
| GET | `/api/estadios` | Los seis estadios y su efecto. |
| POST | `/api/partidas` | Crea un partido de Eliminatoria o de Liga. |
| GET | `/api/partidas/:id` | Estado actual del partido. |
| POST | `/api/partidas/:id/tiros` | Valida y simula un tiro; devuelve el recorrido y el estado nuevo. |
| POST | `/api/partidas/:id/turno-rival` | En 1 jugador, el servidor prueba varios tiros, elige el mejor y lo ejecuta. |
| POST | `/api/partidas/:id/emotes` | Lanza una carita sobre las tapitas de un jugador; valida la espera de 15 segundos. |
| POST | `/api/partidas/:id/pausar` | Pausa el partido y congela el turno, el reloj de Liga y los emotes. |
| POST | `/api/partidas/:id/reanudar` | Reanuda el partido conservando el tiempo que quedaba. |
| POST | `/api/partidas/:id/abandonar` | Descarta un partido sin terminar. |
| POST | `/api/temporadas` | Crea una temporada y genera el calendario de todos contra todos. |
| GET | `/api/temporadas/:id` | Calendario, tabla de posiciones y próximos partidos. |
| POST | `/api/temporadas/:id/partidos/:partidoId/jugar` | Crea la partida de Liga de un partido de la temporada. |

Todos los errores responden `{ "error": "mensaje" }`, con el mismo texto que se muestra en pantalla.
Entradas, salidas y ejemplos reales de cada endpoint: [`docs/api.md`](docs/api.md).

## Pruebas

- **Unitarias (120, `node:test`):** física, charcos, reglas del partido, perro, rival por muestreo,
  emotes, pausa, temporada y motor de audio. Tardan unos segundos.
- **End-to-end (55, Playwright):** inicio, interacción con la cancha, integración HTTP, acciones
  inválidas, finalización, temporada, estadios y emotes, audio, pausa y salida, y presentación en
  1280 × 720, 1366 × 768 y 1920 × 1080. Usan semillas fijas para que el azar sea repetible.
- **Recorrido de defensa (`@defensa`):** en menos de 30 segundos crea un partido en la URL pública,
  lanza un emote y termina el partido con un gol, en Chrome visible.

```powershell
$env:URL_PRODUCCION = "https://tupay.onrender.com"
npm run test:e2e:defensa
```

## Variables de entorno

| Variable | Uso |
|---|---|
| `PORT` | Puerto donde escucha Express. Por defecto `3000`. Render lo asigna solo. |
| `RENDER_GIT_COMMIT` | La define Render; identifica el commit publicado y se expone en `/api/salud`. |
| `URL_PRODUCCION` | Dirección pública contra la que corren las pruebas de producción. |

## Integración continua y despliegue

La aplicación se publica en Render como un único Web Service (frontend y backend bajo la misma
dirección): <https://tupay.onrender.com>

El workflow **Validar, probar y publicar Tupay** (`.github/workflows/ci.yml`) tiene tres trabajos:

1. **Lint:** ESLint y TypeScript sobre frontend y backend.
2. **Pruebas unitarias y E2E (headless):** con el reporte de Playwright como artefacto.
3. **Deploy a Render:** solo si los dos anteriores pasan y el push es a `main`. Le pide a Render que
   publique mediante un Deploy Hook, espera a que `/api/salud` informe exactamente ese commit y vuelve
   a correr las pruebas E2E contra la URL pública.

Los detalles de configuración, las limitaciones del plan gratuito y el motivo para no usar Docker
están en [`docs/investigacion.md`](docs/investigacion.md).
