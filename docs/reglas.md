# Tupay — Reglas del juego

## Resumen

Tupay es un fútbol de tapitas por turnos, 5 contra 5, para 1 jugador (contra el servidor) o 2 jugadores (mismo dispositivo). Hay dos modos: **Eliminatoria**, un partido único a la mejor de varios goles, y **Liga**, una temporada completa de todos contra todos con tabla de posiciones. Un perro puede activarse para que, de forma aleatoria, se meta a la cancha y mueva la pelota.

## Equipos

Tupay reúne diez equipos de la Liga boliviana, elegidos por su identidad y por representar distintas ciudades del país. Esta lista es una decisión del autor para el juego, no necesariamente la tabla vigente de la temporada 2026 en curso.

| Equipo | Departamento | Estadio asignado en Tupay |
|---|---|---|
| Bolívar | La Paz | Hernando Siles |
| The Strongest | La Paz | Hernando Siles |
| Always Ready | El Alto | El Titán de Villa Ingenio |
| Blooming | Santa Cruz | Ramón Aguilera Costas |
| Oriente Petrolero | Santa Cruz | Ramón Aguilera Costas |
| Nacional Potosí | Potosí | Víctor Agustín Ugarte |
| Real Potosí | Potosí | Víctor Agustín Ugarte |
| Aurora | Cochabamba | Félix Capriles |
| Wilstermann | Cochabamba | Félix Capriles |
| San José | Oruro | Jesús Bermúdez |

Notas:

- Cada equipo se presenta con su nombre real y sus colores, pero con un escudo y una estética ilustrada y animada **propios**, no idénticos a los oficiales (ver `docs/introduccion.md`).
- **No puede jugarse un equipo contra sí mismo** en esta versión (por ejemplo, Bolívar contra Bolívar). Al no existir todavía camisetas alternativas, dos tapitas del mismo equipo en la misma cancha se prestarían a confusión. Queda documentado como mejora futura.
- Cada equipo tiene un estadio propio asignado. Ver la sección "Estadios" para el efecto de cada uno.

## Modos de juego

### Eliminatoria (partido único)

- Gana el primer equipo en anotar `golesParaGanar` goles.
- `golesParaGanar` es configurable de 1 a 5; el valor por defecto es 3.
- No existe el empate: la partida continúa hasta que alguien llega a la meta de goles.
- Es un **único partido**, contra el servidor o contra un amigo en el mismo dispositivo. No es un torneo ni una serie de eliminación entre varios equipos: el nombre "Eliminatoria" describe que no hay empate posible, no una fase de grupos ni un cuadro de llaves.

### Liga (temporada)

- Formato: todos los equipos participantes juegan entre sí **una vez** (una vuelta). Con los 10 equipos de Tupay, cada equipo juega 9 partidos.
- El jugador elige un equipo al crear la temporada y juega, uno a la vez, los partidos de su propio calendario contra cada rival.
- **En 2 jugadores:** cada persona elige su equipo. Cuando el calendario llega al partido entre ambos equipos, juegan ese partido entre sí en el mismo dispositivo. En los demás partidos de cada jugador (contra equipos que no controla la otra persona), antes de empezar se puede elegir si ese partido lo juega el servidor como rival, o si el segundo jugador prefiere controlar él mismo a ese equipo por esa vez, igual que cuando en el FIFA una persona toma el control del equipo que normalmente maneja la máquina.
- **Partidos que no involucran a ningún equipo humano:** para no obligar a jugar los demás partidos de cada jornada, se resuelven solos con una simulación rápida (un marcador generado con la semilla de la temporada), sin reproducir la física completa. Ocurre en cuanto las personas terminan sus partidos de esa jornada. Así la tabla avanza igual para todos los equipos, pero solo se juegan de verdad los partidos que involucran a una persona.
- **Orden:** los partidos se juegan jornada por jornada. No se puede adelantar un partido de una jornada posterior.
- **Partidos a medias:** si alguien sale de la cancha antes del final, o el servidor se reinicia, el partido no cuenta y se vuelve a empezar desde cero.
- **Duración de cada partido:** 90 minutos de juego que transcurren en un tiempo real configurable al crear la temporada. Por ejemplo, 5 minutos reales por lado equivalen a 10 minutos reales en total; 2,5 minutos por lado equivalen a 5 minutos en total. Si no se configura, el partido dura 5 minutos reales. El servidor controla ese reloj.
- **Tiempo por turno:** cada jugador tiene 15 segundos reales para patear. Si se agota, pierde el turno. Esta regla aplica en cualquier modo, no solo en Liga. El reloj del turno empieza cuando termina la animación del tiro anterior, para que nadie pierda segundos mirando cómo se mueven las tapitas.
- Un partido de Liga puede terminar en victoria o en **empate**.
- **Puntos:** victoria 3, empate 1, derrota 0.
- **Tabla de posiciones:** se ordena por puntos; en caso de igualdad, por diferencia de goles y luego por goles anotados. Si el empate sigue, lo decide un sorteo hecho con la semilla al crear la temporada.
- **Fin de la temporada:** cuando todos los partidos del calendario tienen resultado (jugado o resuelto por simulación), la temporada termina. El campeón es el equipo que encabeza la tabla.
- **Alcance de la temporada:** con los 10 equipos, cada jugador tiene 9 partidos en su calendario. Como los partidos sin humanos se resuelven por simulación rápida (ver arriba), jugar la temporada completa no significa jugar 9 partidos completos de física, solo los que de verdad involucran a una persona. Si en algún momento conviene acortarla, reducir la cantidad de equipos participantes es una opción válida: los equipos son datos, no lógica, así que no exige cambios de código, solo de configuración.

## Pausa y salida

- El botón **Pausar** o la tecla **Esc** detienen la partida, incluso durante la animación de un tiro.
- En pausa no avanza el turno, el reloj de Liga ni la duración/enfriamiento de los emotes. El rival
  espera y no se aceptan tiros ni emotes. Reanudar continúa la jugada desde el mismo cuadro.
- **Salir** abre una confirmación y pausa mientras se decide. Cancelar permite continuar; si se
  llegó desde el menú de pausa, vuelve a ese menú y la partida sigue pausada.
- Confirmar la salida descarta un partido sin terminar. En temporada queda pendiente para jugarlo
  nuevamente. Un resultado que Express ya confirmó se conserva, aunque todavía se esté mostrando
  la animación del último tiro.
- La pausa no guarda partidas entre recargas ni reinicios del servidor. Sigue aplicando la limitación
  del almacenamiento en memoria.

## El perro

- Se activa o desactiva al crear cada partido (por defecto, activado). Puede desactivarse tanto en Eliminatoria como en cada partido de una Liga.
- Cuando está activo, después de cada tiro hay una probabilidad de que aparezca (valor inicial sugerido: 12% por tiro, con un máximo de 5 apariciones por partido; ambos números son un punto de partida para ajustar al probar el juego).
- Se lleva la pelota a un punto de la cancha, casi siempre pasándola de un arco al otro, para "dar vuelta la tortilla".
- **Nunca genera gol por sí mismo:** si el perro deja la pelota dentro de un arco, el gol se anula y la pelota queda en esa posición.
- **El perro nunca genera doble turno.** Después de su aparición el turno pasa al rival de quien tiró, como en cualquier tiro. Si el perro deja la pelota cerca del arco del rival, el rival tira y puede defenderse; si la deja cerca del arco de quien tiró, esa es la mala suerte de la jugada: el perro ayudó al rival.

## Turno y tiro

1. El jugador de turno elige una de sus tapitas.
2. Arrastra hacia atrás desde la tapita para apuntar; una flecha muestra dirección y fuerza.
3. Opcionalmente, activa el tiro de poder antes de soltar.
4. Al soltar, el tiro se envía al servidor, que lo valida y lo simula hasta que todo se detiene.
5. El servidor devuelve el recorrido de todos los elementos y el nuevo estado; React lo anima.
6. El turno pasa al rival, también cuando aparece el perro: nunca hay doble turno.

Reglas del turno:

- Cada turno dura como máximo 15 segundos reales; si se agota, se pierde el turno.
- Solo se pueden lanzar tapitas propias.
- La pelota solo se mueve al ser golpeada o cuando la arrastra el perro.

## Tiro de poder

- Cada jugador dispone de 2 tiros de poder por partido (se restablecen en cada partido, no se acumulan entre partidos de una misma temporada).
- El tiro de poder aumenta en 50% la fuerza máxima del lanzamiento.
- Si la tapita lanzada con tiro de poder choca una pelota atrapada en un charco (de agua o de nieve), la libera de una sola vez, sin importar cuántos golpes le falten. Igual que un golpe común, no sirve en el mismo tiro en que la pelota cayó al charco.

## Emotes

Los emotes son la forma de festejar, quejarse o burlarse durante el partido, como en cualquier juego por turnos. No afectan la física ni las reglas: son solo expresión.

- El jugador puede lanzar un emote **en cualquier momento**, sea o no su turno.
- El emote se aplica a **todas sus tapitas en la cancha a la vez**: a las cinco les aparece la misma carita. No se elige una tapita.
- La carita dura **5 segundos** y después las tapitas vuelven a verse sin cara. Ese es su estado normal.
- Para no llenar la pantalla, cada jugador puede lanzar **un emote cada 15 segundos**. Mientras espera, el botón se ve deshabilitado con el tiempo restante.
- Hay siete caritas disponibles: dormido, enojado, enojado serio, feliz, feliz eufórico, llorando y sorprendido.
- Cada persona tiene su fila de caritas junto a su equipo, en el marcador. El equipo que maneja el servidor no tiene.
- El enfriamiento lo controla el servidor, igual que el resto de las acciones: el cliente pide el emote, el servidor lo acepta o lo rechaza, y React anima los 5 segundos.

## Física de la cancha

- La pelota y las tapitas rebotan en las paredes de la cancha, excepto en la boca del arco.
- Las tapitas no pueden entrar al arco: rebotan en la línea de gol. Solo la pelota puede entrar.
- Los elementos chocan entre sí y se frenan por fricción hasta detenerse.
- Después de un gol, todas las tapitas vuelven a su formación inicial, la pelota vuelve al centro y saca el equipo que recibió el gol.

## Rival controlado por el servidor (1 jugador)

El rival juega **por muestreo**. No usa minimax: en este juego las jugadas posibles son continuas (cualquier tapita, cualquier ángulo, cualquier fuerza) y el resultado depende de la física, así que no hay un árbol de jugadas que recorrer por completo.

1. **Arma tiros candidatos.** Primero, un tiro de billar por cada tapita propia: apunta al punto de la pelota opuesto al arco que ataca, con la fuerza justa para llegar con impulso, empezando por las tapitas que están detrás de la pelota. Si la dificultad pide más candidatos, el resto son variaciones al azar de esos tiros (hasta 0,4 radianes de desvío y 30 % de diferencia de fuerza).
2. **Simula cada candidato** con la misma física del juego, incluidos los charcos del estadio.
3. **Elige el de mejor puntuación.** El gol a favor vale 1000 puntos y el autogol resta 1000. Si no hay gol, suma hasta 100 por llevar la pelota hacia el arco rival y resta hasta 150 por dejarla a menos de 350 unidades del arco propio.
4. **Tira con error.** Al tiro elegido le suma un error de puntería al azar.

| Dificultad | Candidatos | Error máximo de puntería |
|---|---|---|
| Fácil | 3 | 0,30 radianes (unos 17°) |
| Medio | 12 | 0,12 radianes (unos 7°) |
| Difícil | 36 | 0,04 radianes (unos 2°) |

Solo gasta un tiro de poder cuando la pelota está atrapada en la nieve y le faltan dos golpes. Los candidatos y el error salen de la semilla del partido, así que es repetible. Antes de tirar espera un instante, para que se note de quién es el turno. El equipo del servidor no lanza emotes.

## Estadios

Por defecto, el partido se juega en el estadio del equipo local (ver la tabla de "Equipos"), pero al crear el partido se puede elegir cualquier otro: así se puede probar un efecto de cancha sin tener que cambiar de equipo. Los seis estadios se agrupan en tres climas, dos sedes por clima.

| Estadio | Ciudad | Efecto |
|---|---|---|
| Ramón Aguilera Costas | Santa Cruz | Cancha soleada y tranquila: sin efecto especial. |
| Félix Capriles | Cochabamba | Cancha soleada y tranquila: sin efecto especial. |
| Hernando Siles | La Paz | Charcos de agua que aparecen y desaparecen durante el partido (ver abajo). |
| Jesús Bermúdez | Oruro | Charcos de agua que aparecen y desaparecen durante el partido (ver abajo). |
| El Titán de Villa Ingenio | El Alto | Charcos de nieve que aparecen y desaparecen durante el partido (ver abajo). |
| Víctor Agustín Ugarte | Potosí | Charcos de nieve que aparecen y desaparecen durante el partido (ver abajo). |

**Cómo funcionan los charcos** (en los cuatro estadios que los tienen):

- Cada charco es una mancha ovalada de 170 × 80 unidades de cancha. Al empezar el partido ya hay dos, y después de cada tiro aparece uno nuevo con 40 % de probabilidad, sin pasar de tres a la vez.
- Aparecen en cualquier sector de la cancha, incluida, con algo de suerte, la línea de gol. Nunca nacen debajo de la pelota ni encima de otro charco.
- La pelota queda **atrapada** cuando su centro entra al charco: se detiene en el acto y se comporta como un poste, sin que ningún choque la mueva.
- Los golpes para liberarla **cuentan desde el tiro siguiente**. La tapita que la llevó al charco suele venir detrás y volver a tocarla; ese choque no la saca.
- Una pelota que se libera no vuelve a quedar atrapada en el mismo charco hasta que sale de él.
- Solo afectan a la pelota: las tapitas pasan por encima como si no estuvieran.
- Si el charco se seca con la pelota adentro, la pelota queda libre. Si el perro se la lleva, también. Después de un gol, la pelota vuelve libre al centro.

**Charcos de agua** (Hernando Siles y Jesús Bermúdez):

- Duran 2 tiros y luego se secan.
- Un solo choque de una tapita libera la pelota, pero sale con mucho menos impulso: el 40 % de la velocidad que le daría ese choque si estuviera libre.

**Charcos de nieve** (El Titán de Villa Ingenio y Víctor Agustín Ugarte):

- Misma dinámica que los de agua, pero más severa: hacen falta dos choques para liberar la pelota, y sale con apenas el 25 % del impulso.
- Duran 4 tiros.

Todos estos números están en `server/src/dominio/estadios/configuracionEstadios.ts`.

## Acciones inválidas

El servidor valida cada acción y rechaza las inválidas con un mensaje que se muestra en pantalla.

| Situación | Mensaje en pantalla |
|---|---|
| Ambos jugadores eligen el mismo equipo | "Elijan equipos distintos: todavía no hay camisetas alternativas" |
| Tirar fuera de turno | "No es tu turno" |
| Tirar con una tapita rival | "Ese jugador no es tuyo" |
| Tirar después de agotar el tiempo del turno | "Se acabó tu tiempo: pierdes el turno" |
| Fuerza o dirección fuera de rango | "Tiro inválido" |
| Usar el tiro de poder sin tener disponibles | "Ya no te quedan tiros de poder" |
| Lanzar un emote antes de que pasen 15 segundos del anterior | "Espera unos segundos para volver a usar un emote" |
| Lanzar un emote por el equipo que maneja el servidor | "Ese jugador no es tuyo" |
| Pedir un emote que no existe | "Ese emote no existe" |
| Crear una temporada con cero o más de dos equipos humanos | "Elige uno o dos equipos para jugar la temporada" |
| Jugar un partido de temporada de una jornada posterior | "Primero hay que terminar la jornada N" |
| Tomar el control del rival en una temporada de un solo jugador | "Solo un segundo jugador puede tomar el control del rival" |
| Volver a jugar un partido de temporada que ya tiene resultado | "Ese partido ya se jugó" |
| Tirar con la partida terminada | "La partida ya terminó" |
| `golesParaGanar` fuera de 1 a 5 (Eliminatoria) | "Elige una meta de goles entre 1 y 5" |

## Estados principales

- Posición y velocidad de cada tapita (5 por equipo) y de la pelota.
- Charcos en la cancha, con los tiros que les quedan, y si la pelota está atrapada y cuántos golpes le faltan.
- Turno actual y tiempo restante del turno.
- Minutos y segundos de partido (modo Liga) o goles rumbo a la meta (modo Eliminatoria).
- Marcador del partido.
- Tiros de poder restantes de cada jugador.
- Emote activo de cada jugador, con su tiempo restante y su enfriamiento.
- Apariciones del perro y si está activado.
- Estado del partido: en juego o finalizado.
- En una temporada de Liga: calendario, resultados jugados o simulados, y tabla de posiciones.

## Configuración para pruebas

Al crear un partido o una temporada se pueden enviar valores opcionales para que las pruebas E2E sean repetibles y rápidas:

- `semilla`: fija el sorteo del saque, los obstáculos del estadio, las apariciones del perro y los tiros candidatos del rival.
- `golesParaGanar`: por ejemplo, 1 para terminar una Eliminatoria con un solo gol.
- `duracionRealSegundos`: duración real total de un partido de Liga (por ejemplo, 5 segundos en vez de varios minutos).
- `limiteTurnoSegundos`: duración real de cada turno.
- `perroActivo` y `probabilidadPerro`: para desactivar el perro o forzar su aparición en una prueba puntual.
- `duracionEmoteSegundos` y `esperaEmoteSegundos`: para acortar los 5 segundos de la carita y los 15 de enfriamiento.
- `equipos`: lista de equipos participantes de una temporada, para probar con menos de los 10 equipos completos.

## Evolución de las reglas

1. **Primera versión:** un solo partido entre dos equipos fijos, sin modos ni temporada.
2. **Empate y duración:** se probó primero un límite de tiros y luego un reloj fijo; ambos se sintieron artificiales.
3. **Dos modos definitivos:** Eliminatoria (partido único a una meta de goles, sin empate) y Liga (reloj de 90 minutos acelerado, con empate y puntos 3-1-0), cada uno resolviendo el problema del empate de forma distinta.
4. **De un partido a una temporada:** Liga se amplía de "un partido con reloj" a una temporada de todos contra todos con los equipos reales de la División Profesional, tabla de posiciones y la posibilidad de que el segundo jugador controle al equipo rival en vez de la máquina.
5. **El perro, versión final:** en vez de pasar el turno siempre al rival después de su aparición, el turno pasa al equipo cuyo arco está más cerca de donde quedó la pelota, para que pueda defenderse si el perro la deja cerca de su propio arco.
6. **Equipos reales:** se pasó de un puñado de equipos inventados a diez equipos reales de la Liga boliviana, uno o dos por cada plaza futbolística importante del país, con la aclaración de que los escudos son ilustraciones propias y no reproducciones oficiales.
7. **Emotes:** al dibujar las tapitas aparecieron caritas propias como recurso visual. En vez de dejarlas como decoración fija, se convirtieron en una acción del jugador: una carita que se aplica a todas sus tapitas, dura 5 segundos y tiene 15 segundos de enfriamiento para que nadie pueda llenar la pantalla.
8. **Charcos, versión final:** al probarlos se vio que la tapita que manda la pelota al charco suele venir detrás y volver a tocarla, así que la pelota salía en el mismo tiro en que caía. Desde entonces los golpes para liberarla cuentan recién desde el tiro siguiente.
9. **Rival por muestreo:** el rival simple, que solo apuntaba como en el billar, pasó a probar varios tiros con la física del juego y elegir el mejor. Su tiro de billar sigue existiendo como punto de partida de los candidatos.
10. **El perro sin doble turno:** dar el turno al equipo del arco más cercano a la pelota (versión 5) permitía que alguien tirara dos veces seguidas, y más veces si el perro volvía a aparecer. Ahora el turno siempre pasa al rival de quien tiró. Si el perro deja la pelota cerca del arco de quien tiró, el perro ayudó al rival.
