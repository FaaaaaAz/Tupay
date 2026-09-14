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
| `npm run test:e2e:defensa` | Solo el recorrido de defensa, con Chrome visible, contra la aplicación publicada. |

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

## Pruebas E2E de la Fase 9

### Qué cubre cada archivo

| Archivo | Tarea | Qué demuestra |
|---|---|---|
| `inicio.spec.ts` | 9.2 | La configuración muestra exactamente los equipos y estadios que respondió `/api/equipos` y `/api/estadios`, y se crea un partido de Eliminatoria y uno de Liga contra el servidor. |
| `interaccion.spec.ts` | 9.3 | Arrastrar una tapita manda al servidor la dirección y la fuerza del gesto, y al terminar la animación la tapita queda en la posición que devolvió Express. |
| `validaciones.spec.ts` | 9.4 | Con dos equipos iguales el servidor responde 400, y la alerta de la pantalla muestra exactamente ese texto. |
| `finalizacion.spec.ts` | 9.5 | Una Eliminatoria a un gol termina en la pantalla de resultado; una Liga de 3 segundos termina empatada. |
| `defensa.spec.ts` | 9.6 | Inicio, pedidos reales, un emote y un gol que termina el partido, en unos 6 segundos. |
| `partidas.spec.ts`, `temporada.spec.ts`, `estadios-y-emotes.spec.ts`, `salud.spec.ts` | Fases anteriores | La API directamente, la temporada, los charcos y los emotes. |

Los pasos que se repiten (abrir el menú, configurar un partido, tirar) viven en `e2e/ayudantes.ts`.

### Cómo se localizan los elementos

Primero el rol y el nombre visible, como lo busca una persona: `getByRole("button", { name: "Jugar" })`.
Después la etiqueta de un campo: `getByLabel("Estadio")`. Solo donde no hay nada semántico estable
—la cancha, las tapitas, el marcador, los mensajes— se usa `data-testid`. Nunca clases de CSS.

### Cómo se hace repetible un juego con azar

La pantalla no ofrece elegir la semilla, y no debe: es una opción de prueba. Las pruebas la agregan
interceptando el pedido `POST /api/partidas` con `page.route` y sumándole `semilla` o
`duracionRealSegundos` antes de que salga. El pedido sigue llegando al servidor real, que lo valida
igual que siempre. Funciona también contra producción, porque la intercepción ocurre en el navegador.

### Cómo se tira desde una prueba

Una prueba no puede adivinar en qué píxel quedó una tapita: depende del tamaño de la ventana. La
función `aPantalla` le pide al propio SVG su matriz de transformación (`getScreenCTM`), la misma que
usa React para convertir el puntero en unidades de cancha, y con ella calcula dónde presionar y hasta
dónde arrastrar.

### La defensa, en PowerShell

```powershell
$env:URL_PRODUCCION = "https://tupay.onrender.com"
npm run test:e2e:defensa
```

Conviene abrir la URL unos minutos antes: si el servicio está dormido, la primera carga tarda cerca de
un minuto y la prueba espera hasta 90 segundos.

### Cómo se diagnostica una prueba que falla

Las dos configuraciones guardan la traza de cada prueba que falla (`trace: "retain-on-failure"`), en
`test-results/`. Se abre con:

```bash
npx playwright show-trace test-results/<carpeta-de-la-prueba>/trace.zip
```

La traza muestra cada paso, los pedidos a la API con su respuesta, la consola del navegador y el DOM en
cada momento. Así se encontró en la Fase 8 un error de la animación que hacía fallar una prueba una vez
cada 80 ejecuciones: la consola de la traza mostraba el error exacto de React.

### Las pruebas también corren contra producción en Actions

El trabajo `Deploy a Render`, después de confirmar que la URL pública sirve el commit nuevo, instala
Chromium y ejecuta `npm run test:e2e:prod`. Así la versión publicada se prueba con las mismas 25
pruebas que corren antes del deploy, y su reporte queda como artefacto `reporte-e2e-produccion`.

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

Medidos el 14 de septiembre de 2026, al terminar la Fase 9.

| Medición | Resultado |
|---|---|
| Pruebas unitarias del dominio (97 pruebas) | unos 8 s en local; 23 s en Actions |
| Pruebas E2E locales (25 pruebas, headless) | 10,4 s, compilación incluida |
| Las mismas 25, repetidas 5 veces seguidas | 125 de 125 en verde, 32,6 s |
| Pruebas E2E contra producción (servicio despierto) | 25 de 25 en verde, entre 16 y 18,6 s |
| Recorrido de defensa en Chrome visible contra producción | entre 5,7 y 6,2 s (tres ejecuciones seguidas) |
| Deploy en Render, hasta que la URL informa el commit | 52 s |
| Pipeline completo en GitHub Actions (último antes de la Fase 9) | 142 s: lint 18 s, pruebas 81 s, deploy 55 s |
| Pipeline completo con las pruebas contra producción (commit `582d561`) | 215 s: lint 24 s, pruebas 94 s, deploy 113 s |

En esa ejecución, el trabajo de deploy tardó 51 s en ver publicado el commit, 22 s en instalar
Chromium y 27 s en correr las 25 pruebas contra la URL pública. El pipeline completo quedó en 3,6
minutos, dentro de la meta de 6.

### Cuando Render no publica el commit

En la ejecución siguiente (commit `f3d92bf`, los escudos), Render aceptó el Deploy Hook pero la URL
siguió informando el commit anterior durante los 40 intentos, y el trabajo de deploy quedó en rojo.
Ese mismo commit, exportado con `git archive` a una carpeta limpia, compiló sin errores con
`npm ci --include=dev && npm run build`, y todas las rutas de las imágenes coincidían exactamente con
los nombres versionados. El fallo estaba del lado de Render, y se diagnostica en su panel: la lista de
deploys del servicio y el log del que falló. Es justo el caso para el que existe la comprobación de la
versión: sin ella, el pipeline habría quedado en verde con la versión vieja publicada.
