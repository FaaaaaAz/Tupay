# Tupay — Introducción al proyecto

## Nombre y significado

**Tupay** es una palabra quechua registrada en diccionarios quechua-español con dos sentidos relacionados: como sustantivo significa "encuentro" o "choque", y como verbo significa "encontrarse" o, en su forma más física, "chocar" y "enfrentarse". Esa doble lectura —encuentro y choque— es exactamente lo que ocurre en cada tiro del juego: una tapita se encuentra con otra, o con la pelota, y de ese choque nace la jugada.

*Fuente: diccionarios de quechua-español consultados en septiembre de 2026 (por ejemplo, bab.la y Wiktionary).*

## Qué es Tupay

Tupay es un videojuego web de fútbol con tapitas —inspirado en el juego de movil "Soccer Stars" en version boliviana— desarrollado como proyecto final de la materia de Certificación en React. Dos equipos de 5 tapitas se turnan para lanzar sus fichas, como en el billar, con el objetivo de meter la pelota en el arco rival. El tablero es una cancha, las fichas llevan los colores de equipos reales de la Liga boliviana, y de fondo aparece un detalle que cualquier hincha boliviano reconoce: el perro que se mete a la cancha en pleno partido.

## Propósito del proyecto

El proyecto demuestra, de principio a fin, el flujo que pide la materia: una acción del jugador modifica el estado de la partida, React presenta el resultado, el frontend se comunica con Express mediante `fetch` y JSON, y el servidor conserva y decide sobre esa información. El objetivo no es acumular funciones, sino construir una partida completa, jugable, explicable y con una identidad propia.

## Experiencia de juego

- **Qué observa el usuario:** una cancha que ocupa casi toda la pantalla, con sus tapitas, la pelota, el marcador, el turno y los mensajes del partido siempre visibles.
- **Qué decide:** el modo de juego, su equipo, el estadio, si el perro está activo, y en cada turno qué tapita mueve, hacia dónde y con cuánta fuerza.
- **Cómo responde el sistema:** el servidor valida la jugada, simula el tiro con física propia (rebotes, choques, fricción), decide si hay gol y devuelve el recorrido para que React lo anime.
- **Cómo termina la partida:** con una victoria, un empate (solo en Liga) o, en el caso de una temporada completa, con una tabla de posiciones al final de todas las jornadas.

## Jugadores

- **1 jugador:** contra un rival controlado por el servidor.
- **2 jugadores:** en el mismo dispositivo, por turnos.
- **5 tapitas por equipo** en la cancha (5 contra 5).
- Dos equipos no pueden ser el mismo club en esta versión: sin camisetas alternativas todavía, jugar Bolívar contra Bolívar se prestaría a confusión. Queda anotado como mejora futura.

## Plataforma

Tupay se lanza únicamente para navegador de escritorio. No hay una versión adaptada para celular en esta entrega; todo el diseño y las pruebas se piensan para una pantalla de laptop en horizontal, que además es donde se hace la defensa.

## Equipos: identidad boliviana y derechos de autor

Los equipos son clubes reales de la División Profesional de Bolivia (ver la lista completa en `docs/reglas.md`), con sus nombres y colores propios. Los escudos y la presentación visual de cada equipo son **ilustraciones y animaciones propias**, no reproducciones de los escudos oficiales: se busca que cualquiera reconozca de qué equipo se trata sin copiar la identidad gráfica exacta del club.

Esta aplicación se publica con una URL pública para la defensa ante el docente. Si más adelante se quisiera una difusión más amplia (por ejemplo, compartir el enlace públicamente fuera del contexto académico), corresponde revisar los derechos de autor de cada club con más detalle y, si se busca ese alcance, consultar a los clubes involucrados si desean participar de forma oficial. Este proyecto, en su versión de examen, no pretende representar a los clubes de forma oficial ni obtener ningún beneficio comercial.

## Evolución de la idea

El concepto pasó por varias etapas antes de llegar a Tupay:

1. **Llamas del Altiplano.** Un juego de tablero sobre pastoreo y territorio en el altiplano. Se descartó porque, aunque cumplía los lineamientos, no tenía tanta identidad ni resultaba tan atractivo de jugar.
2. **Rey de la Ruta.** Un juego de minibuses paceños compitiendo por pasajeros en una ruta circular. Se descartó por el tiempo que tomaría construir y balancear un mapa completo de ciudad.
3. **Fútbol de tapitas.** Mientras jugaba el juego "Soccer Stars" en mi celular, me surgió la idea de adaptarlo con identidad boliviana: equipos de la Liga, estadios con efectos propios y, sobre todo, el perro que se mete a la cancha. Esta idea se adoptó porque es divertida, tiene mecánicas claras de física y turnos, y se presta naturalmente a las reglas que pide el examen (movimiento, interacción, estrategia y variabilidad).
4. **De un partido simple a Tupay.** La primera versión de la idea consideraba solo un partido suelto entre dos equipos fijos. La versión definitiva agrega dos modos completos —Eliminatoria y Liga— y convierte a Tupay en algo más cercano a una pequeña experiencia de temporada, no solo un partido aislado. El nombre definitivo, *Tupay*, se elige en esta etapa por su significado en quechua.

El detalle de cada decisión técnica y su justificación está en `docs/decisiones.md`.

## Documentos relacionados

- `docs/reglas.md`: reglas completas del juego, los dos modos, el perro, los estadios y las acciones inválidas.
- `docs/plan.md`: plan de trabajo por fases, desde el repositorio hasta la defensa.
- `docs/api.md`: contrato de la API, con solicitudes y respuestas JSON reales.
- `docs/boceto.md`: pantallas, identidad visual y recursos gráficos.
- `docs/investigacion.md`: pruebas E2E, despliegue en Render y tiempos medidos.
- `docs/decisiones.md`: decisiones técnicas y su justificación.
- `docs/uso-ia.md`: registro del uso de IA como asistente.
