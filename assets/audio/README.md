# Audio de Tupay

## Estado actual

**23 archivos: 15 Ogg Vorbis, 7 MP3 y 1 WAV, 2.150.583 bytes (2,05 MB).**
No hay hinchada, cánticos ni ambiente de público. El único audio sintetizado es el aplauso del
empate, generado con un script propio (ver más abajo).

`catalogo.json` centraliza rutas, autores, licencia, estado, canales, ganancias, intervalos
y la propiedad `bucle`. Las URLs de Vite tienen hash y `no-inline`: importar el catálogo
no incorpora los bytes del sonido al JavaScript ni los descarga al cargar la portada.

## Inventario y licencias

Los recursos descargados están publicados bajo
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), que permite reutilización y
adaptación incluso comercial. Se conserva la autoría aunque atribuir no sea obligatorio.
Las licencias de los paquetes de Kenney que siguen en uso están en `licencias/`.
Los siete sonidos que reemplazaron a los anteriores (choque, patear, pared, poder, pitido, ganador y
perdedor) los aportó el autor del proyecto: su origen y licencia quedan **pendientes de registrar** en
`catalogo.json`, y conviene completarlos antes de difundir el juego fuera del ámbito académico.
Las páginas de Ansimuz y MatiasVME enlazadas debajo identifican autor y licencia.
La procedencia exacta de los dos recursos nuevos se registra en [licencias/freesound.md](licencias/freesound.md).

«Integrado» significa conectado al flujo real. Todos los recursos del catálogo lo están: los que
dejaron de usarse se borraron, junto con las licencias de los paquetes que ya no aportan ninguno.
Los nombres de victoria, derrota y emociones describen su uso en Tupay, no títulos del autor.

| Archivo y categoría | Archivo original | Autor y página original | Licencia | Estado |
|---|---|---|---|---|
| `music/menu/exploracion.ogg` | `exploration.ogg` | [ansimuz](https://opengameart.org/content/chiptune-exploration) | CC0-1.0 | integrado |
| `music/gameplay/competicion.ogg` | `Crazy_0.ogg` | [MatiasVME](https://opengameart.org/content/chiptune-loop-crazy) | CC0-1.0 | integrado |
| `music/results/ganador.mp3` | `ganador.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
| `music/results/perdedor.mp3` | `perdedor.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
| `music/results/aplausos.wav` | `aplausos.wav` | Tupay (síntesis propia), `scripts/generar-aplausos.mjs` | CC0-1.0 | integrado |
| `sfx/gameplay/collision/choque.mp3` | `choque.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
| `sfx/gameplay/kick/patear.mp3` | `patear.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
| `sfx/gameplay/bounce/pared.mp3` | `pared.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
| `sfx/gameplay/goal/gol-arcade.ogg` | `powerUp8.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/ui/click/clic.ogg` | `click_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/ui/selection/seleccion.ogg` | `select_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/ui/confirmation/confirmacion.ogg` | `confirmation_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/ui/error/error.ogg` | `error_004.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/transitions/transicion.ogg` | `back_001.ogg` | [Kenney](https://kenney.nl/assets/interface-sounds) | CC0-1.0 | integrado |
| `sfx/transitions/pitido.mp3` | `pitido.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
| `sfx/transitions/fin-partido.ogg` | `lowThreeTone.ogg` | [Kenney](https://kenney.nl/assets/digital-audio) | CC0-1.0 | integrado |
| `sfx/gameplay/power-up/poder.mp3` | `poder.mp3` | Aportado por el autor del proyecto (fuente: pendiente de registrar) | Pendiente de registrar | integrado |
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
- No se hizo transcodificación ni recorte: los OGG descargados y los MP3 aportados se publican con
  sus bytes originales. La única síntesis es `music/results/aplausos.wav`, que genera
  `scripts/generar-aplausos.mjs` con ruido filtrado y una semilla fija, sin grabaciones.
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
- **Carruseles:** cada flecha de equipo o estadio suena con el clic de la interfaz.
- **Partida creada / revancha:** pitido inicial, como el del árbitro, y una sola música de competición.
- **Selección y apuntado:** selección al empezar un gesto válido; resortera una sola vez al
  superar el arrastre mínimo, no en cada movimiento. Cancelar o soltar detiene el efecto y
  también invalida su carga pendiente.
- **Golpes:** Express informa en `contactos` en qué cuadro del recorrido una tapita tocó la pelota
  (patear), chocó con otra tapita (choque) o rebotó en una pared o un poste (pared). Cada golpe suena
  cuando la animación llega a ese cuadro, en tiros humanos y del rival. Los golpes más suaves que 60
  unidades por segundo no suenan, y pausar no los repite. Un tiro rechazado suena a error, sin golpes.
- **Poder:** señal al activar el botón; desactivarlo usa selección. No consume un tiro adicional.
- **Gol:** evento confirmado al terminar la animación, una sola vez.
- **Perro:** un ladrido cuando aparece en los cuadros confirmados; reanudar no repite el ladrido.
- **Emote:** solo después de aceptarlo Express. Feliz, eufórica, triste, sorpresa, enojada y seria
  tienen tono. Dormida conserva su animación sin voz.
- **Pausa:** música detenida, posición conservada y efectos interrumpidos; los controles de
  interfaz siguen habilitados. Reanudar continúa la pista sin repetir tiros, goles o perro.
  Una pausa aún sin confirmar o con error también mantiene el audio del juego detenido.
- **Final:** si no hubo gol final, señal breve de fin. Se detiene la música de competición.
  En resultado suena «ganador» cuando gana una persona, contra el servidor o en dos jugadores;
  «perdedor» solo cuando gana el servidor, así que con dos personas nunca suena. El empate suena a
  aplausos. Ninguno se repite en bucle.
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
- **Gol fallado:** no existe un evento que distinga un intento de gol de cualquier tiro.
- **Cuenta regresiva:** no se añadió. El pitido marca el inicio y la señal digital, el final.

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
4. Copiar el archivo web (OGG, MP3 o WAV) a la misma ruta relativa en `client/src/recursos/audio/`.
5. Actualizar `catalogo.json` y esta tabla; reutilizar IDs sin duplicar archivos.
6. Para bucles declarar `bucle: true`; ajustar ganancia e intervalo. Nunca disparar desde cada render.
7. Ejecutar lint, tipos, unitarias y E2E. La prueba de recursos cuenta sola los archivos de `client/src/recursos/audio/`.
