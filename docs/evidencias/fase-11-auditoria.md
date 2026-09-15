# Auditoría final — Fase 11 (tarea 11.5)

Revisión del 15 de septiembre de 2026 contra la lista de verificación de la sección 10 de
[`docs/plan.md`](../plan.md), sobre la versión con el perro sin doble turno y el sonido de los charcos.

## Verificación ejecutada

- `npm run lint` y `npm run typecheck`: sin errores.
- `npm run test:unit`: 120 pruebas aprobadas.
- `npm run test:e2e`: 55 pruebas aprobadas contra el build de producción local.
- GitHub Actions ejecuta lint, pruebas y deploy en cada push a `main`, y repite las E2E contra
  <https://tupay.onrender.com>.

En una de las corridas locales completas falló una vez la prueba «un emote aceptado suena una vez».
Aislada pasó 5 de 5 veces y la corrida completa siguiente pasó entera. Se registra como posible
intermitencia de carga de audio con varias pruebas en paralelo: el motor descarta a propósito los
efectos que tardan más de 350 ms en estar listos.

## Dependencias

| Tipo | Paquetes | Observación |
|---|---|---|
| Producción | `express`, `react`, `react-dom` | Lo mínimo que exige el stack. |
| Desarrollo | `@playwright/test`, `eslint`, `@eslint/js`, `typescript-eslint`, `globals`, `typescript`, `@types/*`, `tsx`, `vite`, `@vitejs/plugin-react` | Herramientas de compilación, lint y pruebas; no llegan al navegador como librerías de interfaz. |
| Fuera de `package.json` | `sharp` | Se instala a mano con `--no-save` solo para regenerar imágenes; no se usa para compilar ni para jugar. |

No hay librerías de componentes, de estilos, de estado, de enrutamiento, de física ni de animación.
La interfaz es React con CSS propio, la navegación es un estado de `App` y la física es propia.

## Lista de verificación

| Requisito | Estado | Evidencia |
|---|---|---|
| Juego original | Cumple | `docs/introduccion.md` (concepto y evolución) y `docs/reglas.md`. |
| Al menos dos jugadores | Cumple | 1 jugador contra el servidor o 2 en el mismo dispositivo; E2E de configuración y temporada con dos jugadores. |
| Uso significativo de pantalla | Cumple | Cancha dominante con marcador, reloj, turno y mensajes: [cancha de Liga](fase-11-cancha-liga.jpg). |
| Movimiento | Cumple | Tapitas, pelota que rueda y perro animados a partir del recorrido de Express. |
| Interacción entre jugadores | Cumple | Choques, bloqueos, turnos, emotes y competencia por goles. |
| Estado no trivial | Cumple | Posiciones, marcador, turno, tiros de poder, charcos, reloj, pausa y tabla de temporada. |
| Reglas y finalización | Cumple | Acciones inválidas, victoria, empate en Liga y campeón de temporada: [resultado](fase-11-resultado.jpg). |
| Decisión estratégica | Cumple | Elección de tapita, dirección, fuerza, tiro de poder, estadio y dificultad. |
| Variabilidad | Cumple | Perro, charcos de agua y nieve, sorteo del saque y rival por muestreo. |
| Retroalimentación visual | Cumple | Avisos de turno, gol, perro y charco, árbitros en [pausa](fase-11-pausa.jpg) y [salida](fase-11-salida.jpg), imágenes propias de `assets/`. |
| React y TypeScript | Cumple | Componentes, hooks, estado, eventos y renderizado en `client/src/`. |
| Express y TypeScript | Cumple | Creación, validación, simulación y temporada en `server/src/`. |
| HTTP REST | Cumple | `fetch`, JSON, GET y POST reales; contrato en `docs/api.md`. |
| Mismo dominio y puerto | Cumple | En producción Express sirve el cliente compilado y la API. |
| Sin librerías prohibidas | Cumple | Ver la sección de dependencias. |
| Tres trabajos de Actions | Cumple | Lint, pruebas unitarias y E2E, y deploy a Render en `.github/workflows/ci.yml`. |
| Pruebas E2E | Cumple | 55 pruebas: inicio, interacción, backend, validación y finalización, además del recorrido `@defensa`. |
| Publicación | Cumple | Frontend y backend completos en <https://tupay.onrender.com>; `/api/salud` informa el commit publicado. |
| Repositorio y documentación | Cumple | README, `docs/`, historial de commits, evidencias y `docs/uso-ia.md`. |
| Defensa | Pendiente | Video de la tarea 11.4 y preparación de la Fase 12. |

## Pendientes fuera de esta auditoría

- Grabar el video (tarea 11.4) y crear el tag `fase-11`.
- Registrar la fuente y la licencia de los audios aportados por el autor, marcados como pendientes en
  [`assets/audio/README.md`](../../assets/audio/README.md).
