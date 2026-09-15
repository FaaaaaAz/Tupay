# Audio de Tupay

## Estado al cierre de la fase 10

**23 archivos Ogg Vorbis, 1.639.221 bytes (1,64 MB).** No hay hinchada, cánticos, aplausos
ni ambiente de público. No se generaron audios falsos para rellenar categorías.

`catalogo.json` centraliza rutas, autores, licencia, estado, canales, ganancias, intervalos
y la propiedad `bucle`. Las URLs de Vite tienen hash y `no-inline`: importar el catálogo
no incorpora los bytes del sonido al JavaScript ni los descarga al cargar la portada.

## Inventario y licencias

Todos los recursos elegidos están publicados bajo
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), que permite reutilización y
adaptación incluso comercial. Se conserva la autoría aunque atribuir no sea obligatorio.
Las cinco licencias incluidas en los paquetes de Kenney están en `licencias/`.
Las páginas de Ansimuz y MatiasVME enlazadas debajo identifican autor y licencia.
La procedencia exacta de los dos recursos nuevos se registra en [licencias/freesound.md](licencias/freesound.md).

«Integrado» significa conectado al flujo real. «Reservado» significa que el archivo existe,
pero **no se reproduce**: no se inventaron eventos de contacto en la simulación.
Los nombres de victoria, derrota y emociones describen su uso en Tupay, no títulos del autor.

| Archivo y categoría | Archivo original | Autor y página original | Licencia | Estado |
|---|---|---|---|---|
| `music/menu/exploracion.ogg` | `exploration.ogg` | [ansimuz](https://opengameart.org/content/chiptune-exploration) | CC0-1.0 | integrado |
| `music/gameplay/competicion.ogg` | `Crazy_0.ogg` | [MatiasVME](https://opengameart.org/content/chiptune-loop-crazy) | CC0-1.0 | integrado |
| `music/results/victoria-arcade.ogg` | `8-Bit jingles/jingles_NES00.ogg` | [Kenney](https://kenney.nl/assets/music-jingles) | CC0-1.0 | integrado |
| `music/results/resultado-negativo.ogg` | `8-Bit jingles/jingles_NES10.ogg` | [Kenney](https://kenney.nl/assets/music-jingles) | CC0-1.0 | integrado |
| `sfx/gameplay/kick/impulso-tapita.ogg` | `chip-lay-1.ogg` | [Kenney](https://kenney.nl/assets/casino-audio) | CC0-1.0 | integrado |
| `sfx/gameplay/collision/choque-tapitas.ogg` | `chips-collide-1.ogg` | [Kenney](https://kenney.nl/assets/casino-audio) | CC0-1.0 | reservado: no existe evento de contacto |
| `sfx/gameplay/bounce/rebote-pared.ogg` | `impactWood_light_000.ogg` | [Kenney](https://kenney.nl/assets/impact-sounds) | CC0-1.0 | reservado: no existe evento de contacto |
| `sfx/gameplay/bounce/golpe-poste.ogg` | `impactMetal_light_000.ogg` | [Kenney](https://kenney.nl/assets/impact-sounds) | CC0-1.0 | reservado: no existe evento de contacto |
| `sfx/gameplay/goal/gol-arcade.ogg` | `powerUp8.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/ui/click/clic.ogg` | `click_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/ui/selection/seleccion.ogg` | `select_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/ui/confirmation/confirmacion.ogg` | `confirmation_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/ui/error/error.ogg` | `error_004.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/transitions/transicion.ogg` | `back_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/transitions/inicio-partido.ogg` | `threeTone1.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/transitions/fin-partido.ogg` | `lowThreeTone.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/gameplay/power-up/poder.ogg` | `powerUp1.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/reactions/happy/alegria.ogg` | `highUp.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/reactions/sad/decepcion.ogg` | `lowDown.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/reactions/surprised/sorpresa.ogg` | `pepSound1.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/reactions/euphoric/euforia.ogg` | `powerUp2.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/ambience/ladrido.ogg` | `Dog_Bark.wav (vista previa pública OGG)` | [michael_grinnell](https://freesound.org/people/michael_grinnell/sounds/464400/) | CC0-1.0 | integrado |
| `sfx/gameplay/aim/resortera.ogg` | `Slingshot (vista previa pública OGG)` | [renne100](https://freesound.org/people/renne100/sounds/353033/) | CC0-1.0 | integrado |

## Archivos descargados y versiones web

- `assets/audio/` conserva exactamente los OGG descargados; `client/src/recursos/audio/`
  conserva las copias publicadas con la misma ruta relativa. Es la separación habitual del proyecto.
- Los dos audios de Freesound son sus **vistas previas públicas OGG**, no los WAV/MP3 originales
  que requieren sesión. Se descargaron desde los enlaces públicos expuestos por la página;
  no se inició sesión ni se eludió el control de acceso.
- No se hizo transcodificación, recorte ni síntesis. La copia web conserva los bytes de descarga.
  Las ganancias se ajustan en el motor, sin modificar los archivos.
- Los tonos digitales de reacciones son efectos de Kenney, no voces humanas realistas.
- No se duplican archivos por botón. Seria y enojada reutilizan confirmación/error, en el
  canal de reacciones y con ganancia limitada a 0,25.

## Cuándo suena cada cosa

- **Iniciar:** desbloquea Web Audio. Solo entonces se solicita música de menú y se preparan
  efectos cortos de interfaz. Abrir la portada por sí solo no reproduce ni descarga audio.
- **Navegación:** transición breve al cambiar de pantalla; menú, configuración, instrucciones
  y temporada comparten música sin reiniciarla. Entrar en configuración prepara los sonidos
  de la partida sin esperar a que terminen ni bloquear peticiones de Express.
- **Partida creada / revancha:** señal de inicio y una sola música de competición.
- **Selección y apuntado:** selección al empezar un gesto válido; resortera una sola vez al
  superar el arrastre mínimo, no en cada movimiento. Cancelar o soltar detiene el efecto y
  también invalida su carga pendiente.
- **Tiro:** golpe de ficha al recibir la respuesta aceptada de Express, tanto humano como rival.
  Un tiro rechazado reproduce error, no impacto.
- **Poder:** señal al activar el botón; desactivarlo usa selección. No consume un tiro adicional.
- **Gol:** evento confirmado al terminar la animación, una sola vez.
- **Perro:** un ladrido cuando aparece en los cuadros confirmados; reanudar no repite el ladrido.
- **Emote:** solo después de aceptarlo Express. Feliz, eufórica, triste, sorpresa, enojada y seria
  tienen tono. Dormida conserva su animación sin voz.
- **Pausa:** música detenida, posición conservada y efectos interrumpidos; los controles de
  interfaz siguen habilitados. Reanudar continúa la pista sin repetir tiros, goles o perro.
  Una pausa aún sin confirmar o con error también mantiene el audio del juego detenido.
- **Final:** si no hubo gol final, señal breve de fin. Se detiene la música de competición.
  En resultado, una victoria humana usa el jingle de victoria; ganar el servidor usa derrota.
  Con dos personas se celebra al ganador sin elegir arbitrariamente un «usuario perdedor».
  El empate no usa jingle de victoria ni derrota. Los jingles no se repiten en bucle.
- **Salida:** cancela efectos y cargas pendientes antes de cambiar a la música correspondiente.

## Volúmenes, límites y fallos

«Sonido» en menú y pausa guarda silencio, volumen de música y volumen de efectos/interfaz
en `localStorage['tupay.audio.v1']`. Valores iniciales: música 25 % y efectos 60 %, además
de las ganancias individuales. Sin almacenamiento funciona en memoria.

Un solo `AudioContext`, descargas y buffers compartidos, máximo cuatro efectos simultáneos.
Cada recurso tiene intervalo mínimo. Se descartan efectos que tardan más de 350 ms en
estar listos: una conexión lenta puede omitir el primer sonido, nunca retrasar una jugada.
Las reacciones no se acumulan y ceden ante gameplay; los tonos reutilizados respetan esa
misma prioridad. Ocultar la pestaña detiene sonidos y conserva la posición de la música.

Silencio también evita la precarga. Los errores de descarga, decodificación o disponibilidad
de Web Audio no impiden jugar. Los avisos se muestran en los controles sin promesas rechazadas
sin manejar.

## Opcionales que no se incorporaron

- **Dormida:** sigue sin voz. [Fast Snore de bsmacbride](https://freesound.org/people/bsmacbride/sounds/108519/)
  es un candidato CC0 de 5 s, pendiente de selección/recorte; no es necesario para jugar.
- **Gruñido:** enojada usa un tono, no requiere otra voz. El candidato
  [Grognement de davidou](https://freesound.org/people/davidou/sounds/88462/) no se descargó.
- **Colisiones, pared y poste:** archivos reservados, sin conexión porque la API no informa contactos.
- **Gol fallado:** no existe un evento que distinga un intento de gol de cualquier tiro.
- **Silbato y cuenta regresiva:** no se añadieron. La señal digital cubre el inicio/final.

## Verificación y límites de la revisión

Al cierre: lint, tipos, build local, **113 unitarias y 53 E2E** aprobados. Chromium decodificó
los 23 OGG y comprobó duración/señal no nulas. Se probaron eventos una sola vez, pausa,
reanudación, cancelación, silenciamiento, errores, recursos ausentes y movimiento reducido.
Las métricas locales están en [docs/evidencias/fase-10-auditoria.md](../../docs/evidencias/fase-10-auditoria.md).

La revisión técnica no reemplaza escuchar varios ciclos y valorar el carácter de cada jingle
o reacción. Esa aprobación subjetiva de la mezcla sigue correspondiendo al autor.

## Agregar o reemplazar recursos

1. Verificar licencia del archivo concreto y conservar autor, página, nombre original y enlace de descarga.
2. Guardar el original en la categoría adecuada, con nombre descriptivo en minúsculas y sin espacios.
3. Si se convierte, registrar herramienta/parámetros y conservar el original.
4. Copiar el OGG web a la misma ruta relativa en `client/src/recursos/audio/`.
5. Actualizar `catalogo.json` y esta tabla; reutilizar IDs sin duplicar archivos.
6. Para bucles declarar `bucle: true`; ajustar ganancia e intervalo. Nunca disparar desde cada render.
7. Ejecutar lint, tipos, unitarias y E2E. Actualizar el conteo del inventario en la prueba si cambia.
