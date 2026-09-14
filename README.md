# Tupay

Videojuego web de fútbol con tapitas, con equipos y estadios de la Liga boliviana. Dos equipos de
5 tapitas se turnan para lanzar sus fichas, como en el billar, con el objetivo de meter la pelota en
el arco rival. Proyecto final de la materia de Certificación.

- Introducción y origen de la idea: [`docs/introduccion.md`](docs/introduccion.md)
- Reglas completas del juego: [`docs/reglas.md`](docs/reglas.md)
- Plan de desarrollo por fases: [`docs/plan.md`](docs/plan.md)

## Requisitos

- Node.js 22 o superior
- npm 10 o superior

## Instalación

```bash
npm install
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
| `npm run test:unit` | Pruebas unitarias del dominio del servidor (física, charcos, reglas, rival, emotes y temporada), con `node:test`. |
| `npm run test:e2e` | Pruebas end-to-end sin ventana (lo que corre GitHub Actions). |
| `npm run test:e2e:visual` | Las mismas pruebas con ventana, en el Google Chrome instalado. |
| `npm run test:e2e:prod` | Las mismas pruebas contra la aplicación publicada. Necesita `URL_PRODUCCION`. |
| `npm run test:e2e:defensa` | Solo el recorrido de defensa, en Chrome visible, contra la aplicación publicada. Necesita `URL_PRODUCCION`. |

En desarrollo son dos procesos: Vite sirve el cliente y reenvía `/api` a Express, de modo que el
navegador siempre ve una sola dirección. En producción hay un solo proceso: Express sirve el cliente
compilado y la API bajo el mismo dominio y puerto.

## Estructura

```text
compartido/      tipos de entrada y salida de la API (sin lógica)
client/src/      React: api, componentes, hooks, pantallas, estilos
server/src/      Express: rutas, servicios, dominio (física y reglas)
docs/            documentación del proyecto
assets/          imágenes originales sin comprimir (fuente de verdad)
scripts/         utilidades de desarrollo
```

Las imágenes que usa el juego viven en `client/src/recursos/` y se generan desde `assets/` con
un script que se corre a mano, solo cuando cambia algún original:

```bash
npm install --no-save sharp
node scripts/optimizar-recursos.mjs
```

`sharp` no es dependencia del proyecto: hace falta para regenerar las imágenes, no para compilar
ni para jugar.

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
| POST | `/api/temporadas` | Crea una temporada y genera el calendario de todos contra todos. |
| GET | `/api/temporadas/:id` | Calendario, tabla de posiciones y próximos partidos. |
| POST | `/api/temporadas/:id/partidos/:partidoId/jugar` | Crea la partida de Liga de un partido de la temporada. |

Todos los errores responden `{ "error": "mensaje" }`, con el mismo texto que se muestra en pantalla.
Entradas, salidas y ejemplos reales de cada endpoint: [`docs/api.md`](docs/api.md).

## Variables de entorno

| Variable | Uso |
|---|---|
| `PORT` | Puerto donde escucha Express. Por defecto `3000`. Render lo asigna solo. |
| `RENDER_GIT_COMMIT` | La define Render; identifica el commit publicado y se expone en `/api/salud`. |
| `URL_PRODUCCION` | Dirección pública contra la que corren las pruebas de producción. |

## Despliegue

La aplicación se publica en Render como un único Web Service (frontend y backend bajo la misma
dirección): <https://tupay.onrender.com>

Los deploys no se disparan con cada push: GitHub Actions ejecuta primero lint y pruebas E2E, y solo
si ambos pasan le pide a Render que publique, usando un Deploy Hook. El trabajo no se da por bueno
hasta que `/api/salud` en la URL pública informa exactamente el commit que se acaba de subir.

Los detalles de configuración, las limitaciones del plan gratuito y el motivo para no usar Docker
están en [`docs/investigacion.md`](docs/investigacion.md).
