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

**Decisión.** `assets/` guarda los originales (60,1 MB) y no se publica; `client/src/recursos/` tiene
las versiones WebP que usa el juego (2,4 MB), generadas con `scripts/optimizar-recursos.mjs`.

**Por qué.** Las tapitas venían en 1254 px y se ven a unos 50 px en la cancha. Publicar 60,1 MB en el
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

## Decisiones de la Fase 9: pruebas E2E y robustez

### Las pruebas no necesitaron cambiar la interfaz

**Decisión.** Se revisaron todos los localizadores y se mantuvieron: roles y nombres visibles primero,
etiquetas de campos después y `data-testid` solo en la cancha, las tapitas, el marcador y los
mensajes. Lo que se repetía entre archivos pasó a `e2e/ayudantes.ts`.

**Por qué.** Los localizadores ya cumplían la política desde las fases anteriores, y agregar atributos
sin necesidad habría sido código que defender sin motivo. Además, como la interfaz no cambió, las
pruebas nuevas se pudieron verificar contra la versión que ya estaba publicada.

### La semilla entra por el pedido, no por la pantalla

**Decisión.** Las pruebas agregan `semilla` y `duracionRealSegundos` al `POST /api/partidas` con
`page.route`. Todo lo demás (modo, jugadores, estadio, meta, perro) se elige en la pantalla, como una
persona.

**Por qué.** Sin semilla, el saque es al azar y no se puede saber qué tapita tirar. Poner un campo de
semilla en la configuración le mostraría al jugador una opción que solo sirve para probar.

**Alternativa descartada.** Crear la partida por la API y abrirla en la pantalla. La aplicación no
tiene forma de abrir una partida por su id, y habría que agregarla solo para las pruebas.

### El gol de las pruebas se buscó con la física

**Decisión.** Con la semilla 12345, `visitante-4` tira con toda la fuerza en la dirección
`(-0,9359; 0,3523)` y hace gol. `scripts/buscar-tiro-de-gol.ts` probó ángulos cada 0,002 radianes
con la misma simulación del servidor y eligió el centro de la ventana más ancha: el gol entra aunque
la dirección se desvíe hasta 0,021 radianes.

**Por qué.** La prueba de finalización necesita un gol que entre siempre. Un píxel de error del mouse
son unos 0,004 radianes, cinco veces menos que el margen. Y con toda la fuerza se arrastra de más: pasado
el máximo, el largo del arrastre ya no cambia nada.

**Alternativa descartada.** Tirar hasta que entre un gol. La prueba tardaría lo que quisiera el azar y
no se podría explicar qué está comprobando.

### Se comprueba lo que viaja, no solo lo que se ve

**Decisión.** Las pruebas del navegador leen el pedido y la respuesta reales: la de interacción
comprueba que el tiro enviado tiene la dirección y la fuerza del gesto, y que al final la tapita quedó
en la posición exacta que devolvió Express; la de validación, que la alerta muestra el mismo texto que
respondió el servidor.

**Por qué.** Que cambie el turno en pantalla no demuestra que hubo comunicación con el backend: podría
ser un cambio local. Comparar con la respuesta sí lo demuestra.

### Las pruebas corren también contra la versión publicada

**Decisión.** El trabajo de deploy ejecuta las 25 pruebas E2E contra la URL pública después de
confirmar que sirve el commit nuevo.

**Por qué.** Lo que se prueba antes del deploy es un servidor local. Recién contra la URL pública se
comprueba lo que usa una persona: el build de Render, el mismo dominio y puerto, y la latencia real.
Se agregó dentro del trabajo de deploy para mantener los tres trabajos que pide la consigna.

**Costo aceptado.** El pipeline suma cerca de un minuto. Si una prueba falla contra producción, el
deploy ya ocurrió: el trabajo queda en rojo como aviso, no como bloqueo.

### Se verificó que las pruebas nuevas no son intermitentes

La suite local se repitió cinco veces seguidas (125 ejecuciones) y la de defensa tres veces en Chrome
visible contra producción: todas en verde. Una primera ejecución de la defensa falló porque la ventana
de Chrome se cerró mientras corría; la traza mostraba "Target page, context or browser has been closed",
y sola volvió a pasar.

## Decisiones de la Fase 10: experiencia de usuario

### Los escudos identifican al equipo; las tapitas se juegan

**Decisión.** Cada equipo tiene ahora un escudo propio, en `client/src/recursos/escudos/`. Se usa en
todo lo que identifica a un equipo: el selector de la configuración, el marcador, el resultado, el
campeón, el próximo partido, la tabla y el calendario. En la cancha siguen las tapitas.

**Por qué.** La tapita es la ficha del juego: en la configuración o en la tabla se leía como una pieza
suelta, no como el club. El escudo lleva el nombre del equipo y se reconoce aunque se vea chico, y en
el calendario, donde antes solo había texto, deja ver de un vistazo quién juega con quién.

**Recursos.** Los diez originales de `assets/teams/` pesaban cerca de 14 MB. El script
`scripts/optimizar-recursos.mjs` los recorta al contenido y los encaja en 256 × 256 px en WebP: 280 kB
entre los diez. El script ahora acepta el nombre de un grupo (`node scripts/optimizar-recursos.mjs
escudos`), para no regenerar las imágenes que no cambiaron.

**Autoría.** Igual que el resto de las imágenes, los escudos se generaron con gpt-image de OpenAI a
partir de las indicaciones del autor; lo registra el manifiesto C2PA de cada PNG. Son diseños
ilustrados para el juego, con los colores y el nombre de cada club, y siguen el criterio de
`docs/introduccion.md`: que se reconozca al equipo sin copiar su escudo oficial.

### La pausa congela el tiempo en Express y el recorrido en React

**Decisión.** `pausadaDesde` guarda el inicio de pausa. Al reanudar se desplazan los orígenes del turno,
Liga y emotes por la duración transcurrida. Las consultas usan el instante congelado; repetir pausa
o reanudación no suma tiempo. Los tiros y emotes se rechazan durante la pausa.

**Cliente.** `useAnimacion` conserva el tiempo reproducido y la orientación del balón. `usePartida`
detiene el rival y la cuenta regresiva, actualiza los relojes al reanudar y conserva el recorrido
pendiente aunque Express ya haya calculado su resultado. Las solicitudes se protegen con referencias
sincrónicas para impedir dobles envíos antes del siguiente render. Pausa y salida esperan a que
termine cualquier solicitud de juego en curso.

**Salida.** Confirmar abandonar elimina solo partidas sin terminar. La sincronización existente de
la temporada las vuelve a dejar pendientes. Los resultados ya finalizados se conservan. Esto evita
que un encuentro abandonado termine por tiempo en el servidor y cuente como jugado.

### Modales propios con semántica nativa

**Decisión.** Un componente `<dialog>` reemplaza `window.confirm` y el aviso de partida inexistente.
CSS aporta el panel iluminado y la entrada animada. El fondo queda inerte, el foco se mantiene entre
las acciones del modal (incluido `Shift+Tab`), `Esc` cancela y el foco vuelve al botón de origen.
Los errores de conexión se muestran dentro del modal para permitir reintentar.

### La pelota conserva su imagen y gira según el recorrido

**Decisión.** Se precalcula una tabla de ángulos por jugada: distancia acumulada dividida por el radio,
convertida a grados. En cada cuadro solo se interpola ese ángulo y se rota la imagen alrededor de su
centro. Es una aproximación visual 2D al rodado; no agrega física angular ni cambia colisiones.

**Casos especiales.** Sin movimiento no hay giro; mientras el perro la transporta tampoco. El regreso
al centro tras un gol no se cuenta como recorrido y la orientación se conserva entre tiros y pausas.
`prefers-reduced-motion` oculta el giro decorativo manteniendo el desplazamiento necesario para jugar.

### Precargar lo próximo y cachear los recursos versionados

**Decisión.** La portada se declara como precarga de alta prioridad en el HTML, antes de ejecutar React.
Vite transforma su URL con el hash del recurso. Después se precarga el menú. Al crear una partida
suelta o revancha se decodifican sus sprites y el estadio explícito antes de pedirla a Express, con
un límite de espera de 2,5 segundos. El estadio de configuración ya se descarga como vista previa.
No se descargan todos los estadios al abrir la aplicación.

**Caché.** Express sirve `/assets` con un año de caché e `immutable`; el HTML conserva la política
normal para descubrir las nuevas URLs después de publicar. No se modificaron los WebP ni se añadieron
dependencias. La mejora reduce descargas repetidas y anticipa la primera imagen; el tiempo de red
y el arranque en frío del servidor siguen dependiendo de la conexión y del alojamiento.

### Respuesta visual sin alterar la jugada (10.5)

**Decisión.** El apuntado conserva la flecha y añade un anillo de carga y un porcentaje calculado
con la misma fuerza que se envía al servidor. El tiro de poder tiene una etiqueta explícita y un
resaltado propio. Su etiqueta se posiciona fuera del flujo: activarla no debe mover la cancha ni
cambiar la relación entre el cursor y las coordenadas del tiro.

Los avisos de gol y pelota atrapada usan los eventos confirmados por Express al finalizar la
animación; el perro se anuncia cuando aparece en los cuadros recibidos. El turno se identifica
con el nombre del equipo y el resultado tiene una entrada breve y el texto «Pitazo final».
El indicador junto a la pelota atrapada muestra los golpes restantes del estado del servidor.

**Interacción.** Los avisos superiores no capturan clics ni añaden esperas para jugar. Duran
1,8 segundos para el turno y 2,6 para los demás eventos, con el tiempo restante conservado al
pausar. Las animaciones decorativas se detienen durante la pausa y se desactivan con movimiento
reducido. El modal queda fuera de esa suspensión para que su entrada no se congele.

### Una misma identidad para paneles y tarjetas (10.6)

**Decisión.** Colores, superficies, bordes, sombras, radios y capas se comparten mediante variables
CSS. Menú, configuración, temporada, resultado y modales combinan azul nocturno, iluminación
verde y acentos dorados. El fondo de paneles usa gradientes y patrones CSS; los iconos del menú
son SVG decorativos pequeños. Se conservan el arte existente, la precarga y la caché de 10.1–10.4:
no se añaden bitmaps, fuentes externas ni dependencias.

**Verificación de 10.5–10.6.** Lint, tipos y 103 pruebas unitarias aprobados. El reporte completo de
Playwright registra 42 E2E aprobados, sin fallos ni pruebas inestables, ejecutados contra el build
de producción local. Cuatro recorridos nuevos cubren potencia, gol real, perro, nieve, pausa de
avisos, movimiento reducido y presentación en 1280 × 720, 1366 × 768 y 1920 × 1080. Las capturas
permitieron revisar menú, configuración, temporada, resultado y los modales existentes. En
pantallas bajas, la temporada permite desplazamiento vertical sin desbordamiento horizontal.
Evidencias seleccionadas: [menú](evidencias/fase-10-menu-pulido.jpg),
[configuración](evidencias/fase-10-configuracion-pulida.jpg),
[potencia](evidencias/fase-10-potencia.jpg) y
[pelota atrapada](evidencias/fase-10-pelota-atrapada.jpg).

### Audio optativo y desacoplado de la simulación (10.7)

**Decisión.** Un `MotorAudio` de TypeScript concentra Web Audio, la caché de buffers decodificados,
una sola pista musical y canales separados de música, interfaz, gameplay y reacciones. React
solo observa las preferencias desde `ControlesAudio` mediante `useSyncExternalStore`; el audio
no añade actualizaciones por cuadro ni toca Express. Se mantienen las dependencias existentes.

**Activación.** Crear el controlador no crea un `AudioContext` ni descarga recursos. El botón
Iniciar lo desbloquea y la navegación real solicita música de menú. Navegar por configuración,
instrucciones o temporada no la reinicia. Entrar al partido/resultado o volver a portada la
detiene. Los hooks de jugadas y la música de partido quedan para 10.8. Esto sigue el requisito
de interacción de la [política de Web Audio de Chrome](https://developer.chrome.com/blog/web-audio-autoplay).

**Preferencias y fallos.** Silencio global, volumen musical y volumen de efectos/interfaz se
persisten en `tupay.audio.v1`, validando tipos y valores entre 0 y 1. Predeterminados: 25 % y
60 %, con ganancia adicional por recurso. Si falta almacenamiento se usa memoria; si falta
Web Audio o falla un archivo, se avisa sin impedir la partida. Los controles viven en el menú
y en la pausa, con las superficies ya existentes. El foco del modal incluye ahora `summary`
y los sliders, además de sus botones.

**Superposición.** Se comparte cada descarga; una generación identifica solicitudes vigentes y
descarta las que terminan después de salir/silenciar. Los efectos tienen intervalo mínimo,
máximo cuatro voces simultáneas y descarte si llegan con más de 350 ms de retraso. Las reacciones
suenan más bajo, no se acumulan y ceden ante gameplay. El motor ofrece pausa con conservación de
posición musical para conectar en 10.8; ocultar la pestaña ya detiene efectos y conserva la
música. No se sonorizan automáticamente todos los botones ni cada render de un reloj.

**Recursos y alcance.** Se descargaron 21 OGG reales (1,62 MB), todos publicados bajo CC0:
Kenney (interfaz, fichas, impactos, tonos y jingles), Ansimuz y MatiasVME (bucles musicales).
No se convirtieron ni recortaron los originales. El inventario, nombres originales, enlaces,
licencias y pendientes están en [assets/audio/README.md](../assets/audio/README.md), con
`catalogo.json` como fuente de rutas y ganancias. No hay hinchada, por indicación del autor.
Perro y algunas voces cómicas siguen pendientes de descarga/selección; no se simularon con
archivos vacíos. Las reacciones seleccionadas son tonos, no voces humanas.

**Verificación.** Lint, tipos, 109 unitarias (seis nuevas del motor), 47 E2E (cinco nuevos) y
build local aprobados. Chromium descargó y decodificó los 21 archivos, con duración y señal
no nulas; los efectos seleccionados duran menos de seis segundos. Los recorridos verifican
ausencia de audio antes del gesto, una sola música, silencio, persistencia, teclado, estado de
partida intacto al ajustar en pausa y continuidad sin almacenamiento/AudioContext o con audio
inválido. El recorrido normal de audio no produjo errores de consola. Se revisaron controles
de pausa en las tres resoluciones del plan; [captura](evidencias/fase-10-audio-pausa.jpg).
La escucha subjetiva de bucles, jingles y mezcla queda pendiente de aprobación del autor:
la comprobación técnica no demuestra por sí sola que un sonido sea agradable.

### Integración y cierre audiovisual (10.8–10.9)

**Decisión.** Se conectó la música a creación, revancha y navegación reales. `usePartida`
dispara impacto/emote solo después de la aceptación de Express y el gol al terminar su
animación. El perro se anuncia una sola vez cuando aparece en el recorrido; la pausa no
reinicia esa identidad. El apuntado suena una vez al superar el mínimo de arrastre y cancelar
invalida también el audio todavía en carga. Poder y errores tienen señales propias.

**Pausa y salida.** Se pausa audio al abrir el modal y mientras se confirma la pausa. Reanudar
continúa la música desde su posición; cambiar de pantalla cancela efectos pendientes. Los
bucles se declaran en el catálogo, no por nombres fijos en el motor. Los jingles de resultado
no se repiten: derrota cuando gana el servidor, victoria cuando gana una persona; con dos
jugadores se celebra al ganador. El empate no usa ninguno de esos jingles.

**Recursos resueltos.** Se descargaron las vistas previas públicas OGG CC0 de
[Dog_Bark.wav](https://freesound.org/people/michael_grinnell/sounds/464400/) y
[Slingshot](https://freesound.org/people/renne100/sounds/353033/), sin iniciar sesión ni obtener
los originales restringidos. Procedencia y enlaces en
[licencias/freesound.md](../assets/audio/licencias/freesound.md). Hay 23 recursos, 1,64 MB,
sin transcodificación y con copias verificadas. Se mantiene la exclusión de hinchada.

**Límites.** Dormida no necesita una voz para funcionar; enojada/seria reutilizan tonos en
el canal de reacciones, con menor ganancia y prioridad. No se añadieron contactos ficticios
ni «gol fallado»: el contrato no informa esos eventos. No se modifica la simulación para
justificar un efecto decorativo.

**Auditoría.** Lint, tipos, build, 113 unitarias y 53 E2E aprobados. Se verificó silencio,
movimiento reducido, teclado de controles/modales, eventos únicos, pausa, revancha, caché y
fallos de audio. Mediana entre cuadros de 16,7 ms tanto con audio como en silencio en la
muestra local; 20 descargas únicas con audio y ninguna en silencio. Sin dependencias nuevas
ni temporizadores por cuadro para audio. Resultados, límites y evidencias en
[fase-10-auditoria.md](evidencias/fase-10-auditoria.md). La valoración auditiva subjetiva de los
bucles y la mezcla sigue pendiente del autor, separada de la validación técnica.

### Los golpes suenan en el cuadro en que ocurren

**Decisión.** La simulación anota cada golpe que suena —una tapita contra la pelota, dos tapitas,
una tapita contra una pared o un poste— con el índice del cuadro en que ocurre, y la respuesta del
tiro los devuelve en `contactos`. El cliente los reproduce cuando la animación llega a ese cuadro.

**Por qué.** El sonido de tiro sonaba al llegar la respuesta de Express, antes de que la tapita
tocara nada, y los choques y la pared estaban reservados porque el navegador no tiene la física:
calcularlos comparando posiciones sería adivinar. El servidor ya resuelve cada choque, así que
informar cuándo ocurrió es exacto y no cuesta cálculo extra.

**Detalles.** Un golpe más suave que 60 unidades por segundo no suena: tapitas que apenas se rozan
generaban ruido. Cada tipo aparece como mucho una vez por cuadro, y el motor de audio además respeta
un intervalo mínimo por sonido. La pelota contra la pared no suena, porque «pared» es el golpe de una
tapita. Pausar no repite golpes: el hook recuerda hasta qué cuadro ya sonaron.

### Los selectores de equipo y estadio son carruseles

**Decisión.** El componente `Carrusel` reemplaza a los `select`: dos flechas, recorrido circular en
orden alfabético, flechas del teclado y el clic de la interfaz en cada cambio. Los escudos muestran a
sus vecinos a los costados; el estadio se ve grande, con su ciudad, su efecto y la marca «Estadio
del local». El estadio acompaña al equipo local hasta que se elige otro a mano.

**Por qué.** El `select` escondía justamente lo que distingue a cada opción: el escudo y la imagen
del estadio. Con el carrusel se elige mirando.

**Accesibilidad y pruebas.** Cada carrusel es un grupo con nombre («Tu equipo», «Rival», «Estadio»),
los botones se llaman «Anterior» y «Siguiente», y el nombre elegido se anuncia con `aria-live`. Las
pruebas lo encuentran por ese rol y leen la opción actual en `data-valor`. La prueba de diseño, que
juega tres partidos completos, se marcó como lenta: con los clics del carrusel superaba los 30 segundos
de una prueba común.

### Los sonidos nuevos se publican como MP3, sin convertir

**Decisión.** El catálogo de audio acepta `.ogg`, `.mp3` y `.wav`, y los siete sonidos aportados se
publican con sus bytes originales.

**Por qué.** Convertirlos a OGG exigía sumar `ffmpeg` al proyecto y recomprimir, con pérdida de
calidad, archivos que todos los navegadores de escritorio ya decodifican. Se comprobó en Chromium que
los siete decodifican y que ninguno pasa de 6 segundos.

**Pendiente.** Su origen y licencia no venían en los archivos. Quedan como «pendiente de registrar» en
`assets/audio/catalogo.json`.

### El empate suena a aplausos sintetizados

**Decisión.** `scripts/generar-aplausos.mjs` genera tres segundos de aplauso: palmadas de ruido
filtrado que llegan al azar, con una densidad que sube, se sostiene y se apaga. El azar tiene semilla,
así que el archivo sale siempre igual.

**Por qué.** El empate no tenía ningún sonido y no se quiso descargar uno sin una licencia
verificada. Sintetizarlo no suma dependencias ni dudas de autoría.

**Se encontró un error.** La primera versión generó un archivo mudo: la densidad valía cero justo al
empezar y el bucle de palmadas terminaba antes de la primera. Se detectó midiendo la señal en Chromium
(pico 0). Ahora la densidad nunca arranca en cero y el script falla si el resultado no tiene señal.
La versión final decodifica con pico 0,8, sin saturar.

### Las tarjetas del menú y los paneles usan ilustraciones propias

**Decisión.** Las cuatro tarjetas del menú muestran una ilustración en lugar del icono SVG, y
configuración, instrucciones, temporada y resultado comparten un estadio nocturno de fondo. Esto
reemplaza lo decidido en 10.6, donde el menú usaba iconos SVG y los paneles, patrones CSS.

**Por qué.** Los iconos de línea eran genéricos y los patrones CSS se veían planos al lado de la
portada y del menú, que ya son ilustraciones. Las imágenes nuevas siguen la línea de las tapitas.
Todos los paneles usan la misma imagen, así que no hace falta una imagen para cada uno.

**Cómo.** `scripts/optimizar-recursos.mjs` suma dos grupos. `tarjetas` recorta el margen transparente
de cada ilustración y la reduce a 560 × 420 como máximo, sin rellenarla: el CSS la centra en un hueco
de alto fijo, así la tarjeta no salta mientras carga. `paneles` convierte el fondo a WebP con su
tamaño original de 1811 × 868. Los cinco PNG pesaban 11,2 MB y los cinco WebP pesan 377 kB. El fondo
se dibuja desde `global.css` y el menú lo precarga, porque todas sus tarjetas llevan a un panel. El
panel quedó algo translúcido y con desenfoque, así se ve el estadio detrás sin perder lectura. Se
borraron el componente `IconoDeModo`, su estilo y los patrones del fondo (líneas diagonales y el óvalo
de cancha), que ya no tenían uso.

**Verificación.** Lint, tipos, unitarias y E2E. La prueba de presentación ahora comprueba que las
cuatro ilustraciones se descargan y que la configuración usa el fondo nuevo, en los tres tamaños.
Evidencias: [menú](evidencias/fase-10-menu-ilustrado.jpg) y
[configuración](evidencias/fase-10-configuracion-fondo.jpg).

### Un árbitro con silbato anuncia la pausa

**Decisión.** Los modales de la partida (pausa, salida y partida perdida) muestran la ilustración
de una tapita árbitro tocando el silbato, en lugar del símbolo «Ⅱ». Pausar con el botón o con `Esc`
reproduce el silbato de árbitro que ya sonaba al empezar el partido (`pitido.mp3`, id `inicio`).

**Por qué.** El símbolo era genérico y no tenía la línea ilustrada del resto del juego. Se reutilizó
el silbato existente para no sumar un archivo ni una licencia más, como pide `assets/audio/README.md`.

**Cómo.** El grupo `modales` de `scripts/optimizar-recursos.mjs` recorta la ilustración y la reduce a
360 × 284: 34 kB contra 1,5 MB del PNG. Se precarga junto con los recursos de la partida.

Para el sonido hubo que tocar el motor. La pausa corta los efectos y bloquea el canal de efectos, y
`Partida` la vuelve a aplicar cada vez que cambia su estado (al pedirla a Express y al confirmarla).
Por eso el silbato se cortaba apenas empezaba. Ahora:

- `pausar(true)` solo corta los efectos al entrar en pausa, no cuando se confirma de nuevo;
- `efecto` acepta `interfaz` como canal alternativo, el mismo que ya se usaba para los controles de
  sonido en pausa;
- `Partida` toca el silbato en el mismo efecto que pausa el audio, justo después, y solo cuando la
  pausa la pidió una persona. Volver a la pausa desde «Salir» no lo repite.

**Verificación.** Una prueba unitaria comprueba que un efecto suena en pausa por la interfaz y que
confirmar la pausa no lo corta. La E2E de audio en juego comprueba que pausar suma un solo silbato y
que después no queda ningún sonido activo.

### La duración se elige con radios y las opciones van centradas

**Decisión.** En Liga y en Configurar temporada, la duración real del partido se elige con radios,
igual que los jugadores, la dificultad y la meta de goles. Todos los grupos de opciones, sus títulos
y la etiqueta del estadio van centrados. La casilla del perro lleva su ilustración y se ve como una
píldora: a color cuando el perro puede entrar y apagado cuando no.

**Por qué.** El `select` era el único control nativo que quedaba en la configuración y su lista
desplegable no seguía el estilo del juego. Con tres opciones, los radios muestran todo a la vista.
Alineados a la izquierda, los grupos quedaban desparejos debajo de los carruseles, que están centrados.

**Sin desplazamiento.** El perro y los radios agregan alto, y en 1280 × 720 el panel de Liga llegaba
al borde. En pantallas de menos de 800 px de alto se achicaron el espacio entre filas, el margen de los
títulos y el perro (2,4 rem en lugar de 3,4 rem). Se borraron los estilos de `select` y `.campo`, que
ya no usaba nadie. La prueba de presentación ahora exige, en los tres tamaños, que Eliminatoria, Liga
y Configurar temporada no se desplacen verticalmente.

### Cada modal entra con su árbitro y su sonido; elegir una opción suena

**Decisión.** El modal de salir tiene su propio árbitro (una tapita árbitro agarrándose la cabeza) y
suena con `salir.mp3` al abrirse, sea desde el botón «Salir» o desde la pausa. La pausa y la partida
perdida conservan el árbitro del silbato. En la configuración, cada radio suena con el mismo clic que
las flechas de los carruseles. Activar al perro suena a ladrido y desactivarlo, a la transición de
volver. La casilla del perro ahora empieza desactivada.

**Por qué.** Pausar y salir eran dos modales distintos con la misma cara y solo uno tenía sonido.
Los radios eran los únicos controles de la configuración que no respondían con sonido. Con el perro
desactivado al entrar, activarlo es un gesto y el ladrido lo confirma.

**Cómo.**

- `Modal` recibe la ilustración (`ilustracion`) y usa la de la pausa por defecto.
- `Partida` recuerda qué sonido anuncia el modal que pidió la persona, y lo toca en el mismo efecto
  que pausa el audio, después de pausarlo. Si se sale desde la pausa, primero corta el silbato.
  Volver de «Seguir jugando» a la pausa no suena.
- `salir.mp3` va con canal `interfaz` en el catálogo, así la pausa no lo bloquea, y se precarga con
  los sonidos de la partida.
- `GrupoDeOpciones` reemplaza los grupos de radios que se repetían en `Configuracion` y
  `ConfigurarTemporada`, y `CasillaDelPerro`, la casilla. Las dos pantallas quedaron más cortas.
- `sonarAlElegir`, en `audio.ts`, reúne lo que ya hacía el carrusel: desbloquear el audio con el
  gesto y después sonar.

**Verificación.** Una E2E nueva comprueba que salir suena una vez con su árbitro, tanto desde el botón
como desde la pausa, y que volver a la pausa no repite el sonido. La prueba del perro cuenta el ladrido
de la configuración y el de la cancha. Espera los 2 s de intervalo mínimo del ladrido entre uno y otro.

### Título ilustrado, cabeceras centradas, ícono de sonido y reloj con segundos

**Decisión.**

- **Menú:** el título de texto, la leyenda y el lema se reemplazaron por la ilustración `titulo`, a
  todo color y separada de las tarjetas. Los nombres de las tarjetas van centrados.
- **Paneles:** en configuración, temporada e instrucciones, la cabecera centra el título, y «Volver»
  es un botón con borde dorado y un relleno amarillo suave, que se nota sin competir con el título.
- **Sonido:** el control muestra un ícono de parlante, con ondas o con una cruz si está silenciado,
  en el menú y en la pausa. Su nombre accesible sigue siendo «Sonido activado» o «Sonido silenciado».
- **Liga:** el reloj muestra minutos y segundos de juego (`MM:SS`). El marcador de cualquier modo
  usa de fondo la ilustración `marcador`.

**Por qué.** El título de texto no tenía la fuerza del resto del arte. En la cabecera, «Volver» parecía
un texto suelto. La palabra «Sonido · activado» ocupaba lugar y un ícono se entiende igual. Con solo el
minuto, el reloj parecía quieto: con 5 minutos reales, un minuto de juego pasa cada 3,3 s. Con segundos
se ve que corre rápido: 45:00 llega a los 150 s reales, lo que duran 10 turnos de 15 s.

**Cómo.**

- **Imágenes:** el grupo `interfaz` de `scripts/optimizar-recursos.mjs` recorta las dos imágenes. El
  título baja de 1,5 MB a 123 kB (1200 × 375) y el marcador, de 496 kB a 42 kB (1920 × 160).
- **Título:** su alto sigue al de la pantalla (`clamp(7rem, 22vh, 13rem)`), así el menú entra en
  1280 × 720.
- **Reloj:** `usePartida` solo informa lo que quedaba del reloj en su último tic, cada 250 ms. El
  componente `RelojDeLiga` sigue contando desde ahí cuadro a cuadro, sin volver a dibujar la cancha, y
  se detiene en pausa o al terminar.
- **Marcador:** el fondo se estira al marcador y los costados tienen más relleno, para que escudos y
  emotes no queden encima de los reflectores de la barra.

**Verificación.** Lint, tipos, unitarias y E2E. Las pruebas de audio encuentran el control por su nombre
accesible, y la de Liga comprueba que el reloj tiene formato `MM:SS` y avanza. Se revisaron capturas del
menú, la configuración, la temporada, la pausa y la cancha de Liga.

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
| El gol de las pruebas deja de entrar | Falla la prueba de finalización o la de defensa después de tocar la física o la formación | Volver a correr `scripts/buscar-tiro-de-gol.ts` y actualizar `GOL_DESDE_EL_SAQUE` en `e2e/ayudantes.ts`. |
| Producción falla después del deploy | El trabajo de deploy queda en rojo en las pruebas contra la URL pública | Abrir el artefacto `reporte-e2e-produccion` y la traza de la prueba que falló. |
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
| `juego.spec.ts` se repartió en un archivo por tarea de la Fase 9 | Cada prueba se puede señalar en la defensa por lo que demuestra: inicio, interacción, validación, finalización y recorrido. |
| Las trazas se guardan en toda prueba que falla, no solo en el reintento | Sin reintentos en local no quedaba ninguna traza, y fue una traza la que explicó la falla de la animación. |
| El deploy también prueba la URL pública | Probar solo antes del deploy no demuestra que la versión publicada funcione. |
| Los escudos reemplazan a las tapitas fuera de la cancha | La tapita es la ficha del juego; el escudo identifica al club en el marcador, la temporada y el resultado. |
| Los golpes suenan cuando ocurren | El sonido de tiro llegaba antes del golpe, y choques y paredes no podían sonar sin datos de la física. |
| Equipos y estadio se eligen con carruseles | El `select` escondía el escudo y la imagen del estadio. |
| El empate suena a aplausos | El resultado empatado era el único sin sonido. |
| Ilustraciones en las tarjetas del menú y estadio de fondo en los paneles | Los iconos SVG y los patrones CSS se veían genéricos al lado del arte de la portada y el menú. |
| Un árbitro reemplaza al símbolo de pausa y pausar suena a silbato | El «Ⅱ» era genérico; el silbato existente anuncia la pausa sin sumar archivos de audio. |
| La duración se elige con radios y las opciones van centradas | El `select` desplegable no seguía el estilo del juego y los grupos alineados a la izquierda quedaban desparejos. |
| Salir tiene su árbitro y su sonido; las opciones suenan y el perro empieza desactivado | Pausa y salida compartían cara y solo una sonaba; activar al perro con un ladrido le da presencia. |
| Título ilustrado, cabeceras centradas, ícono de sonido y reloj de Liga con segundos | El título de texto no tenía fuerza, «Volver» no parecía botón y con solo el minuto el reloj parecía quieto. |
