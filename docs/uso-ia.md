# Tupay — Registro de uso de IA

Este documento registra cómo se utilizó asistencia de IA durante el proyecto. La IA puede proponer e
implementar cambios, pero el autor revisa el resultado, ejecuta o confirma las pruebas necesarias y realiza
manualmente los commits y el push.

| Fecha | Solicitud | Aporte de la IA | Verificación técnica | Revisión personal del autor | Commit |
|---|---|---|---|---|---|
| 14-09-2026 | Organizar las mejoras finales de diseño, UX, animaciones, pausa, modales, audio y rodado de la pelota. | Reorganizó las fases pendientes de `docs/plan.md` y dividió el pulido audiovisual en tareas pequeñas y priorizadas. | `git diff --check` sin errores. | Pendiente de registrar por el autor. | `5dc35c6` |
| 14-09-2026 | Completar las reglas de trabajo con IA y verificar el despliegue automático pendiente. | Creó `AGENTS.md`, este registro y comprobó el pipeline y la versión publicada antes de actualizar el plan. | Workflow #12 en verde en 3 min 35 s; `/api/salud`, `main` y `origin/main` coincidieron en `5dc35c6`. | Pendiente de registrar por el autor. | Pendiente |

## Implementación de la fase 10

### Tareas 10.1–10.4 — 14 de septiembre de 2026

- **Solicitud:** implementar robustez de interacción, modales, pausa real y rodado del balón;
  mejorar la presentación de esos controles y la carga inicial de imágenes.
- **Aporte de la IA:** código React/CSS y Express, contrato `pausada`, endpoints de pausa,
  reanudación y abandono; precarga/decodificación y caché de imágenes; pruebas y documentación.
- **Verificado por el agente:** lint y tipos; 103 pruebas unitarias; suite previa de 25 E2E más
  13 recorridos nuevos; build de producción y revisión visual en tres resoluciones de escritorio.
- **Verificación personal del autor:** pendiente. Probar especialmente `Esc`, pausa durante un tiro,
  salir/cancelar en temporada y el rodado con movimiento reducido activado/desactivado.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Tareas 10.5–10.6 — cierre el 15 de septiembre de 2026

- **Solicitud:** mejorar la respuesta visual de las jugadas y unificar fondos, tarjetas y modales.
- **Aporte de la IA:** medidor de potencia, resaltado del poder, avisos de eventos y animaciones
  cortas; variables CSS compartidas, patrones, iluminación e iconos SVG del menú. Conservó
  imágenes, precarga y caché existentes, sin cambiar reglas ni física de Express.
- **Verificado por el agente:** lint y tipos; 103 pruebas unitarias; reporte completo de 42 E2E
  aprobados sin fallos ni pruebas inestables, con build de producción local; revisión de capturas
  en las tres resoluciones de escritorio del plan. Cuatro pruebas E2E nuevas y cuatro capturas
  seleccionadas en `docs/evidencias/`.
- **Corrección durante la verificación:** la etiqueta del poder inicialmente desplazaba la cancha
  y alteraba el porcentaje del arrastre. Se posicionó fuera del flujo y el E2E confirmó el 50 %.
- **Verificación personal del autor:** pendiente. Revisar sensación del apuntado, legibilidad de
  avisos y diseño de menú, configuración, temporada y resultado.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Tarea 10.7 — 15 de septiembre de 2026

- **Solicitud:** organizar y conseguir audio legal, preparar reproducción centralizada y controles;
  no usar hinchada ni modificar diseño/mecánicas, ejecutar solo 10.7.
- **Aporte de la IA:** buscó y descargó 21 OGG publicados con CC0, conservó licencias e inventario;
  creó el motor Web Audio, persistencia, canales y controles de menú/pausa. Conectó música al
  pulsar Iniciar y prueba manual del clic. Preparó los demás recursos sin dispararlos en jugadas.
- **Pendientes explícitos:** descarga del ladrido de Freesound, selección/recorte de voces cómicas,
  resortera y conexión de eventos de 10.8. Se corrigió el plan para excluir hinchada.
- **Verificado por el agente:** lint, tipos, build; 109 unitarias y 47 E2E aprobados. Decodificación
  real de los 21 recursos en Chromium, sin archivos vacíos; persistencia, silencio, música única,
  teclado y degradación segura. Capturas de pausa con controles en tres tamaños de escritorio.
- **Verificación personal del autor:** pendiente escuchar varios ciclos musicales y juzgar
  volumen, repetición, carácter de las reacciones y adecuación de jingles a victoria/derrota.
  La IA no afirma haber realizado esa evaluación auditiva subjetiva.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Tareas 10.8–10.9 — 15 de septiembre de 2026

- **Solicitud:** integrar los sonidos y completar la revisión audiovisual para cerrar fase 10.
- **Aporte de la IA:** obtuvo vistas previas públicas CC0 de perro/resortera, conectó música,
  tiros, goles, poder, emotes y transiciones a acciones/confirmaciones reales; conectó pausa,
  conservación de posición y cancelación de cargas. Actualizó inventario/licencias sin
  añadir dependencias ni cambiar la simulación.
- **Verificado por el agente:** lint, tipos, build local, 113 unitarias y 53 E2E aprobados;
  decodificación de los 23 archivos y comparación SHA-256 de originales/copia web. Auditoría
  de eventos sin repeticiones, silencio, movimiento reducido, teclado de controles/modales y
  tiempos entre cuadros con/sin audio. Evidencia en `docs/evidencias/fase-10-auditoria.md`.
- **Recortes documentados:** dormida sin voz; tonos reutilizados para enojada/seria; contactos
  y gol fallado sin sonidos por falta de eventos fiables. No se incorporó hinchada.
- **Verificación personal del autor:** pendiente escuchar bucles y mezcla, revisar sensación de
  resortera/tiro y adecuación de los jingles. No se afirma una evaluación auditiva subjetiva de la IA.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni tags.

### Ilustraciones del menú y fondo de los paneles — 15 de septiembre de 2026

- **Solicitud:** reemplazar los iconos de las cuatro tarjetas del menú por las ilustraciones
  que el autor agregó a `assets/UI/`, usar `fondoCards.png` como fondo de las pantallas de
  configuración, optimizar las imágenes sin perder calidad y borrar el código que quedara sin uso.
- **Aporte de la IA:** grupos `tarjetas` y `paneles` en `scripts/optimizar-recursos.mjs`
  (11,2 MB en PNG a 377 kB en WebP); ilustraciones centradas en las tarjetas, fondo compartido
  con precarga desde el menú y panel translúcido. Borró `IconoDeModo`, su estilo y los patrones
  CSS del fondo anterior. Sumó una comprobación a la prueba E2E de presentación.
- **Verificado por el agente:** lint, tipos, unitarias y E2E; revisión de las capturas del menú,
  configuración y temporada en 1280 × 720, 1366 × 768 y 1920 × 1080.
- **Verificación personal del autor:** pendiente. Revisar el tamaño de las ilustraciones y la
  lectura de los paneles sobre el estadio.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Árbitro y silbato en la pausa — 15 de septiembre de 2026

- **Solicitud:** reemplazar el símbolo de pausa de los modales por la ilustración `assets/UI/pausa.png`
  y hacer sonar el silbato al pausar.
- **Aporte de la IA:** grupo `pausa` en `scripts/optimizar-recursos.mjs` (1,5 MB a 34 kB), ilustración
  en `Modal` y en la precarga de la partida. Reutilizó `pitido.mp3` y ajustó `MotorAudio` para que la
  pausa no cortara el silbato: pausa idempotente y canal `interfaz` como alternativo.
- **Verificado por el agente:** lint, tipos, unitarias (con una prueba nueva) y E2E (la de audio en
  juego cuenta un solo silbato por pausa); revisión de la captura del modal de pausa.
- **Verificación personal del autor:** pendiente. Escuchar el silbato al pausar con el botón y con
  `Esc`, y juzgar si su duración resulta cómoda.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Duración con radios, opciones centradas y perro ilustrado — 15 de septiembre de 2026

- **Solicitud:** cambiar el `select` de duración por radios, centrar todos los grupos de opciones
  y mostrar al perro junto a su casilla, sin que el formulario tenga que desplazarse.
- **Aporte de la IA:** radios de duración en `Configuracion` y `ConfigurarTemporada`, grupos y
  etiquetas centrados, píldora del perro con estado a color o apagado, ajuste de espacios para
  pantallas bajas y borrado de los estilos de `select` y `.campo`.
- **Verificado por el agente:** lint, tipos, unitarias y E2E. La prueba de presentación comprueba
  que Eliminatoria, Liga y Configurar temporada no se desplazan en 1280 × 720, 1366 × 768 y
  1920 × 1080; se revisaron sus capturas.
- **Verificación personal del autor:** pendiente. Revisar el tamaño del perro y el centrado en la
  pantalla de uso habitual.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Árbitro y sonido de salir, sonidos de opciones y ladrido del perro — 15 de septiembre de 2026

- **Solicitud:** usar `salir.png` y `salir.mp3` solo en el modal de salir, hacer sonar los radios de
  la configuración como las flechas de los carruseles, y que activar al perro suene a ladrido, con la
  casilla desactivada al empezar.
- **Aporte de la IA:** movió el audio a `assets/audio/sfx/transitions/` con su copia web y entrada de
  catálogo; grupo `modales` en `scripts/optimizar-recursos.mjs` (1,5 MB a 32 kB); ilustración como
  prop de `Modal`; sonido de entrada por modal en `Partida`; componentes `GrupoDeOpciones` y
  `CasillaDelPerro`; función `sonarAlElegir` compartida con el carrusel.
- **Verificado por el agente:** lint, tipos, unitarias y E2E, con una prueba nueva del modal de salir
  y la del perro ajustada al ladrido de la configuración.
- **Verificación personal del autor:** pendiente. Escuchar el sonido de salir, el clic de los radios
  y el ladrido al activar al perro, y confirmar la licencia de `salir.mp3`.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

### Título ilustrado, cabeceras, ícono de sonido y reloj con segundos — 15 de septiembre de 2026

- **Solicitud:** centrar los títulos de las tarjetas y de los paneles, destacar «Volver», cambiar la
  palabra «Sonido» por un ícono, reemplazar el título y el lema del menú por la imagen `titulo`,
  mostrar los segundos del reloj de Liga y usar la imagen `marcador` de fondo del marcador.
- **Aporte de la IA:** grupo `interfaz` en `scripts/optimizar-recursos.mjs` (título de 1,5 MB a
  123 kB; marcador de 496 kB a 42 kB); cabecera en grilla y botón «Volver»; ícono SVG en
  `ControlesAudio`; componente `RelojDeLiga` que cuenta por cuadro; fondo y relleno del marcador;
  pruebas de audio por nombre accesible y prueba de que el reloj avanza.
- **Verificado por el agente:** lint, tipos, unitarias y E2E; capturas de menú, configuración,
  temporada, pausa y cancha de Liga en escritorio.
- **Verificación personal del autor:** pendiente. Jugar una Liga para ver correr los segundos y
  revisar que el fondo del marcador no tape escudos ni emotes en la pantalla habitual.
- **Publicación y commit:** pendientes; no se ejecutaron commits, push ni despliegues.

## Cómo añadir una entrada

En cada cambio asistido se registra, de forma breve:

1. qué se pidió;
2. qué partes propuso o implementó la IA;
3. qué comandos, pruebas o comprobaciones se ejecutaron;
4. qué revisó personalmente el autor;
5. el hash del commit, una vez creado por el autor.

No se incluyen conversaciones completas, secretos, credenciales ni direcciones privadas.
