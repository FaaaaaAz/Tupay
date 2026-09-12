# Tupay — Investigación técnica

Este documento registra lo que hubo que investigar para las dos partes del proyecto que no se
resuelven escribiendo código del juego: las pruebas end-to-end y la publicación de la aplicación.

## Pruebas E2E con Playwright

### Por qué Playwright

Se eligió Playwright sobre Cypress por tres razones concretas para este proyecto:

1. Trae su propio navegador y su propio ejecutor de pruebas, sin dependencias adicionales.
2. Puede **levantar la aplicación por sí mismo** antes de probar (opción `webServer`), lo que evita
   tener que coordinar a mano el arranque del servidor en GitHub Actions.
3. Permite usar el Google Chrome instalado en la máquina (`channel: "chrome"`), que es justamente
   lo que pide la defensa: ejecución visual en Chrome, no en un navegador empaquetado.

Fuentes consultadas: documentación oficial de Playwright, secciones *Getting started*,
*Test configuration*, *Web server* y *Continuous Integration* (`https://playwright.dev/docs/intro`).

### Cómo se ejecutan

| Comando | Qué hace |
|---|---|
| `npm run test:e2e` | Sin ventana, en Chromium. Es lo que corre GitHub Actions. |
| `npm run test:e2e:visual` | Con ventana, en el Google Chrome instalado. Es lo de la defensa. |
| `npm run test:e2e:prod` | Las mismas pruebas contra la aplicación publicada. |

Las dos primeras usan `playwright.config.ts`, que compila la aplicación y la levanta en el puerto
**4173** antes de probar. Se eligió un puerto distinto al de desarrollo (3000 y 5173) para que las
pruebas no choquen con un `npm run dev` abierto en otra terminal.

La tercera usa `playwright.prod.config.ts`, que **no levanta ningún servidor**: recibe la dirección
por la variable de entorno `URL_PRODUCCION` y prueba contra lo que ya está publicado.

```bash
URL_PRODUCCION=https://tupay.onrender.com npm run test:e2e:prod
```

### Decisiones y limitaciones encontradas

- **Un solo navegador en CI.** Se instala únicamente Chromium (`npx playwright install --with-deps
  chromium`) en vez de los tres navegadores. Bajar Firefox y WebKit sumaría más de un minuto a cada
  ejecución sin aportar nada: el examen pide Chrome.
- **Esperar respuestas, no tiempos.** Las pruebas esperan que aparezca un elemento o que responda la
  API, nunca un `sleep` de una cantidad fija de segundos. Es la causa más común de pruebas que fallan
  de forma intermitente.
- **`forbidOnly` en CI.** Un `test.only` olvidado haría que CI ejecutara una sola prueba y pasara en
  verde ocultando el resto. Con esta opción, en CI eso falla en vez de pasar desapercibido.
- **Reporte como artefacto.** El reporte HTML se guarda como artefacto del trabajo de Actions, así se
  puede revisar una prueba fallida sin volver a ejecutarla.

## Publicación en Render

### Configuración del servicio

Un único Web Service para todo, porque frontend y backend deben vivir bajo el mismo dominio y puerto.

| Opción | Valor | Motivo |
|---|---|---|
| Build Command | `npm ci --include=dev && npm run build` | Ver la nota sobre `--include=dev` más abajo. |
| Start Command | `npm start` | Levanta Express sirviendo el cliente ya compilado. |
| Plan | Free | Suficiente para el alcance del examen. |
| Health Check Path | `/api/salud` | Render confirma que el despliegue quedó vivo. |
| Auto-Deploy | Off | Los deploys los dispara GitHub Actions, no cada push. |
| `NODE_VERSION` | `22` | Fija la versión de Node en el servidor. |

### El puerto

Render asigna el puerto por la variable de entorno `PORT` y no se puede elegir. El servidor lo lee en
`server/src/configuracion.ts` con `process.env.PORT ?? 3000`: en Render usa el que le den (en la
práctica, el 10000) y en local el 3000. Fijar un puerto a mano haría que el servicio nunca respondiera.

### La versión publicada

Render define `RENDER_GIT_COMMIT` con el commit desplegado. `GET /api/salud` lo devuelve, y eso
permite comprobar desde afuera qué versión está publicada en cada momento. El pipeline lo usa para no
dar por bueno un deploy hasta que la URL pública informe exactamente el commit que se acaba de subir.

### `--include=dev`: el problema que costó entender

Vite y TypeScript son dependencias de desarrollo, pero hacen falta **para compilar**. Si el entorno
define `NODE_ENV=production`, `npm ci` omite las dependencias de desarrollo y el build falla con un
error confuso (`vite: not found`). Por eso el comando de build lleva `--include=dev` de forma
explícita, en vez de depender de cómo esté configurado el entorno.

### Arranque en frío y otras limitaciones del plan gratuito

- El servicio **se duerme tras 15 minutos sin visitas** y despertarlo tarda entre 50 segundos y un
  minuto. Por eso `playwright.prod.config.ts` usa tiempos de espera de 90 segundos, y por eso hay que
  abrir la aplicación unos minutos antes de la defensa.
- No hay disco persistente ni acceso por SSH. Esto refuerza la decisión de guardar las partidas en
  memoria: cualquier reinicio las borra, y está documentado como limitación aceptada.
- Cada deploy reinicia el proceso, así que las partidas en curso se pierden al publicar.

Fuentes consultadas: documentación oficial de Render, secciones *Deploy a Node.js app*,
*Free instance types*, *Environment variables* y *Deploy hooks* (`https://render.com/docs`).

### Por qué no se usa Docker

Docker es opcional en el examen y aquí no aporta nada. Render detecta un proyecto Node y lo compila
con los comandos indicados; agregar un `Dockerfile` significaría mantener una imagen, reproducir la
instalación de dependencias y alargar cada deploy, a cambio de exactamente el mismo resultado. Si el
proyecto necesitara servicios adicionales (una base de datos, un worker), la decisión se revisaría.

## Tiempos medidos

| Medición | Resultado |
|---|---|
| Pruebas E2E locales (3 pruebas, headless) | 8,0 s más el tiempo de compilar |
| Pruebas E2E contra producción (servicio despierto) | 5,9 s |
| Deploy completo en Render (primer deploy) | 45,1 s |
| Pipeline completo en GitHub Actions | *pendiente: medir tras la primera ejecución* |
