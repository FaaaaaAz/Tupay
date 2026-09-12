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
| Física inestable | Objetos que se atraviesan o que nunca se detienen | Pasos fijos con subpasos, límite de iteraciones y umbral de detención. Si persiste, bajar la velocidad máxima antes de seguir. Punto de control al final de la Fase 4. |
| La animación termina en otra posición que el servidor | La tapita queda en un lugar y al recargar aparece en otro | Animar solo los cuadros recibidos y aplicar el estado final de Express al terminar. |
| Respuestas de tiro demasiado grandes | El JSON de un tiro pesa cientos de kilobytes | Recortar la cantidad de cuadros y enviar las posiciones en el mismo orden que `partida.tapitas`, sin repetir identificadores. |
| La Liga completa consume todo el tiempo | Avanza el calendario y todavía no hay un partido de Liga suelto jugable | Detenerse en el punto de control de la Fase 7. Liga como partido suelto ya cumple el núcleo obligatorio. |
| Pruebas E2E intermitentes | Una prueba falla una de cada tres veces sin cambios de código | Semilla fija, esperar respuestas reales en vez de tiempos arbitrarios, localizadores por rol accesible. |
| Pipeline lento | Supera los 6 minutos | Un solo navegador en CI, caché de npm, lint y E2E en paralelo. Volver a medir en la tarea 9.7. |
| Arranque en frío durante la defensa | La primera visita tarda casi un minuto | Tiempos de espera largos en las pruebas de producción y despertar el servicio unos minutos antes. |
| Partidas perdidas por reinicio | Una partida abierta deja de existir | Limitación aceptada del repositorio en memoria: mensaje claro y opción de crear otra partida. |
| Reclamo por la identidad de los clubes | Uso de escudos oficiales | Ilustraciones propias, sin escudos oficiales, con el criterio documentado y sin fines comerciales. |
| Código que no se puede explicar | No poder modificar una regla en el momento | Tareas pequeñas, revisión personal de cada cambio y valores de configuración centralizados en un solo archivo. |
| Contradicción con el cierre del repositorio | El cambio de la defensa exige tocar un repositorio ya congelado | Pedir instrucción escrita al docente antes de la entrega (tarea 11.6). |

## Cambios importantes durante el desarrollo

| Cambio | Motivo |
|---|---|
| "Tiro de altura" pasó a llamarse "tiro de poder" | El nombre no tenía sentido en una cancha sin efecto de altura, como Santa Cruz. Además se le dio una razón de ser: libera cualquier charco de un solo golpe. |
| El perro dejó de pasar el turno siempre al rival | Ahora el turno pasa al equipo cuyo arco quedó más cerca de la pelota, para que pueda defenderse si el perro se la dejó encima. |
| Las caritas pasaron de decoración a mecánica | Existían como recurso visual. Convertirlas en una acción con duración y enfriamiento agrega expresión sin tocar la física. |
| De un partido suelto a dos modos y una temporada | Eliminatoria y Liga resuelven el problema del empate de dos formas distintas, y la temporada convierte el mismo motor en una experiencia más larga. |
