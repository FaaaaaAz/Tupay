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
| La Liga completa consume todo el tiempo | Avanza el calendario y todavía no hay un partido de Liga suelto jugable | Detenerse en el punto de control de la Fase 7. Liga como partido suelto ya cumple el núcleo obligatorio. |
| Pruebas E2E intermitentes | Una prueba falla una de cada tres veces sin cambios de código | Semilla fija, esperar respuestas reales en vez de tiempos arbitrarios, localizadores por rol accesible. |
| Pipeline lento | Supera los 6 minutos | Un solo navegador en CI, caché de npm, lint y E2E en paralelo. Volver a medir en la tarea 9.7. |
| Arranque en frío durante la defensa | La primera visita tarda casi un minuto | Tiempos de espera largos en las pruebas de producción y despertar el servicio unos minutos antes. |
| Partidas perdidas por reinicio | Una partida abierta deja de existir | Limitación aceptada del repositorio en memoria: mensaje claro y opción de crear otra partida. |
| Reclamo por la identidad de los clubes | Uso de escudos oficiales | Ilustraciones propias, sin escudos oficiales, con el criterio documentado y sin fines comerciales. |
| Dos tapitas casi iguales | Always Ready y Nacional Potosí son blancas con una franja roja diagonal; solo cambia el color del borde, y a 50 píxeles en la cancha cuesta distinguirlas | Pendiente de decidir: redibujar una de las dos tapitas, o impedir que se enfrenten, igual que dos veces el mismo equipo. |
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
