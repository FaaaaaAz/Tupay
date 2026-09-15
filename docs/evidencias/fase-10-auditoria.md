# Cierre técnico de la fase 10 — 15-09-2026

Verificación local de 10.8 y 10.9, contra Express sirviendo el build de producción.
No se realizó publicación, commit ni tag. La aprobación auditiva personal del autor sigue pendiente.

## Verificaciones

- `npm run lint` y `npm run typecheck`: aprobados.
- `npm run test:unit`: 113 aprobadas, ninguna omitida o fallida.
- `npm run test:e2e`: 53 aprobadas en 33,6 s, sin reintentos ni pruebas omitidas.
  El servidor de Playwright ejecutó `npm run build` antes de comenzar.
- 23 OGG descargables y decodificables en Chromium, con duración y señal no nulas.
- Las 23 copias web coinciden por SHA-256 con sus archivos descargados.
- Sin modificaciones de reglas, física o contratos de Express; sin dependencias nuevas.

## Audio y regresiones

La instrumentación observa `AudioContext`, buffers y fuentes reales, sin sustituir la reproducción.
Comprueba música única, fuentes que terminan, posición de reanudación, un solo gol, un ladrido por
aparición, emote aceptado y rechazo de tiro sin impacto. Cancelar apuntado invalida tanto fuentes
activas como descargas de resortera pendientes.

La suite conserva pausa autoritativa, relojes, rival, errores, salida de temporada, revancha,
precarga de imágenes, rodado y resultado. También pasa sin Web Audio/almacenamiento y con un
archivo de audio inválido. El recorrido normal de los controles no produce errores de consola.

## Accesibilidad y revisión visual

- Silencio y volúmenes persistidos; una partida completa termina sin sonido y sin descargar
  audio si se inició silenciada.
- Movimiento reducido desactiva giro y animaciones decorativas, conservando el desplazamiento
  necesario para entender el juego. Se comprobó también el resultado con esa preferencia.
- Teclado en botones, controles y sliders; foco inicial, contención y retorno del foco en
  modales, cierre con Escape, nombres y roles accesibles conservados.
- Controles de pausa revisados en 1280 × 720, 1366 × 768 y 1920 × 1080. En alturas bajas el
  diálogo permite desplazamiento interno sin encoger los controles.
- No se afirma conformidad WCAG completa: el apuntado sigue siendo por puntero; no se añadió
  un modo de disparo exclusivamente por teclado en esta fase.
- Evidencias: [pausa con audio](fase-10-audio-integrado.jpg) y
  [resultado en silencio y movimiento reducido](fase-10-resultado-silencio.jpg).

## Medición de rendimiento local

Un recorrido determinista se ejecutó con audio y en silencio; se tomaron 100 intervalos de
`requestAnimationFrame` durante el tiro. Es una muestra local, no una promesa de FPS en cualquier
equipo ni una medición del arranque en frío de Render.

| Medición | Con audio | Silenciado |
|---|---:|---:|
| Mediana entre cuadros | 16,7 ms | 16,7 ms |
| Percentil 95 | 16,7 ms | 16,8 ms |
| Máximo observado | 16,8 ms | 16,8 ms |
| Recursos de audio solicitados | 20 | 0 |
| Recursos decodificados | 20 | 0 |
| Datos PCM decodificados | 29.575.396 bytes | 0 bytes |

Cada URL se pidió una sola vez. Los tres recursos de contacto reservados no se precargaron.
La portada no crea `AudioContext` ni descarga audios antes del gesto inicial; `no-inline`
evita incrustar archivos pequeños en el JavaScript de arranque. No se creó otro bucle de
animación en producción para el audio: se observa la aparición del perro y las acciones/eventos
existentes, con refs para evitar repeticiones.

## Recortes explícitos

La voz dormida es opcional y no se añadió. Enojada y seria reutilizan tonos discretos.
Los contactos quedan reservados hasta tener una señal fiable; tampoco hay evento inventado
de «gol fallado». Inicio/final usa señal digital, no requiere silbato. No hay sonidos de público.
Ninguno de estos recortes altera las reglas del juego.
