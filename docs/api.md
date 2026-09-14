# Tupay — API REST

Toda la comunicación es JSON, de entrada y de salida. Los tipos de cada cuerpo están en
`compartido/` y los comparten el cliente y el servidor, así que un cambio en el contrato rompe la
compilación de ambos lados en vez de fallar recién en tiempo de ejecución.

Los ejemplos de las secciones **Catálogo**, **Partida** y **Temporada** son solicitudes y respuestas reales,
capturadas contra el servidor local el 13 de septiembre de 2026 (tarea 5.9 del plan). Los de charcos,
rival por muestreo y emotes se capturaron el 14 de septiembre, al terminar la Fase 8. Solo se
compactó el formato de algunos arreglos para que entren en pantalla; los valores no se tocaron.

Desde la tarea 10.3, toda respuesta de tipo `Partida` incluye además `pausada: boolean` (inicialmente
`false`). Los ejemplos históricos anteriores se conservan como evidencia de aquellas versiones.

## Convenciones

- Base: la misma dirección que sirve el frontend. En producción, `https://tupay.onrender.com`.
- Los errores siempre tienen la misma forma: `{ "error": "mensaje" }`, con el texto exacto que se
  muestra en pantalla (ver la tabla de acciones inválidas en `docs/reglas.md`).
- Los campos que no aplican viajan como `null`, nunca ausentes. `JSON.stringify` descarta
  `undefined`, así que un campo opcional desaparecería del JSON y el cliente no podría distinguir
  "no aplica" de "me olvidé de mandarlo".
- Las posiciones están en unidades de cancha, no en píxeles, redondeadas a un decimal. Cada partida
  informa sus medidas en `cancha`, y el cliente escala el SVG a la pantalla.

## Códigos de estado

| Código | Cuándo |
|---|---|
| `200` | Consulta o acción correcta. |
| `201` | Partida creada. |
| `400` | Acción inválida o cuerpo con forma incorrecta. |
| `404` | No existe la partida o la ruta. |
| `409` | La partida ya terminó o se intenta jugar mientras está pausada. |
| `500` | Error inesperado del servidor. El detalle queda en el log, nunca en la respuesta. |

## Pausa y salida (tareas 10.2–10.3)

Estas acciones usan `POST` con cuerpo `{}` y devuelven JSON. Funcionan en Eliminatoria, Liga suelta
y los partidos de temporada; no crean un resultado nuevo ni reinician el reloj del turno.

| Ruta | Respuesta `200` | Comportamiento |
|---|---|---|
| `/api/partidas/:id/pausar` | `Partida` con `pausada: true` | Actualiza el tiempo vencido antes de pausar; congela turno, Liga y emotes desde ese instante. |
| `/api/partidas/:id/reanudar` | `Partida` con `pausada: false` | Desplaza los orígenes de los relojes por el tiempo de pausa y conserva el tiempo restante. |
| `/api/partidas/:id/abandonar` | `{ "abandonada": true }` | Elimina la partida sin terminar de la memoria. Un resultado ya finalizado se conserva para la tabla. |

Pausar una partida pausada o reanudar una activa es idempotente: repetir la solicitud no reinicia
ni suma tiempo. Una partida finalizada sigue finalizada aunque se pause su presentación.
`GET /api/partidas/:id` mantiene los relojes constantes durante la pausa. Mientras está pausada,
los endpoints de tiro, turno rival y emote responden `409`:

```json
{ "error": "La partida está pausada. Reanuda para seguir jugando" }
```

Las tres acciones responden `404` con `{ "error": "Esa partida no existe" }` si no se encuentra el
identificador. Tras abandonar una partida sin terminar, la siguiente consulta de temporada detecta
su ausencia y deja el cruce pendiente, sin registrar puntos. El cliente considera un `404` al
abandonar como una salida ya resuelta.

La animación permanece en React. Pausar no revierte una jugada que Express ya calculó: el cliente
conserva el cuadro visible y continúa ese mismo recorrido al reanudar, aplicando después el estado
confirmado. Mientras se espera una solicitud de juego, los botones de pausa y salida se deshabilitan
brevemente para no cruzar solicitudes incompatibles.

## Catálogo

### `GET /api/salud`

Estado y versión del servidor. Es lo que usa el pipeline para confirmar qué commit está publicado.

```json
{ "estado": "ok", "juego": "Tupay", "version": "3caf60a1a52e3604cc839f193b86f489cb29505d" }
```

### `GET /api/equipos`

Los diez equipos. El cliente nunca tiene la lista escrita: la pide al servidor. Respuesta `200`
(primeros dos de diez):

```json
[
  {
    "id": "bolivar",
    "nombre": "Bolívar",
    "departamento": "La Paz",
    "estadio": "hernandoSiles",
    "colorPrincipal": "#18a8f0",
    "colorSecundario": "#ffffff"
  },
  {
    "id": "theStrongest",
    "nombre": "The Strongest",
    "departamento": "La Paz",
    "estadio": "hernandoSiles",
    "colorPrincipal": "#ffd800",
    "colorSecundario": "#181818"
  }
]
```

Los colores son los dos tonos que más superficie ocupan en la tapita de cada club.

### `GET /api/estadios`

Respuesta `200` (primeros dos de seis):

```json
[
  { "id": "hernandoSiles", "nombre": "Hernando Siles", "ciudad": "La Paz", "efecto": "charcosDeAgua" },
  { "id": "villaIngenio", "nombre": "El Titán de Villa Ingenio", "ciudad": "El Alto", "efecto": "charcosDeNieve" }
]
```

## Partida

### `POST /api/partidas`

Crea un partido, de Eliminatoria o de Liga suelta. El servidor arma la formación de cinco tapitas
por equipo, sortea el saque y devuelve el estado inicial completo.

| Campo | Obligatorio | Por defecto |
|---|---|---|
| `modo` | sí | — `"eliminatoria"` o `"liga"` |
| `local`, `visitante` | sí | — `{ equipo, tipo, dificultad? }` |
| `estadio` | no | el del equipo local |
| `perroActivo` | no | `true` |
| `golesParaGanar` | no | `3` (solo Eliminatoria, de 1 a 5) |
| `semilla` | no | una al azar |
| `duracionRealSegundos` | no | `300` (solo Liga) |
| `limiteTurnoSegundos` | no | `15` |
| `probabilidadPerro` | no | `0.12` |

Solicitud:

```json
{
  "modo": "eliminatoria",
  "local": { "equipo": "bolivar", "tipo": "humano" },
  "visitante": { "equipo": "theStrongest", "tipo": "humano" },
  "perroActivo": false,
  "semilla": 12345
}
```

Respuesta `201`:

```json
{
  "id": "p_7b989188",
  "modo": "eliminatoria",
  "estado": "enJuego",
  "estadio": "hernandoSiles",
  "cancha": { "ancho": 1200, "alto": 700, "altoDelArco": 180, "radioTapita": 28, "radioPelota": 18 },
  "local": {
    "lado": "local",
    "equipo": "bolivar",
    "tipo": "humano",
    "dificultad": null,
    "tirosDePoder": 2,
    "emote": null,
    "esperaEmote": 0
  },
  "visitante": {
    "lado": "visitante",
    "equipo": "theStrongest",
    "tipo": "humano",
    "dificultad": null,
    "tirosDePoder": 2,
    "emote": null,
    "esperaEmote": 0
  },
  "tapitas": [
    { "id": "local-1", "lado": "local", "posicion": { "x": 120, "y": 350 } },
    { "id": "local-2", "lado": "local", "posicion": { "x": 300, "y": 203 } },
    { "id": "local-3", "lado": "local", "posicion": { "x": 300, "y": 497 } },
    { "id": "local-4", "lado": "local", "posicion": { "x": 480, "y": 280 } },
    { "id": "local-5", "lado": "local", "posicion": { "x": 480, "y": 420 } },
    { "id": "visitante-1", "lado": "visitante", "posicion": { "x": 1080, "y": 350 } },
    { "id": "visitante-2", "lado": "visitante", "posicion": { "x": 900, "y": 203 } },
    { "id": "visitante-3", "lado": "visitante", "posicion": { "x": 900, "y": 497 } },
    { "id": "visitante-4", "lado": "visitante", "posicion": { "x": 720, "y": 280 } },
    { "id": "visitante-5", "lado": "visitante", "posicion": { "x": 720, "y": 420 } }
  ],
  "pelota": { "posicion": { "x": 600, "y": 350 }, "atrapadaEn": null, "golpesParaLiberar": 0 },
  "charcos": [],
  "turno": { "lado": "visitante", "segundosRestantes": 15 },
  "marcador": { "local": 0, "visitante": 0 },
  "perro": { "activo": false, "apariciones": 0 },
  "golesParaGanar": 3,
  "reloj": null,
  "resultado": null
}
```

El local defiende el arco izquierdo y forma en la mitad izquierda; el visitante, en espejo. Con la
semilla `12345` el saque le toca siempre al visitante: esa es la razón de que exista la semilla.

Ese ejemplo es anterior a la Fase 8, cuando ningún estadio tenía efecto. Hoy, en un estadio con
charcos, la partida arranca con dos. La misma solicitud en El Titán de Villa Ingenio
(`"estadio": "villaIngenio"`, `"semilla": 12345`) responde:

```json
{
  "estadio": "villaIngenio",
  "pelota": { "posicion": { "x": 600, "y": 350 }, "atrapadaEn": null, "golpesParaLiberar": 0 },
  "charcos": [
    { "id": "nieve-1", "tipo": "nieve", "posicion": { "x": 384.5, "y": 340.2 }, "ancho": 170, "alto": 80, "turnosRestantes": 4 },
    { "id": "nieve-2", "tipo": "nieve", "posicion": { "x": 954.5, "y": 355.8 }, "ancho": 170, "alto": 80, "turnosRestantes": 4 }
  ],
  "turno": { "lado": "visitante", "segundosRestantes": 15 }
}
```

Cada charco es una elipse de `ancho` × `alto` centrada en `posicion`. `turnosRestantes` baja con cada
tiro. El saque sigue siendo del visitante: los charcos se sortean después del saque, así que no le
cambian el resultado a ninguna semilla.

En Liga cambian dos campos. Solicitud con `"modo": "liga"`, Wilstermann contra Aurora y
`"duracionRealSegundos": 1`:

```json
{
  "estadio": "felixCapriles",
  "golesParaGanar": null,
  "reloj": { "minutoDeJuego": 0, "segundosRealesRestantes": 1, "duracionRealSegundos": 1 }
}
```

Errores reales:

| Situación | Código | Respuesta |
|---|---|---|
| Ambos equipos iguales | `400` | `{ "error": "Elijan equipos distintos: todavía no hay camisetas alternativas" }` |
| `golesParaGanar: 6` | `400` | `{ "error": "Elige una meta de goles entre 1 y 5" }` |
| Falta un campo o tiene otro tipo | `400` | `{ "error": "La configuración de la partida no es válida" }` |
| El cuerpo no es JSON | `400` | `{ "error": "El cuerpo de la solicitud no es JSON válido" }` |

### `GET /api/partidas/:id`

Devuelve el mismo objeto `Partida`, con el estado actual. El servidor no usa temporizadores: al
consultar calcula cuánto tiempo pasó y aplica los turnos vencidos o el final de la Liga. Por ejemplo,
la partida de Liga de arriba, consultada 1,1 segundos después:

```json
{
  "estado": "finalizada",
  "reloj": { "minutoDeJuego": 90, "segundosRealesRestantes": 0, "duracionRealSegundos": 1 },
  "resultado": { "ganador": null, "marcador": { "local": 0, "visitante": 0 } }
}
```

`ganador: null` es empate, posible solo en Liga. Con `duracionRealSegundos` el cliente avanza el
minuto de juego entre una respuesta y la siguiente, sin tener que consultar al servidor cada segundo.

| Situación | Código | Respuesta |
|---|---|---|
| La partida no existe | `404` | `{ "error": "Esa partida no existe" }` |

### `POST /api/partidas/:id/tiros`

El corazón del juego: valida el tiro, lo simula hasta que todo se detiene, decide si hubo gol o si
entra el perro, cambia el turno y devuelve el recorrido para que React lo anime.

| Campo | Qué es |
|---|---|
| `lado` | Quién tira. Permite distinguir "No es tu turno" de "Ese jugador no es tuyo". |
| `tapita` | Id de una tapita propia, por ejemplo `"visitante-4"`. |
| `direccion` | Vector hacia donde sale la tapita. No hace falta normalizarlo. |
| `fuerza` | Proporción de la fuerza máxima, mayor que 0 y hasta 1. |
| `tiroDePoder` | Opcional. Multiplica la fuerza por 1,5, gasta uno de los dos disponibles y saca la pelota de un charco de un solo golpe. |

Solicitud, sobre la partida `p_7b989188` de arriba:

```json
{ "lado": "visitante", "tapita": "visitante-4", "direccion": { "x": -1, "y": 0.3 }, "fuerza": 0.7 }
```

Respuesta `200`. Este tiro produjo 103 cuadros y la respuesta completa pesa 27 kB; aquí van los
dos primeros:

```json
{
  "recorrido": [
    {
      "tapitas": [
        { "x": 120, "y": 350 }, { "x": 300, "y": 203 }, { "x": 300, "y": 497 }, { "x": 480, "y": 280 }, { "x": 480, "y": 420 },
        { "x": 1080, "y": 350 }, { "x": 900, "y": 203 }, { "x": 900, "y": 497 }, { "x": 720, "y": 280 }, { "x": 720, "y": 420 }
      ],
      "pelota": { "x": 600, "y": 350 },
      "perro": null
    },
    {
      "tapitas": [
        { "x": 120, "y": 350 }, { "x": 300, "y": 203 }, { "x": 300, "y": 497 }, { "x": 480, "y": 280 }, { "x": 480, "y": 420 },
        { "x": 1080, "y": 350 }, { "x": 900, "y": 203 }, { "x": 900, "y": 497 }, { "x": 687.2, "y": 289.8 }, { "x": 720, "y": 420 }
      ],
      "pelota": { "x": 600, "y": 350 },
      "perro": null
    }
  ],
  "eventos": [],
  "cuadrosPorSegundo": 30,
  "partida": {
    "turno": { "lado": "local", "segundosRestantes": 15 },
    "marcador": { "local": 0, "visitante": 0 }
  }
}
```

`cuadrosPorSegundo` le dice al cliente a qué velocidad reproducir el recorrido para que dure lo
mismo que en el servidor. En el segundo cuadro ya se ve a `visitante-4` salir de (720, 280) hacia la izquierda. Las posiciones
de `tapitas` van **en el mismo orden** que `partida.tapitas`: repetir los identificadores en cada
cuadro multiplicaría el tamaño de la respuesta sin agregar información.

El turno vuelve a mostrar 15 segundos porque el reloj del turno siguiente arranca cuando termina la
animación, no cuando responde el servidor.

**Cuando entra el perro**, el recorrido sigue con sus cuadros y aparece un evento. Solicitud con
`"probabilidadPerro": 1` y `"semilla": 7`; tiró el local:

```json
{
  "eventos": [{ "tipo": "perro", "posicionPelota": { "x": 743.1, "y": 478.2 }, "turnoPara": "visitante" }]
}
```

Ese tiro tuvo 164 cuadros, 84 de ellos con el perro. Uno mientras lleva la pelota, con los dos en el
mismo punto:

```json
{ "pelota": { "x": 647.7, "y": 392.7 }, "perro": { "x": 647.7, "y": 392.7 } }
```

El turno pasó al visitante aunque tiró el local: el perro dejó la pelota en la mitad derecha, cerca
del arco del visitante, y el reglamento le da el turno a quien tiene que defender.

**Cuando la pelota cae en un charco.** Partida en Hernando Siles con `"semilla": 3`, que arrancó con
un charco de agua en `(85.6, 322.8)`, cerca del arco del local. Tiró el visitante:

```json
{ "lado": "visitante", "tapita": "visitante-4", "direccion": { "x": -74, "y": 72 }, "fuerza": 0.5 }
```

Respuesta `200`, con 94 cuadros y 24 kB:

```json
{
  "eventos": [{ "tipo": "pelotaAtrapada", "charco": "agua-1", "tipoCharco": "agua" }],
  "partida": {
    "pelota": { "posicion": { "x": 170.5, "y": 324.4 }, "atrapadaEn": "agua-1", "golpesParaLiberar": 1 },
    "charcos": [
      { "id": "agua-1", "tipo": "agua", "posicion": { "x": 85.6, "y": 322.8 }, "ancho": 170, "alto": 80, "turnosRestantes": 1 },
      { "id": "agua-2", "tipo": "agua", "posicion": { "x": 126, "y": 513.1 }, "ancho": 170, "alto": 80, "turnosRestantes": 1 }
    ],
    "turno": { "lado": "local", "segundosRestantes": 15 }
  }
}
```

La pelota quedó en el borde del charco, donde entró su centro. Al local le hace falta un golpe para
sacarla, y a los dos charcos les queda un tiro antes de secarse. Cuando la pelota sale, el evento es
`{ "tipo": "pelotaLiberada" }`, tanto por un golpe como porque el charco se secó con ella adentro.

Los otros eventos posibles son `{ "tipo": "gol", "lado": "local" }` y
`{ "tipo": "finDelPartido", "resultado": { ... } }`.

Errores reales:

| Situación | Código | Respuesta |
|---|---|---|
| Tira quien no tiene el turno | `400` | `{ "error": "No es tu turno" }` |
| Tapita del rival | `400` | `{ "error": "Ese jugador no es tuyo" }` |
| `fuerza: 1.5`, dirección nula o campos incorrectos | `400` | `{ "error": "Tiro inválido" }` |
| Tira después de que se le venció el turno | `400` | `{ "error": "Se acabó tu tiempo: pierdes el turno" }` |
| Sin tiros de poder | `400` | `{ "error": "Ya no te quedan tiros de poder" }` |
| Partida terminada | `409` | `{ "error": "La partida ya terminó" }` |
| La partida no existe | `404` | `{ "error": "Esa partida no existe" }` |

El aviso de tiempo se obtuvo con `"limiteTurnoSegundos": 1`, esperando 1,2 segundos antes de tirar:
el servidor responde el error y el turno ya es del rival.

### `POST /api/partidas/:id/turno-rival`

En el modo de 1 jugador, el cliente lo llama cuando le toca al equipo que controla el servidor. No
lleva cuerpo: el servidor prueba varios tiros candidatos con la física del juego, elige el de mejor
puntuación, le agrega un error de puntería según la dificultad, lo ejecuta con las mismas reglas que una persona y
responde igual que `/tiros`.

Partida de Bolívar contra The Strongest manejado por el servidor en difícil, con `"semilla": 12345`
para que saque el visitante. Respuesta `200`, con 126 cuadros y 32 kB en total:

```json
{
  "recorrido": ["… 126 cuadros …"],
  "eventos": [],
  "cuadrosPorSegundo": 30,
  "partida": {
    "turno": { "lado": "local", "segundosRestantes": 15 },
    "marcador": { "local": 0, "visitante": 0 }
  }
}
```

Errores reales:

| Situación | Código | Respuesta |
|---|---|---|
| Le toca a una persona | `400` | `{ "error": "Todavía no le toca al rival" }` |
| Una persona intenta mover al equipo del servidor por `/tiros` | `400` | `{ "error": "No es tu turno" }` |
| Partida terminada | `409` | `{ "error": "La partida ya terminó" }` |

### Rutas inexistentes

Cualquier ruta bajo `/api` que no exista responde `404` con
`{ "error": "Ruta de API no encontrada" }`, nunca con la página HTML del juego.

## Temporada

Una temporada es una capa sobre las partidas: arma el calendario, lleva la tabla y crea partidas de
Liga comunes para los partidos donde juega una persona. Los partidos sin personas los simula el
servidor cuando las personas terminan los suyos de esa jornada.

### `POST /api/temporadas`

| Campo | Obligatorio | Por defecto |
|---|---|---|
| `humanos` | sí | — uno o dos equipos, distintos |
| `equipos` | no | los diez del catálogo |
| `dificultad` | no | `"medio"`, para los rivales del servidor |
| `perroActivo` | no | `true` |
| `duracionRealSegundos` | no | `300` por partido |
| `semilla`, `limiteTurnoSegundos`, `probabilidadPerro` | no | igual que en `/partidas` |

Solicitud, con cuatro equipos para que el ejemplo sea corto:

```json
{
  "equipos": ["bolivar", "theStrongest", "aurora", "wilstermann"],
  "humanos": ["bolivar"],
  "duracionRealSegundos": 1,
  "perroActivo": false,
  "semilla": 5
}
```

Respuesta `201`. Con cuatro equipos hay 3 jornadas de 2 partidos; con los diez del catálogo, 9 jornadas
de 5:

```json
{
  "id": "t_8e4e3b2f",
  "equipos": ["bolivar", "theStrongest", "aurora", "wilstermann"],
  "humanos": ["bolivar"],
  "partidos": [
    { "id": "partido-1", "jornada": 1, "local": "theStrongest", "visitante": "aurora", "estado": "pendiente", "marcador": null, "partida": null },
    { "id": "partido-2", "jornada": 1, "local": "wilstermann", "visitante": "bolivar", "estado": "pendiente", "marcador": null, "partida": null },
    { "id": "partido-3", "jornada": 2, "local": "wilstermann", "visitante": "theStrongest", "estado": "pendiente", "marcador": null, "partida": null },
    { "id": "partido-4", "jornada": 2, "local": "aurora", "visitante": "bolivar", "estado": "pendiente", "marcador": null, "partida": null },
    { "id": "partido-5", "jornada": 3, "local": "theStrongest", "visitante": "bolivar", "estado": "pendiente", "marcador": null, "partida": null },
    { "id": "partido-6", "jornada": 3, "local": "aurora", "visitante": "wilstermann", "estado": "pendiente", "marcador": null, "partida": null }
  ],
  "tabla": [
    { "equipo": "theStrongest", "jugados": 0, "ganados": 0, "empatados": 0, "perdidos": 0, "golesAFavor": 0, "golesEnContra": 0, "diferencia": 0, "puntos": 0 }
  ],
  "jornadaActual": 1,
  "totalDeJornadas": 3,
  "proximosPartidos": ["partido-2"],
  "estado": "enCurso",
  "campeon": null
}
```

La tabla va recortada a su primera fila en el ejemplo; trae una por equipo. Mientras todos están
empatados, el orden es el del sorteo que se hizo con la semilla al crear la temporada, que también
es el último desempate.

### `POST /api/temporadas/:id/partidos/:partidoId/jugar`

Crea la partida de Liga de un partido donde juega una persona. El cuerpo es opcional:

```json
{ "rivalControladoPor": "humano" }
```

Solo sirve con dos personas: el rival que no es de ninguna de las dos lo toma el segundo jugador en vez
del servidor.

Solicitud con `{}` sobre `partido-2` de la temporada de arriba. Respuesta `200`, con la partida lista
para abrir la cancha (recortada) y la temporada actualizada:

```json
{
  "partida": {
    "id": "p_927fc592",
    "modo": "liga",
    "local": { "lado": "local", "equipo": "wilstermann", "tipo": "servidor", "dificultad": "medio", "tirosDePoder": 2, "emote": null, "esperaEmote": 0 },
    "visitante": { "lado": "visitante", "equipo": "bolivar", "tipo": "humano", "dificultad": null, "tirosDePoder": 2, "emote": null, "esperaEmote": 0 },
    "reloj": { "minutoDeJuego": 0, "segundosRealesRestantes": 1, "duracionRealSegundos": 1 }
  },
  "temporada": {
    "partidos": [
      { "id": "partido-2", "jornada": 1, "local": "wilstermann", "visitante": "bolivar", "estado": "enJuego", "marcador": null, "partida": "p_927fc592" }
    ]
  }
}
```

### `GET /api/temporadas/:id`

Devuelve la temporada completa. Al consultarla, el servidor revisa las partidas en juego, anota las que
terminaron y cierra las jornadas que ya se pueden cerrar. La misma temporada, 1,2 segundos después de
empezar el partido:

```json
{
  "jornadaActual": 2,
  "proximosPartidos": ["partido-4"],
  "partidos": [
    { "id": "partido-1", "jornada": 1, "local": "theStrongest", "visitante": "aurora", "estado": "simulado", "marcador": { "local": 0, "visitante": 1 }, "partida": null },
    { "id": "partido-2", "jornada": 1, "local": "wilstermann", "visitante": "bolivar", "estado": "jugado", "marcador": { "local": 0, "visitante": 0 }, "partida": "p_927fc592" }
  ],
  "tabla": [
    { "equipo": "aurora", "jugados": 1, "puntos": 3, "diferencia": 1 },
    { "equipo": "bolivar", "jugados": 1, "puntos": 1, "diferencia": 0 },
    { "equipo": "wilstermann", "jugados": 1, "puntos": 1, "diferencia": 0 },
    { "equipo": "theStrongest", "jugados": 1, "puntos": 0, "diferencia": -1 }
  ]
}
```

El partido de Bolívar terminó 0 a 0 porque duró un segundo: quedó `jugado`. Como ya no quedaba ninguna
persona por jugar en la jornada 1, el otro partido se simuló (Aurora ganó 1 a 0) y la temporada pasó a
la jornada 2. Las filas de la tabla van recortadas a los campos que cambian.

Cuando se juega el último partido, `estado` pasa a `"finalizada"`, `jornadaActual` a `null` y `campeon`
al primero de la tabla.

Errores reales:

| Situación | Código | Respuesta |
|---|---|---|
| Adelantar un partido de otra jornada | `400` | `{ "error": "Primero hay que terminar la jornada 2" }` |
| Jugar un partido donde no hay personas | `400` | `{ "error": "En ese partido no juega nadie: lo resuelve el servidor" }` |
| Volver a jugar un partido con resultado | `409` | `{ "error": "Ese partido ya se jugó" }` |
| Tomar el rival con una sola persona | `400` | `{ "error": "Solo un segundo jugador puede tomar el control del rival" }` |
| Crear con `"humanos": []` | `400` | `{ "error": "Elige uno o dos equipos para jugar la temporada" }` |
| La temporada no existe | `404` | `{ "error": "Esa temporada no existe" }` |

Tiempo de respuesta medido contra el servidor local, con 10 partidas por dificultad desde la formación
inicial: 28 ms en fácil, 60 ms en medio y 140 ms en difícil. La diferencia es la cantidad de tiros que
simula antes de elegir: 3, 12 y 36.

## Emotes

### `POST /api/partidas/:id/emotes`

Lanza una carita sobre las cinco tapitas de un jugador. Se puede en cualquier momento, sea o no su
turno. El servidor valida la espera y guarda cuándo se lanzó; la duración y la espera se calculan al
responder, igual que el reloj del turno.

| Campo | Qué es |
|---|---|
| `lado` | Quién lo lanza: `"local"` o `"visitante"`. |
| `emote` | `"dormido"`, `"enojado"`, `"enojadoSerio"`, `"feliz"`, `"felizEuforico"`, `"llorando"` o `"sorprendido"`. |

Solicitud:

```json
{ "lado": "local", "emote": "felizEuforico" }
```

Respuesta `200`: el objeto `Partida` completo. Lo que cambia está en los jugadores:

```json
{
  "local": {
    "lado": "local",
    "equipo": "bolivar",
    "tipo": "humano",
    "dificultad": null,
    "tirosDePoder": 2,
    "emote": { "id": "felizEuforico", "segundosRestantes": 5 },
    "esperaEmote": 15
  },
  "visitante": {
    "lado": "visitante",
    "equipo": "theStrongest",
    "tipo": "humano",
    "dificultad": null,
    "tirosDePoder": 2,
    "emote": null,
    "esperaEmote": 0
  }
}
```

Cada jugador tiene su propia espera: el visitante puede lanzar el suyo aunque el local esté esperando.
A los 5 segundos `emote` vuelve a `null`, y a los 15 `esperaEmote` llega a `0`. Para las pruebas se
pueden acortar con `duracionEmoteSegundos` y `esperaEmoteSegundos` al crear la partida.

Errores reales:

| Situación | Código | Respuesta |
|---|---|---|
| Otro emote antes de los 15 segundos | `400` | `{ "error": "Espera unos segundos para volver a usar un emote" }` |
| Por el equipo que maneja el servidor | `400` | `{ "error": "Ese jugador no es tuyo" }` |
| `"emote": "bailando"` o falta `lado` | `400` | `{ "error": "Ese emote no existe" }` |
| Partida terminada | `409` | `{ "error": "La partida ya terminó" }` |
| La partida no existe | `404` | `{ "error": "Esa partida no existe" }` |
