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

## Cómo añadir una entrada

En cada cambio asistido se registra, de forma breve:

1. qué se pidió;
2. qué partes propuso o implementó la IA;
3. qué comandos, pruebas o comprobaciones se ejecutaron;
4. qué revisó personalmente el autor;
5. el hash del commit, una vez creado por el autor.

No se incluyen conversaciones completas, secretos, credenciales ni direcciones privadas.
