# Tupay — Decisiones técnicas y riesgos

Cada decisión de este documento responde tres preguntas: qué se decidió, por qué, y qué alternativa
se descartó. Los riesgos incluyen la señal que los delata a tiempo y cómo se mitigan.

## Decisiones de arquitectura

### La física vive en el servidor

**Decisión.** Express recibe el tiro, lo simula completo hasta que todo se detiene y devuelve el
recorrido ya calculado. React solo reproduce esos cuadros.

**Por qué.** Es lo que convierte a Express en participante real de la partida y no en un almacén de
puntajes. Si la física estuviera en el navegador, el servidor no decidiría nada importante y el
proyecto no cumpliría el requisito de que la lógica crítica no exista solo en el cliente.

**Alternativa descartada.** Simular en React y mandar el resultado al servidor para que lo guarde.
Es más simple y más fluido visualmente, pero cualquiera podría enviar el resultado que quisiera, y
deja a Express sin ninguna responsabilidad defendible.

**Costo aceptado.** Hay una espera de red por cada tiro. Se compensa animando en el cliente el
recorrido completo, de modo que el jugador ve el movimiento continuo y no una espera seguida de un
salto.

### React anima, pero no decide

**Decisión.** Al terminar la animación, el cliente descarta sus posiciones intermedias y aplica el
estado que devolvió Express.

**Por qué.** Evita que el redondeo o un cuadro perdido dejen al navegador mostrando una posición
distinta de la que el servidor tiene guardada. Si vuelven a consultar la partida, todo coincide.

### `compartido/` solo contiene tipos

**Decisión.** Las entradas y salidas de la API están tipadas en `compartido/` y se importan con
`import type` desde ambos lados.

**Por qué.** Un cambio en el contrato rompe la compilación del cliente y del servidor a la vez, en
vez de fallar recién en tiempo de ejecución. Y como son tipos, desaparecen al compilar: no se
comparte código ejecutable entre dos entornos distintos.

**Alternativa descartada.** Un paquete compartido con funciones de validación. Habría obligado a
configurar workspaces y a resolver el mismo módulo en Node y en el navegador, a cambio de poco.

### El catálogo de equipos y estadios se pide al servidor

**Decisión.** Los diez equipos y los seis estadios viven en el dominio del servidor y se sirven por
`GET /api/equipos` y `GET /api/estadios`. El cliente no los tiene escritos.

**Por qué.** Demuestra comunicación real con el backend en la primera pantalla y hace que agregar o
quitar un equipo sea un cambio de datos en un solo archivo del servidor. Las imágenes sí viven en el
cliente, porque son presentación.

### Un solo `package.json` en la raíz

**Decisión.** Un único paquete; `compartido/`, `client/` y `server/` se separan por su `tsconfig`, no
por paquetes distintos.

**Por qué.** Con workspaces habría que explicar hoisting, dependencias duplicadas y rutas de
resolución. Para tres carpetas con un solo despliegue, no compensa.

### Azar con semilla

**Decisión.** Todo lo variable —el sorteo del saque, los charcos, las apariciones del perro, los
tiros candidatos del rival y los resultados simulados de la temporada— sale de un generador con
semilla, y la semilla se puede fijar al crear la partida.

**Por qué.** Sin esto no se pueden escribir pruebas E2E confiables sobre un juego con azar: cada
ejecución daría un resultado distinto y las pruebas fallarían de forma intermitente.

### Campos que no aplican viajan como `null`

**Decisión.** `reloj` es `null` en Eliminatoria, `golesParaGanar` es `null` en Liga, `resultado` es
`null` mientras el partido sigue.

**Por qué.** `JSON.stringify` descarta `undefined`, así que un campo opcional simplemente desaparece
del JSON y el cliente no puede distinguir "no aplica" de "el servidor se olvidó de mandarlo".

### Repositorio en memoria

**Decisión.** Las partidas y las temporadas viven en memoria del proceso, sin base de datos.

**Por qué.** El alcance del examen no necesita persistencia, y una base de datos agregaría una
dependencia externa, credenciales y un servicio más que puede fallar durante la defensa.

**Limitación aceptada y documentada.** Cada reinicio o deploy borra las partidas en curso. El plan
gratuito de Render además duerme el servicio tras 15 minutos sin visitas. La aplicación lo maneja
mostrando un mensaje claro y ofreciendo crear otra partida, en vez de quedarse en blanco.

### La temporada es una capa sobre la partida

**Decisión.** El módulo de temporada genera el calendario, lleva la tabla y crea partidas usando el
mismo motor de la Fase 5, sin modificarlo.

**Por qué.** Si la temporada tuviera su propia versión de las reglas, habría dos lugares donde
arreglar cada error. Además permite recortarla sin tocar el núcleo si el tiempo no alcanza.

### Los partidos sin humanos se resuelven por simulación rápida

**Decisión.** En una temporada de diez equipos, los partidos entre equipos que no controla nadie se
resuelven con un marcador generado con la semilla, sin física completa.

**Por qué.** La alternativa sería jugar decenas de partidos que nadie miraría, o dejar la tabla
incompleta. Así la tabla avanza para los diez equipos y solo se juegan de verdad los partidos donde
hay una persona.

### Sin librerías de interfaz

**Decisión.** CSS propio, sin React Router, sin librerías de estado y sin motor de juego.

**Por qué.** El examen lo prohíbe explícitamente. Con seis pantallas, un `switch` sobre una variable
de estado de React cumple el papel del router y es más fácil de explicar.

### SVG para la cancha

**Decisión.** La cancha, las tapitas y la pelota se dibujan en SVG, no en `<canvas>`.

**Por qué.** Cada elemento existe en el DOM, así que Playwright puede localizarlo y el CSS propio se
aplica de verdad. Con `<canvas>` todo sería un solo elemento opaco y las pruebas tendrían que
mirar píxeles.

**Costo aceptado.** SVG es más lento que canvas con muchos elementos, pero aquí hay once objetos en
movimiento: no se nota.

### Recursos: originales pesados, versiones livianas

**Decisión.** `assets/` guarda los originales (46 MB) y no se publica; `client/src/recursos/` tiene
las versiones WebP que usa el juego (2,2 MB), generadas con `scripts/optimizar-recursos.mjs`.

**Por qué.** Las tapitas venían en 1254 px y se ven a unos 50 px en la cancha. Publicar 46 MB en el
plan gratuito de Render haría que la primera carga tardara una eternidad, justo durante la defensa.

**Autoría.** Todas las imágenes son ilustraciones propias generadas para este proyecto. Ningún equipo
aparece con su escudo oficial: las tapitas llevan los colores y el nombre del club, que es lo que
permite reconocerlo, sin reproducir la identidad gráfica registrada. No se usó ninguna imagen de
terceros con licencia que exija atribución.

### Los arcos se dibujan por encima de todo

**Decisión.** El arco es una imagen sobrepuesta, en la capa más alta, y el mismo archivo sirve para
los dos lados volteándolo en espejo horizontal.

**Por qué.** Dibujado encima, la pelota se ve entrando *dentro* del arco. Si fuera al fondo, la
pelota pasaría por delante de la red y el gol no se leería. Voltear en espejo y no rotar mantiene
correcta la perspectiva del dibujo.

### El rival no usa minimax

**Decisión.** El rival del servidor genera varios tiros candidatos hacia la pelota, los simula con la
misma física del juego y ejecuta el de mejor puntuación, con un error de puntería según la dificultad.

**Por qué.** Minimax necesita un árbol de jugadas finito. Aquí las jugadas son continuas —cualquier
tapita, cualquier ángulo, cualquier fuerza— y el resultado depende de la física, así que no hay árbol
que recorrer. El muestreo reutiliza el motor que ya existe.

## Decisiones de la física

Todos los números de esta sección viven en `server/src/dominio/fisica/configuracionFisica.ts`. Para
cambiar cómo se siente el juego no hace falta tocar ningún otro archivo.

### Pasos fijos con subpasos

**Decisión.** La simulación avanza en pasos fijos de 1/60 de segundo, y cada paso se divide en 8
subpasos.

**Por qué.** Con un paso variable, el mismo tiro daría resultados distintos según la velocidad de la
máquina, y no se podrían escribir pruebas repetibles. Los subpasos evitan el *efecto túnel*: a
velocidad máxima un cuerpo avanza unas 4 unidades por subpaso, muy por debajo del radio de la pelota
(18), así que dos cuerpos nunca llegan a atravesarse entre un cálculo y el siguiente.

**Alternativa descartada.** Detección continua de colisiones, que calcula el instante exacto de cada
choque. Es más precisa, pero bastante más difícil de explicar y de probar, y con estas velocidades no
hace falta.

### La fricción es una retención por segundo

**Decisión.** Cada cuerpo conserva una fracción fija de su velocidad por cada segundo que rueda: 25 %
las tapitas y 35 % la pelota. Por debajo de 8 unidades por segundo se da por detenido.

**Por qué.** Es un solo número por cuerpo, fácil de ajustar en la defensa, y no depende del tamaño del
paso porque se aplica como `retencion ** dt`. La pelota conserva más velocidad que las tapitas para
que ruede más lejos, como una pelota real frente a una chapa. El umbral de detención existe porque
una retención nunca llega a cero exacto: sin él, la simulación no terminaría.

### Los choques se resuelven por impulso

**Decisión.** Cuando dos círculos se enciman, primero se separan en proporción a su masa y después
intercambian impulso sobre la línea que une sus centros, con un rebote de 0,9. La pelota pesa 0,6 y
las tapitas 1.

**Por qué.** Es el modelo físico más simple que produce choques creíbles. Como la pelota es más
liviana, sale despedida más rápido que la tapita que la golpea, que es lo que se espera en el juego.

**Los postes son cuerpos fijos.** Cada poste es un círculo con masa infinita (`masaInversa: 0`) que
pasa por la misma función de choques. Así un tiro puede pegar en el palo sin escribir un caso
especial.

### La física no sabe de equipos

**Decisión.** La simulación informa en qué arco entró la pelota (`"izquierdo"` o `"derecho"`), no qué
equipo anotó.

**Por qué.** Qué arco defiende cada equipo es una regla del partido, que se decide en la Fase 5. Así
la física se puede probar sin crear partidas, y las dependencias van en un solo sentido: las reglas
usan la física, nunca al revés.

### Los cuadros del recorrido se redondean

**Decisión.** Se guarda un cuadro cada 2 pasos (30 cuadros por segundo) y sus posiciones se redondean
a un decimal. El estado final conserva la precisión completa.

**Por qué.** Un decimal alcanza para dibujar, y el ahorro es considerable. Medido: un tiro con una
tapita pesa entre 7 y 11 kB, y un tiro que mueve las diez tapitas, 29 kB con 114 cuadros y 3,8
segundos de animación. Redondear solo los cuadros, y no el estado, evita que el error se acumule
turno tras turno.

### Pruebas unitarias con `node:test`

**Decisión.** Las pruebas de la física usan el ejecutor que trae Node y se corren con `tsx --test`.

**Por qué.** No suma ninguna dependencia, y `tsx` lee TypeScript directamente con la misma resolución
de imports que el servidor en desarrollo. Las 20 pruebas tardan 0,2 segundos.

**Se comprobó que pueden fallar.** Se rompieron a propósito dos reglas —que las tapitas rebotaran en
la línea de gol y que el gol exigiera cruzar la línea por completo— y en cada caso falló exactamente
la prueba que cubre esa regla. Una prueba que nunca falla no demuestra nada.

## Decisiones de las reglas del partido

Los números de las reglas viven en `server/src/dominio/reglas/configuracionReglas.ts` y todos los
textos de error en `server/src/dominio/mensajes.ts`. Cambiar la meta de goles, la duración de la
Liga o un mensaje en la defensa es tocar una línea.

### El reloj se calcula, no se programa

**Decisión.** El servidor no usa `setTimeout` ni `setInterval`. Guarda instantes —cuándo empezó el
turno, cuándo empezó el partido de Liga— y cada vez que alguien consulta o tira calcula cuánto tiempo
pasó y aplica lo que debería haber ocurrido: turnos vencidos o el final por tiempo.

**Por qué.** Con temporizadores, cada partida abandonada dejaría uno vivo en el servidor para
siempre, y las pruebas tendrían que esperar segundos reales. Así, una prueba comprueba "pasaron 16
segundos" pasando un número, y la de un partido de Liga completo tarda milisegundos.

**Costo aceptado.** El estado cambia recién cuando alguien lo consulta. No importa: nadie puede ver
un turno vencido sin consultar la partida, y en ese momento el cálculo ya está hecho.

### El turno siguiente arranca cuando termina la animación

**Decisión.** Al responder un tiro, el turno del rival empieza a correr después de la duración del
recorrido (cantidad de cuadros dividida por 30), no en el instante de la respuesta.

**Por qué.** Un tiro dura entre 3 y 5 segundos de animación. Sin esta regla, el siguiente jugador
perdía hasta un tercio de sus 15 segundos mirando cómo se mueven las tapitas. El servidor sabe
exactamente cuánto dura la animación porque él mismo generó los cuadros.

### El pedido de tiro dice quién tira

**Decisión.** `PeticionTiro` incluye `lado`, además de la tapita.

**Por qué.** Sin saber quién tira no hay forma de distinguir las dos acciones inválidas del
reglamento: "No es tu turno" (tirar cuando le toca al otro, lo normal al jugar contra el servidor) y
"Ese jugador no es tuyo" (tirar en tu turno con una tapita rival). También permite el aviso "Se acabó
tu tiempo": el servidor recuerda quién dejó vencer su turno y se lo dice si intenta tirar tarde.

### Las rutas revisan la forma; el dominio, las reglas

**Decisión.** `rutas/lecturaPeticiones.ts` convierte el JSON recibido en el tipo del contrato:
comprueba tipos, valores permitidos e identificadores del catálogo. Todo lo demás —equipos distintos,
meta de 1 a 5, fuerza en rango, turno, tiros de poder— lo decide `dominio/reglas`, que no sabe nada
de HTTP.

**Por qué.** Las reglas se prueban con `node:test` sin levantar Express, y la validación se escribió a
mano en unas pocas funciones, sin agregar librerías de validación.

### Lo que guarda el servidor no es lo que ve el cliente

**Decisión.** El servidor guarda un `RegistroPartida` —instantes en milisegundos, el generador de azar
de la partida, quién dejó vencer su turno, posiciones con precisión completa— y el cliente recibe la
`Partida` pública que arma `aPartidaPublica`, con segundos restantes y posiciones redondeadas.

**Por qué.** El contrato no expone detalles internos y puede quedar estable aunque cambie la forma de
guardar las partidas.

### Un solo manejador de errores

**Decisión.** El dominio lanza `ErrorDeJuego` con su mensaje y su código HTTP, y
`rutas/manejadorDeErrores.ts` es el único lugar que lo convierte en `{ "error": "..." }`. Un cuerpo
que no es JSON responde 400; cualquier otra excepción, 500 con un mensaje genérico, dejando el detalle
solo en el log.

**Por qué.** Las rutas quedan en tres líneas cada una y ningún error puede responder HTML en lugar de
JSON. Y un error inesperado no le muestra al jugador detalles internos del servidor.

### El perro deja la pelota en espejo y en un lugar libre

**Decisión.** El perro lleva la pelota al punto en espejo respecto del centro de la cancha, con un
desvío horizontal de hasta 150 unidades y una altura al azar, siempre dentro del campo y sin encimar
ninguna tapita. Prueba hasta 20 lugares; si no encuentra uno libre, esa vez no aparece.

**Por qué.** El espejo es lo que "da vuelta la tortilla". Y como el destino queda siempre dentro del
campo, la regla "el perro nunca genera gol" se cumple por construcción, en vez de tener que anular
goles después. Se probó con 200 semillas distintas, incluso con la pelota pegada a cada arco.

### El tiro de poder se adelantó a la Fase 5

**Decisión.** La fuerza multiplicada por 1,5, el límite de dos por partido y su validación se
implementaron ahora, aunque el plan los ubicaba en la tarea 8.4.

**Por qué.** La tarea 5.3 exige validar "tiros de poder agotados", y validar algo que no existe no
tenía sentido. Solo quedó pendiente que libere charcos, que recién existen con la tarea 8.1.

### Se comprobó que las pruebas de reglas pueden fallar

Se rompieron a propósito tres reglas y en cada caso falló la prueba que la cubre:

| Regla rota | Prueba que falló |
|---|---|
| El gol en el arco derecho se lo anota el visitante | "un gol suma al marcador…" y "en Eliminatoria el partido termina al llegar a la meta" |
| Quien tira tarde recibe "No es tu turno" en vez del aviso de tiempo | "si se vence el turno, pasa al rival y quien tardó recibe el aviso de tiempo" |
| El reloj del turno corre durante la animación | "el reloj del turno no corre mientras se anima el tiro anterior" |

## Decisiones del frontend

### La navegación es un estado, no un router

**Decisión.** `App` guarda la pantalla actual como un tipo con una variante por pantalla, y cada
variante lleva los datos que esa pantalla necesita: la partida en curso, o la configuración para
jugar la revancha.

**Por qué.** El examen no permite React Router. Y así TypeScript impide abrir la pantalla de
resultado sin una partida, o la de partida sin saber cómo se creó.

### Un hook coordina la partida; los componentes solo dibujan

**Decisión.** `usePartida` concentra el estado que confirmó Express, la jugada que se está animando,
los errores, el reloj del turno y el turno del servidor. `Cancha` recibe datos y avisa cuando el
jugador suelta un tiro, pero no conoce la API.

**Por qué.** Es el mismo reparto que en el servidor —rutas, servicios, dominio— y deja un solo lugar
donde mirar cuando algo no llega o no se actualiza.

### La física se superpone a la imagen con una sola calibración

**Decisión.** Se midieron con un script las líneas dibujadas en los seis estadios: coinciden con
diferencias de un píxel. Las líneas de gol de la física se alinean exactamente con las dibujadas y
la escala es la misma en los dos ejes. Los números viven en `client/src/componentes/calibracionCancha.ts`.

**Por qué.** La cancha dibujada es un poco más apaisada que la de la física (1,85 contra 1,71). Con
la misma escala en los dos ejes, las paredes de arriba y abajo quedan unos 20 píxeles por fuera de
las bandas, todavía sobre el césped, y ninguna tapita se deforma.

**Alternativas descartadas.** Estirar la imagen en vertical, que deformaba las tapitas en óvalos, y
cambiar la física a 1200 × 647, que obligaba a rehacer pruebas y la documentación de la API por un
detalle visual.

### Las imágenes se ajustan a su dibujo, no a su archivo

**Decisión.** Cada imagen se agranda según qué parte del archivo ocupa el dibujo: la tapita llena el
93,5 % de su imagen y la pelota el 85,6 %.

**Por qué.** Si se dibujaran del tamaño del archivo, los choques parecerían ocurrir antes de que las
tapitas se toquen.

### Apuntar como una honda

**Decisión.** Se presiona una tapita propia y se arrastra hacia atrás; la tapita sale hacia el lado
contrario. La fuerza crece con la distancia hasta llegar al máximo a 240 unidades, y un arrastre de
menos de 25 cancela el tiro. El puntero se convierte a unidades de la física con la matriz de
transformación del propio SVG.

**Por qué.** Es el gesto que ya conoce cualquiera que jugó a las tapitas o al billar. Y como la
conversión usa la matriz real del SVG, funciona igual en cualquier tamaño de ventana.

### La animación interpola entre cuadros

**Decisión.** El servidor manda 30 cuadros por segundo y el cliente dibuja con `requestAnimationFrame`
calculando posiciones intermedias.

**Por qué.** Se ve fluido en pantallas de 60 Hz o más sin mandar el doble de datos. Al terminar, el
cliente descarta sus posiciones y aplica el estado que confirmó Express.

### Dos relojes en el cliente

**Decisión.** La cuenta regresiva del turno empieza cuando termina la animación, igual que en el
servidor. El reloj de la Liga, en cambio, cuenta desde que llegó la respuesta.

**Por qué.** El turno no corre mientras las tapitas se mueven, pero el partido de Liga sí. Si los dos
relojes arrancaran al final de la animación, el minuto de la Liga retrocedería unos segundos después
de cada tiro.

### El rival simple se adelantó a la Fase 6

**Decisión.** La tarea 8.2 se hizo junto con el frontend. El rival apunta como en el billar al punto
de la pelota opuesto al arco que ataca, y calcula la fuerza con la misma física del juego: con
fricción exponencial, la velocidad al llegar es la inicial menos una cantidad proporcional a la
distancia.

**Por qué.** La configuración ofrece 1 jugador, y sin rival el turno del servidor se vencía cada 15
segundos. La otra opción, ocultar el modo, dejaba la fase a medias. En difícil, la prueba exige que al
menos 24 de 30 tiros manden la pelota hacia su arco.

### El turno se marca en la cancha, no solo en el marcador

**Decisión.** Las tapitas del equipo que tiene el turno titilan con un borde brillante, y su recuadro
del marcador se enmarca con el color del club. Con la preferencia del sistema de reducir movimiento,
el brillo queda fijo.

**Por qué.** Mirar la cancha tiene que alcanzar para saber qué tapitas se pueden mover. Además
resuelve el caso de Always Ready y Nacional Potosí, cuyas tapitas son casi iguales.

### Se verificó en un Chrome real

**Decisión.** Además de las pruebas, se recorrió el juego completo con Playwright a 1366 × 768 y a
1920 × 1080, y se revisaron las capturas. Para forzar al perro y acortar la Liga se interceptó el
pedido de creación y se le agregaron parámetros de prueba.

**Por qué.** Las pruebas comprueban que el juego funciona, no que se vea bien. Así se encontró, por
ejemplo, que el perro tapaba la pelota mientras la llevaba, y se corrigió dibujando la pelota encima.

## Decisiones de la temporada

Los puntos por victoria y empate, y las probabilidades de goles de los partidos simulados, viven en
`server/src/dominio/reglas/configuracionReglas.ts`, junto con el resto de las reglas.

### La jornada es la fecha; cada cruce es un partido de temporada

**Decisión.** El contrato de la Fase 3 llamaba `Jornada` a cada partido del calendario. Se renombró a
`PartidoDeTemporada`, con un campo `jornada` que dice a qué fecha pertenece, y la ruta pasó a ser
`/api/temporadas/:id/partidos/:partidoId/jugar`.

**Por qué.** En fútbol la jornada es la fecha completa, con todos sus partidos. El nombre anterior
mezclaba los dos conceptos y era difícil de explicar.

### La temporada es una capa: crea partidas comunes

**Decisión.** `ServicioTemporadas` recibe el servicio de partidas y crea partidas de Liga normales.
No tiene física, reglas de turno ni rival propios.

**Por qué.** El plan pedía reutilizar el motor del partido sin modificarlo, y así fue: no se tocó
ningún archivo de la física ni de las reglas del partido. Cualquier arreglo al partido llega solo a la
temporada.

### La temporada se sincroniza al consultarla

**Decisión.** Nadie avisa a la temporada cuando termina una partida. Cada vez que se consulta o se
juega, revisa sus partidas en juego: anota las que terminaron, vuelve a dejar pendientes las que ya
no existen y cierra las jornadas que se pueden cerrar.

**Por qué.** Es el mismo criterio que el reloj de las partidas. Además, el motor de partidas no sabe
que existe la temporada: la dependencia va en un solo sentido.

### Los partidos sin personas se simulan al cerrar la jornada

**Decisión.** Un partido donde no juega ninguna persona no se puede jugar a mano: la API lo rechaza.
Cuando las personas terminan sus partidos de la jornada, el servidor simula los demás con la semilla,
sorteando los goles de cada equipo con probabilidades del 28, 34, 22, 11 y 5 % para 0, 1, 2, 3 y 4
goles.

**Por qué.** La persona nunca tiene que resolver partidos ajenos, y la tabla nunca muestra una jornada
a medias.

**Alternativa descartada.** Un botón para simular cada partido ajeno: cuatro clics por jornada sin
ninguna decisión detrás.

### El calendario usa el método del círculo, mezclado con la semilla

**Decisión.** Los equipos se mezclan con Fisher-Yates y la semilla de la temporada, y después se arma
el calendario con el método del círculo: un equipo queda fijo y los demás rotan una posición por
jornada. Con una cantidad impar se agrega un lugar vacío, y quien lo enfrenta descansa.

**Por qué.** El método garantiza que cada par se cruce exactamente una vez y que nadie juegue dos veces
en la misma jornada, y las pruebas lo comprueban. La mezcla hace que cada temporada tenga un orden
distinto, pero repetible con la misma semilla.

### La tabla no se guarda, se calcula

**Decisión.** La tabla de posiciones se calcula a partir de los resultados en cada respuesta.

**Por qué.** Así no puede quedar desincronizada con los partidos. Con 45 partidos el cálculo es
instantáneo.

**Desempate final.** Si dos equipos quedan iguales en puntos, diferencia de gol y goles a favor, decide
el sorteo que se hace con la semilla al crear la temporada. Al principio el último desempate era el
orden de la lista de equipos, y las capturas lo delataron: en una temporada corta que terminó 0 a 0,
Bolívar salía campeón solo por ser el primero del catálogo, que además es el equipo elegido por defecto.

### Se comprobó que las pruebas de la temporada pueden fallar

| Regla rota | Prueba que falló |
|---|---|
| Una victoria suma lo mismo que un empate | "suma 3 por victoria y 1 por empate…" |
| La temporada nunca anota el resultado de una partida terminada | "cuando termina la partida de la persona, se anota el resultado y avanza la jornada" |
| El calendario no rota a los equipos entre jornadas | "cada par se cruza una sola vez" y "cada uno descansa una jornada" |

## Decisiones de la Fase 8: estadios, rival, tiro de poder y emotes

Los números de los charcos viven en `server/src/dominio/estadios/configuracionEstadios.ts`; los del
rival y los emotes, en `server/src/dominio/reglas/configuracionReglas.ts`.

### Los charcos son parte de la física

**Decisión.** La simulación recibe los charcos como zonas que atrapan la pelota y avisa cuándo la
atrapó o la soltó. No sabe si son de agua o de nieve: recibe cuántos golpes hacen falta y con cuánto
impulso sale. Cuándo aparecen, cuánto duran y de qué tipo son lo decide `dominio/estadios`.

**Por qué.** Atrapar la pelota ocurre en medio del recorrido, así que tiene que calcularse en cada
subpaso, junto a los choques. Y el reparto es el mismo que con los goles: la física informa en qué
arco entró la pelota y las reglas deciden de quién es el gol.

**Alternativa descartada.** Revisar los charcos solo al final del tiro. Una pelota que cruza un charco
a toda velocidad no quedaría atrapada, y la animación mostraría algo distinto de lo que decidió el
servidor.

### El charco es una elipse, no un círculo

**Decisión.** Cada charco mide 170 × 80 unidades, y la pelota queda atrapada cuando su centro entra a
esa elipse. La imagen se estira para que la mancha dibujada cubra exactamente esa elipse.

**Por qué.** Las imágenes de los charcos son manchas alargadas, casi 2,5 veces más anchas que altas.
Con un círculo, la pelota quedaba atrapada arriba o abajo de la mancha, donde se ve césped. Se midió
con un script qué parte de cada imagen ocupa la mancha: el 93,5 % del ancho y el 54 % del alto, un
poco por debajo del centro.

### La pelota atrapada es un poste

**Decisión.** Al quedar atrapada, la pelota se detiene y su masa inversa pasa a 0, igual que los
postes del arco. Cuando se libera, recupera su masa y sale con el 40 % (agua) o el 25 % (nieve) de la
velocidad que le dio el choque.

**Por qué.** No hizo falta escribir un caso especial de choque: la misma función que hace rebotar una
tapita en el palo la hace rebotar en una pelota atrapada.

### Los golpes cuentan desde el tiro siguiente

**Decisión.** En el tiro en que la pelota cae al charco, ningún choque la libera.

**Por qué.** Lo encontró una prueba. La primera versión fallaba en "la pelota que entra a un charco
queda atrapada": la tapita que lanza la pelota pierde velocidad al chocarla pero sigue detrás, la
alcanza cuando se detiene en el charco y, en el agua, la liberaba en el mismo tiro. En la cancha se
veía como si el charco no hubiera hecho nada.

**También.** Una pelota que se libera no vuelve a quedar atrapada en ese charco hasta que sale de él.
Sin eso, quedaría atrapada de nuevo en el subpaso siguiente, porque sigue adentro.

### Los charcos usan el azar solo donde existen

**Decisión.** El sorteo de charcos consume el generador de la partida solo en los estadios que los
tienen, y los charcos iniciales se sortean después del saque.

**Por qué.** Así una semilla sigue dando el mismo saque que antes de la Fase 8, y en Santa Cruz y
Cochabamba toda la partida es idéntica. Las pruebas de reglas usan Cochabamba, el estadio de
referencia, para no depender de dónde cae un charco.

### El rival prueba tiros en vez de calcular uno

**Decisión.** El rival arma tiros candidatos, los simula con la misma física y elige el de mejor
puntuación. Los primeros candidatos son un tiro de billar por cada tapita propia, que es lo que hacía
el rival simple; el resto son variaciones al azar de esos tiros. La dificultad decide cuántos
candidatos prueba (3, 12 o 36) y cuánto error de puntería le agrega al elegido (0,30, 0,12 o 0,04
radianes).

**Por qué.** El rival simple no veía lo que iba a pasar: tiraba igual aunque hubiera una tapita en el
camino o la pelota fuera a quedar frente a su propio arco. Simular reutiliza el motor que ya existe,
incluidos los charcos, sin escribir reglas de estrategia a mano.

**Puntuación.** El gol a favor vale 1000 y el autogol resta 1000; si no hay gol, suma hasta 100 por
llevar la pelota hacia el arco rival y resta hasta 150 por dejarla cerca del propio. Castigar más el
peligro que premiar el avance hace que no despeje hacia su arco por intentar avanzar.

**Tiro de poder.** Solo lo usa cuando la pelota está atrapada en la nieve y le faltan dos golpes. Si lo
usara cada vez que un candidato con más fuerza puntuara mejor, gastaría los dos en los primeros
turnos.

**Medido.** Partidos completos a 3 goles entre dos rivales del servidor, alternando los lados, en
Félix Capriles:

| Duelo | Resultado | Tiros por partido |
|---|---|---|
| Difícil contra fácil | 10 a 0 | 31 |
| Medio contra fácil | 9 a 1 | 68 |
| Difícil contra medio | 10 a 0 | 40 |

Con dos rivales de nivel medio en estadios con charcos, la pelota quedó atrapada 2,4 veces por partido
en Hernando Siles y 2,7 en Villa Ingenio. Y en 4800 tiros del rival, en estadios con y sin charcos, el
recorrido más largo duró 7,8 segundos: ninguno llegó al tope de 20.

**Costo aceptado.** Difícil tarda unos 140 ms en responder el turno contra el servidor local, porque
simula 36 tiros. Se suma a la pausa de 800 ms que el cliente ya hace antes del turno del rival, así
que no se nota. En el plan gratuito de Render la CPU es más lenta; si se notara, bajar los candidatos
de difícil es cambiar un número.

**Alternativa descartada.** Probar ángulos y fuerzas en una grilla fija. Da siempre los mismos
candidatos, y con 36 tiros la grilla es tan gruesa que se pierde el tiro bueno entre dos casillas.

### Los emotes llevan su propio reloj en el cliente

**Decisión.** El servidor guarda cuándo se lanzó cada emote y responde los segundos que le quedan a la
carita y a la espera. `usePartida` convierte esos segundos en instantes y los guarda aparte del
estado de la partida.

**Por qué.** Un emote se puede lanzar mientras se anima una jugada. Al terminar la animación, el
cliente aplica el estado que trajo la respuesta del tiro, que es anterior al emote: si la carita
viviera en ese estado, desaparecería antes de tiempo.

**Dónde se ven.** Cada persona tiene su fila de caritas junto a su equipo, en el marcador. El boceto
las ponía abajo a la izquierda, pero con dos jugadores cada uno necesita la suya. Las caritas se
dibujaron para ir sobre una tapita, así que en los botones van sobre un disco claro; sobre el
marcador oscuro no se leían.

### Los recursos visuales: herramientas y autoría

**Herramientas.** Las imágenes originales de `assets/` se generaron con el modelo de imágenes de
OpenAI (gpt-image), a partir de las indicaciones del autor para cada equipo, estadio, elemento y
carita. Lo registran los propios archivos: cada PNG trae un manifiesto C2PA de "OpenAI Media Service
API" que declara el origen como contenido generado por un algoritmo. Las versiones web se obtuvieron
con `scripts/optimizar-recursos.mjs`, que usa `sharp` para reducirlas y convertirlas a WebP, y la
calibración sobre la cancha se midió con otro script sobre las mismas imágenes.

**Autoría y escudos.** Las ilustraciones fueron creadas para este proyecto y no reproducen ningún
escudo oficial: cada tapita lleva los colores del club, que es lo que permite reconocerlo, con un
diseño propio. No se usó ninguna imagen de terceros que exija atribución.

**Qué se conectó en esta fase.** Los charcos en la cancha, las siete caritas sobre las tapitas y en la
barra de emotes, una miniatura del estadio elegido en la configuración, y los charcos y las caritas
en las instrucciones. Con eso, todos los archivos de `client/src/recursos/` se usan en alguna
pantalla.

### Una falla intermitente escondía un error de la animación

**Decisión.** `useAnimacion` no deja que la posición dentro del recorrido sea negativa.

**Por qué.** Al correr las pruebas E2E, "se juega un partido de la temporada desde el navegador" falló
una vez de cada 80 ejecuciones, y sola nunca fallaba. Se repitió la suite guardando la traza de las
pruebas que fallaran, y la traza mostró que React se caía con `Cannot read properties of undefined
(reading 'tapitas')` justo después del turno del rival. `requestAnimationFrame` le pasa a cada
cuadro el instante en que el navegador empezó a dibujarlo, que con la máquina ocupada puede ser un
poco anterior al momento en que arrancó la animación: la posición daba negativa y se pedía el cuadro
-1. El error existía desde la Fase 6; la Fase 8 solo lo hizo más probable. Después del arreglo, la
suite pasó 240 ejecuciones seguidas.

### Se comprobó que las pruebas de la Fase 8 pueden fallar

Se rompió cada regla a propósito, de a una, y se volvió a dejar como estaba:

| Regla rota | Prueba que falló |
|---|---|
| Los golpes cuentan también en el tiro en que la pelota cae | "la pelota que entra a un charco queda atrapada y quieta" y "si la pelota cae en un charco, el tiro lo avisa y la partida la muestra atrapada" |
| El tiro de poder no libera de un solo golpe | "un tiro de poder saca la pelota de la nieve de una sola vez" |
| Un charco nuevo puede nacer debajo de la pelota o encima de otro | "un charco nuevo nunca nace debajo de la pelota ni encima de otro, y nunca hay más de tres" |
| No hay espera entre emotes | "la carita se va a los 5 segundos, y recién a los 15 se puede lanzar otra" |
| El rival premia el autogol como un gol | "la puntuación prefiere el gol, castiga el autogol y dejar la pelota cerca del propio arco" |

## Decisiones de infraestructura

### Despliegue temprano

**Decisión.** La aplicación se publicó en la Fase 2, cuando solo mostraba el estado del servidor.

**Por qué.** El despliegue es donde aparecen los problemas más difíciles de diagnosticar. Resolverlos
con cinco archivos es mucho más barato que resolverlos la noche anterior a la entrega.

### El deploy se confirma consultando la versión publicada

**Decisión.** El trabajo de deploy no termina cuando Render acepta el pedido, sino cuando
`/api/salud` en la URL pública informa exactamente el commit que se acaba de subir.

**Por qué.** Un deploy hook responde de inmediato aunque después la compilación falle. Sin esta
comprobación, el pipeline quedaría en verde con una versión vieja publicada.

### `npm ci --include=dev` en el build

**Decisión.** El comando de build de Render incluye las dependencias de desarrollo de forma explícita.

**Por qué.** Vite y TypeScript son dependencias de desarrollo pero hacen falta para compilar. Si el
entorno define `NODE_ENV=production`, `npm ci` las omite y el build falla con `vite: not found`, que
es un error difícil de interpretar.

### Sin Docker

**Decisión.** Render compila el proyecto Node directamente, sin `Dockerfile`.

**Por qué.** Docker es opcional en el examen y no aporta nada aquí: significaría mantener una imagen
y alargar cada deploy para llegar al mismo resultado. La decisión se revisaría si el proyecto
necesitara servicios adicionales.

## Riesgos

| Riesgo | Señal temprana | Mitigación |
|---|---|---|
| Física inestable | Objetos que se atraviesan o que nunca se detienen | Pasos fijos con subpasos, límite de iteraciones y umbral de detención. Si persiste, bajar la velocidad máxima antes de seguir. **Superado en la Fase 4:** ninguna tapita queda encimada y todos los tiros probados terminan en reposo. |
| La animación termina en otra posición que el servidor | La tapita queda en un lugar y al recargar aparece en otro | Animar solo los cuadros recibidos y aplicar el estado final de Express al terminar. |
| Respuestas de tiro demasiado grandes | El JSON de un tiro pesa cientos de kilobytes | Recortar la cantidad de cuadros y enviar las posiciones en el mismo orden que `partida.tapitas`, sin repetir identificadores. **Medido en la Fase 4:** 29 kB para un tiro que mueve las diez tapitas. |
| La Liga completa consume todo el tiempo | Avanza el calendario y todavía no hay un partido de Liga suelto jugable | Detenerse en el punto de control de la Fase 7. Liga como partido suelto ya cumple el núcleo obligatorio. **Superado:** la temporada se empezó recién con el núcleo terminado y publicado, reutilizando el motor de partidas sin modificarlo. |
| Pruebas E2E intermitentes | Una prueba falla una de cada tres veces sin cambios de código | Semilla fija, esperar respuestas reales en vez de tiempos arbitrarios, localizadores por rol accesible. |
| Pipeline lento | Supera los 6 minutos | Un solo navegador en CI, caché de npm, lint y E2E en paralelo. Volver a medir en la tarea 9.7. |
| El rival difícil tarda en Render | El turno del servidor en difícil se nota lento en la URL pública | Medido en local: 140 ms. Si en Render se nota, bajar los candidatos de difícil en `RIVAL.dificultades`; las pruebas no dependen del número exacto. |
| Pruebas unitarias lentas | `npm run test:unit` pasa de unos pocos segundos | Las pruebas del rival simulan partidos completos. Se achicaron a 20 tiros y 10 partidos: toda la suite tarda unos 8 segundos. |
| Arranque en frío durante la defensa | La primera visita tarda casi un minuto | Tiempos de espera largos en las pruebas de producción y despertar el servicio unos minutos antes. |
| Partidas perdidas por reinicio | Una partida abierta deja de existir | Limitación aceptada del repositorio en memoria: mensaje claro y opción de crear otra partida. |
| Reclamo por la identidad de los clubes | Uso de escudos oficiales | Ilustraciones propias, sin escudos oficiales, con el criterio documentado y sin fines comerciales. |
| Dos tapitas casi iguales | Always Ready y Nacional Potosí son blancas con una franja roja diagonal; solo cambia el color del borde, y a 50 píxeles en la cancha cuesta distinguirlas | **Resuelto:** se mantienen las dos, porque en una Liga tienen que enfrentarse. El borde de cada tapita es distinto, y las del equipo con el turno titilan con un borde brillante, así nunca hay duda de cuáles se pueden mover. |
| Código que no se puede explicar | No poder modificar una regla en el momento | Tareas pequeñas, revisión personal de cada cambio y valores de configuración centralizados en un solo archivo. |
| Contradicción con el cierre del repositorio | El cambio de la defensa exige tocar un repositorio ya congelado | Pedir instrucción escrita al docente antes de la entrega (tarea 11.6). |

## Cambios importantes durante el desarrollo

| Cambio | Motivo |
|---|---|
| "Tiro de altura" pasó a llamarse "tiro de poder" | El nombre no tenía sentido en una cancha sin efecto de altura, como Santa Cruz. Además se le dio una razón de ser: libera cualquier charco de un solo golpe. |
| El perro dejó de pasar el turno siempre al rival | Ahora el turno pasa al equipo cuyo arco quedó más cerca de la pelota, para que pueda defenderse si el perro se la dejó encima. |
| Las caritas pasaron de decoración a mecánica | Existían como recurso visual. Convertirlas en una acción con duración y enfriamiento agrega expresión sin tocar la física. |
| De un partido suelto a dos modos y una temporada | Eliminatoria y Liga resuelven el problema del empate de dos formas distintas, y la temporada convierte el mismo motor en una experiencia más larga. |
| El estadio se puede elegir | Por defecto se juega en el estadio del local, pero elegirlo permite probar un efecto de cancha sin tener que cambiar de equipo. |
| El pedido de tiro incluye quién tira | Sin ese dato no se podían distinguir las acciones inválidas "No es tu turno" y "Ese jugador no es tuyo". |
| El turno empieza después de la animación | Al medir la física se vio que un tiro dura de 3 a 5 segundos: era un tercio del turno perdido mirando. |
| El rival simple se adelantó a la Fase 6 | La configuración ofrece 1 jugador; sin rival, el turno del servidor se vencía cada 15 segundos. |
| Always Ready y Nacional Potosí se mantienen como están | Se prefirió no redibujarlas: el borde las distingue y el turno se marca con un brillo sobre las tapitas. |
| La pelota se dibuja encima del perro | En las capturas se vio que el perro la tapaba mientras la llevaba. |
| `Jornada` pasó a llamarse `PartidoDeTemporada` | En fútbol la jornada es la fecha completa; el nombre anterior confundía un partido con una jornada. |
| Los partidos sin personas se simulan solos | Simularlos a mano obligaba a hacer clics sin ninguna decisión en cada jornada. |
| El empate total en la tabla lo decide un sorteo | Con el orden de la lista, Bolívar, el primero del catálogo, ganaba todos los empates totales. |
| Los charcos son elipses | Las imágenes son manchas alargadas: con un círculo, la pelota quedaba atrapada sobre el césped. |
| Los golpes para sacar la pelota de un charco cuentan desde el tiro siguiente | La tapita que la llevaba al charco la volvía a tocar y la liberaba en el mismo tiro. |
| El rival simple pasó a ser el punto de partida del rival por muestreo | Su tiro de billar sigue siendo bueno como candidato, pero no veía qué iba a pasar después del golpe. |
| Los emotes se mudaron al marcador | Con dos jugadores cada uno necesita su fila de caritas, y junto a su equipo se entiende de quién es. |
| La animación no admite posiciones negativas | Una falla intermitente de las pruebas E2E mostró que el primer cuadro podía pedir el cuadro -1. |
