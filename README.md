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
| `npm run typecheck` | TypeScript estricto sobre `compartido/`, `client/` y `server/`. |

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

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/salud` | `{ "estado": "ok", "juego": "Tupay", "version": "<commit>" }` |

Cualquier ruta bajo `/api` que no exista responde `404` con `{ "error": "Ruta de API no encontrada" }`.
El resto de los endpoints del juego se documentan en `docs/api.md` a medida que se implementan.

## Variables de entorno

| Variable | Uso |
|---|---|
| `PORT` | Puerto donde escucha Express. Por defecto `3000`. |
| `RENDER_GIT_COMMIT` | La define Render; identifica el commit publicado y se expone en `/api/salud`. |
