# Audio de Tupay

## Alcance y procedencia

Selección inicial descargada el 15-09-2026: **21 archivos Ogg Vorbis, 1,62 MB en total**.
No hay público, cánticos, aplausos ni hinchada. Tampoco se generaron sonidos artificiales
para rellenar categorías vacías. Los tonos digitales son recursos reales de Kenney, no voces.

Todos los archivos seleccionados están publicados con
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), que permite copiar, adaptar y distribuir,
también en proyectos comerciales. Se registran los autores aunque la atribución no sea obligatoria.
Las licencias incluidas en los cinco paquetes de Kenney se conservan en `licencias/`.
Para las dos pistas de OpenGameArt, sus páginas originales enlazadas en la tabla identifican
al autor y CC0; la página de Ansimuz además autoriza expresamente el uso comercial.

`catalogo.json` es el inventario único de rutas, procedencia, licencia, estado, canal, ganancia
individual y tiempo mínimo entre repeticiones. Los nombres originales permiten localizar cada
selección dentro del paquete del autor. No se incorporaron los paquetes completos al repositorio.

## Inventario

Las rutas son relativas a esta carpeta y conservan las categorías solicitadas. «Preparado»
significa descargado y registrado, **no conectado a una jugada**. Los nombres de victoria,
derrota y emociones describen el uso propuesto; queda pendiente la aprobación auditiva del autor
para ese contexto. Se comprobó decodificación y señal, no se afirma una escucha subjetiva.

| Archivo y categoría | Archivo original | Autor y página original | Licencia | Estado |
|---|---|---|---|---|
| `music/menu/exploracion.ogg` | `exploration.ogg` | [ansimuz](https://opengameart.org/content/chiptune-exploration) | CC0-1.0 | integrado en 10.7 |
| `music/gameplay/competicion.ogg` | `Crazy_0.ogg` | [MatiasVME](https://opengameart.org/content/chiptune-loop-crazy) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `music/results/victoria-arcade.ogg` | `8-Bit jingles/jingles_NES00.ogg` | [Kenney](https://kenney.nl/assets/music-jingles) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `music/results/resultado-negativo.ogg` | `8-Bit jingles/jingles_NES10.ogg` | [Kenney](https://kenney.nl/assets/music-jingles) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/gameplay/kick/impulso-tapita.ogg` | `chip-lay-1.ogg` | [Kenney](https://kenney.nl/assets/casino-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/gameplay/collision/choque-tapitas.ogg` | `chips-collide-1.ogg` | [Kenney](https://kenney.nl/assets/casino-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/gameplay/bounce/rebote-pared.ogg` | `impactWood_light_000.ogg` | [Kenney](https://kenney.nl/assets/impact-sounds) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/gameplay/bounce/golpe-poste.ogg` | `impactMetal_light_000.ogg` | [Kenney](https://kenney.nl/assets/impact-sounds) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/gameplay/goal/gol-arcade.ogg` | `powerUp8.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/ui/click/clic.ogg` | `click_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado en 10.7 |
| `sfx/ui/selection/seleccion.ogg` | `select_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/ui/confirmation/confirmacion.ogg` | `confirmation_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/ui/error/error.ogg` | `error_004.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/transitions/transicion.ogg` | `back_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/transitions/inicio-partido.ogg` | `threeTone1.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/transitions/fin-partido.ogg` | `lowThreeTone.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/gameplay/power-up/poder.ogg` | `powerUp1.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/reactions/happy/alegria.ogg` | `highUp.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/reactions/sad/decepcion.ogg` | `lowDown.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/reactions/surprised/sorpresa.ogg` | `pepSound1.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |
| `sfx/reactions/euphoric/euforia.ogg` | `powerUp2.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | recurso preparado; conexión pendiente en 10.8 |

## Originales y versiones publicadas

- `assets/audio/`: originales OGG seleccionados, sin transcodificación ni recortes.
- `client/src/recursos/audio/`: mismos OGG y estructura, preparados para Vite. Esta copia sigue
  la convención del proyecto para originales y recursos web; no se duplica un sonido por botón.
- Ya eran archivos comprimidos compatibles con el navegador probado; no se recomprimieron.
  Se escogió el OGG de Ansimuz, no el WAV ni MP3 alternativos del mismo paquete.
- Vite genera URLs con hash y Express aprovecha la caché `immutable` existente.
  El catálogo importa URLs: los bytes solo se solicitan cuando se necesitan.
- Los bucles usan un `AudioBufferSourceNode` con `loop`, sin reiniciar un elemento multimedia
  desde JavaScript al terminar. Los posibles cortes musicales de los originales deben revisarse
  al escuchar varios ciclos. Se descartó Happy Adventure como selección inicial por las
  advertencias de silencio de su MP3 en la [página original](https://opengameart.org/content/happy-adventure-loop).

## Categorías pendientes o sin recurso

| Categoría / acción | Estado y motivo |
|---|---|
| `sfx/ambience/`: perro | No descargado: [Dog_Bark.wav de michael_grinnell](https://freesound.org/people/michael_grinnell/sounds/464400/), CC0, 0,631 s. El original requiere iniciar sesión en Freesound. Conectar una vez cuando el perro aparezca en los cuadros confirmados, nunca en bucle. |
| `sfx/reactions/sleepy/`: dormida | No descargado: [Fast Snore de bsmacbride](https://freesound.org/people/bsmacbride/sounds/108519/), CC0, 5 s; requiere sesión y un recorte/revisión para no resultar largo. |
| `sfx/reactions/angry/`: enojada | Sin selección final. [Grognement de davidou](https://freesound.org/people/davidou/sounds/88462/), CC0, 3,589 s, es un candidato: revisar que no parezca una voz realista y acortarlo antes de incorporar. |
| `sfx/reactions/serious/`: enojadoSerio | Preparada sin voz. Se puede reutilizar confirmación con la prioridad de reacciones en 10.8, sin duplicar archivo. |
| Resortera al apuntar | Recurso pendiente; no sustituido por un disparo de arma. |
| Silbato | No seleccionado. Ya hay una señal digital de inicio como alternativa, todavía sin conectar. |
| Fallar un gol | Opcional no implementado: no existe un evento confirmado que distinga intento fallido de un tiro normal. |
| Cuenta regresiva | Recurso/conexión pendiente; usar umbrales del reloj, no cada render. |

Las carpetas sin audio contienen un README real, no archivos de sonido vacíos.

## Qué funciona en 10.7

- Pulsar **Iniciar** desbloquea Web Audio y solicita la música del menú. No se reproduce nada
  por cargar la portada ni por montar un componente.
- La música continúa sin superponerse al navegar a instrucciones/configuración/temporada.
  Se detiene al volver a portada, entrar al partido o mostrar el resultado. La música de partido
  y las señales de resultado están preparadas para **10.8**, no se reproducen todavía.
- «Sonido» en el menú y en el modal de pausa ofrece silencio, volumen de música, volumen de
  efectos/interfaz y «Probar efecto». Este último reproduce el clic real; no se sonorizan todos
  los botones todavía.
- `localStorage['tupay.audio.v1']` guarda preferencias validadas. Sin almacenamiento funciona
  en memoria. Predeterminados: música 25 %, efectos 60 %, además de la ganancia de cada recurso.
- Una única instancia de `MotorAudio` centraliza carga, decodificación, música y canales.
  La música no se duplica al renderizar ni al repetir la misma solicitud.
- Máximo cuatro efectos simultáneos, intervalo por recurso y descarte de eventos cuya carga
  llega más de 350 ms tarde. El primer efecto puede omitirse con una conexión lenta: nunca
  se reproduce tarde una cola de acciones viejas.
- Las reacciones tienen menor ganancia, solo una a la vez y ceden ante efectos de gameplay.
- Silenciar o salir cancela reproducciones pendientes. Ocultar la pestaña detiene sonidos y
  conserva la posición de música; al volver se reanuda solo si el contexto sigue autorizado.
- Una descarga o decodificación fallida muestra un aviso en los controles y permite seguir
  jugando. Nunca debe bloquearse una solicitud de la API por esperar al audio.

## Conexión prevista en 10.8

El controlador no inventa eventos de Express ni deduce goles desde píxeles:

- `audio.efecto(id)`: usar en una acción concreta o evento confirmado una sola vez.
- `audio.reproducirMusica('partido')`: al crear o retomar realmente un partido; no en cada render.
- `audio.pausar(true/false)`: al cambiar el estado real de pausa, conservando posición musical.
  Los sonidos de interfaz se permiten en pausa; gameplay y reacciones no.
- `audio.detenerTodo()`: salir/cambiar de sesión; cancela también cargas pendientes.
- Choques y rebotes necesitan una señal fiable: los eventos actuales no los incluyen.
  No inferir múltiples colisiones en cada cuadro sin deduplicación.
- En dos jugadores, no asumir quién es «el usuario perdedor». Definir antes el criterio del
  jingle de resultado. Las reacciones se conectarán al emote aceptado, con prioridad inferior
  al tiro/gol y sin voces continuas.

## Agregar o reemplazar un sonido

1. Confirmar licencia del archivo concreto y procedencia; conservar su licencia/evidencia.
2. Guardar el original en su categoría, con nombre descriptivo en minúsculas y sin espacios.
3. Si se convierte, conservar el original y documentar herramienta, parámetros y versión.
4. Copiar la versión OGG a la misma ruta relativa bajo `client/src/recursos/audio/`.
5. Añadir una entrada única a `catalogo.json` y esta tabla. No duplicar archivos para reutilizarlos.
6. Ajustar ganancia/intervalo, verificar la reproducción y escuchar su mezcla antes de conectar.
7. Ejecutar `npm run lint`, `npm run typecheck`, `npm run test:unit` y
   `npm run test:e2e -- e2e/audio.spec.ts`. Actualizar el conteo esperado si cambia el inventario.

